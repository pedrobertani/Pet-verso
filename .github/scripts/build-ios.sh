#!/usr/bin/env bash
set -euo pipefail
: "${RUNNER_TEMP:?}"
: "${APP_SLUG:?}"
mkdir -p artifacts
version="$(node -p "require('./package.json').version")"
bundle_id="$(node -p "require('./ios/App/App/capacitor.config.json').appId")"
build_number="$(node -p "require('./package.json').version.split('.').reduce((n,v)=>n*100+Number(v),0)")"
project=ios/App/App.xcodeproj
xcodebuild -version
xcodebuild -project "$project" -scheme App -configuration Release \
  -destination 'generic/platform=iOS Simulator' \
  -derivedDataPath "$RUNNER_TEMP/ios-simulator" \
  MARKETING_VERSION="$version" CURRENT_PROJECT_VERSION="$build_number" \
  CODE_SIGNING_ALLOWED=NO build > "$RUNNER_TEMP/ios-simulator.log" 2>&1 || {
    tail -80 "$RUNNER_TEMP/ios-simulator.log"; exit 1;
  }
ditto -c -k --sequesterRsrc --keepParent \
  "$RUNNER_TEMP/ios-simulator/Build/Products/Release-iphonesimulator/App.app" \
  "artifacts/$APP_SLUG-ios-simulador.zip"
if [[ "${IOS_SIGNED:-false}" != "true" ]]; then
  cat > artifacts/LEIA-ME.txt <<'TXT'
Esta versão .app é para o simulador de iPhone do Xcode, não para instalar em iPhone físico.
Para gerar um IPA assinado, configure os quatro Secrets IOS_* descritos no README
e execute esta Action manualmente com a opção de assinatura ativada.
TXT
  exit 0
fi
for secret_name in IOS_CERTIFICATE_P12_BASE64 IOS_CERTIFICATE_PASSWORD IOS_PROVISIONING_PROFILE_BASE64 IOS_TEAM_ID; do
  [[ -n "${!secret_name:-}" ]] || { echo "Configure o Secret $secret_name para gerar o IPA assinado."; exit 1; }
done
export IOS_BUNDLE_ID="$bundle_id"
python3 - <<'PY'
import os,base64
from pathlib import Path
root=Path(os.environ['RUNNER_TEMP'])
for key,name in [('IOS_CERTIFICATE_P12_BASE64','ios-certificate.p12'),('IOS_PROVISIONING_PROFILE_BASE64','ios-profile.mobileprovision')]:
    p=root/name;p.write_bytes(base64.b64decode(os.environ[key],validate=True));p.chmod(0o600)
PY
keychain="$RUNNER_TEMP/ios-build.keychain-db"
keychain_password="$(openssl rand -hex 32)"
security create-keychain -p "$keychain_password" "$keychain"
security set-keychain-settings -lut 21600 "$keychain"
security unlock-keychain -p "$keychain_password" "$keychain"
security import "$RUNNER_TEMP/ios-certificate.p12" -P "$IOS_CERTIFICATE_PASSWORD" -A -t cert -f pkcs12 -k "$keychain" >/dev/null
security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k "$keychain_password" "$keychain" >/dev/null
security list-keychains -d user -s "$keychain" "$HOME/Library/Keychains/login.keychain-db"
security cms -D -i "$RUNNER_TEMP/ios-profile.mobileprovision" > "$RUNNER_TEMP/ios-profile.plist"
python3 - <<'PY'
import os,plistlib,datetime,shutil
from pathlib import Path
root=Path(os.environ['RUNNER_TEMP'])
p=plistlib.loads((root/'ios-profile.plist').read_bytes())
team=os.environ['IOS_TEAM_ID'];bundle=os.environ['IOS_BUNDLE_ID']
if team not in p.get('TeamIdentifier',[]):raise SystemExit('O perfil não pertence à equipe configurada.')
if p.get('Entitlements',{}).get('application-identifier')!=team+'.'+bundle:raise SystemExit('O perfil não corresponde ao identificador deste app.')
if not p.get('ProvisionedDevices'):raise SystemExit('Use um perfil Ad Hoc com os iPhones de teste cadastrados.')
if p.get('Entitlements',{}).get('get-task-allow'):raise SystemExit('Use certificado de distribuição e perfil Ad Hoc, não Development.')
if p['ExpirationDate']<=datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None):raise SystemExit('O perfil de provisionamento está vencido.')
uuid=p['UUID'];(root/'ios-profile-uuid.txt').write_text(uuid)
target=Path.home()/'Library/MobileDevice/Provisioning Profiles';target.mkdir(parents=True,exist_ok=True)
shutil.copyfile(root/'ios-profile.mobileprovision',target/(uuid+'.mobileprovision'))
export={'method':'release-testing','teamID':team,'signingStyle':'manual','signingCertificate':'Apple Distribution','provisioningProfiles':{bundle:uuid},'stripSwiftSymbols':True}
(root/'ios-export-options.plist').write_bytes(plistlib.dumps(export))
PY
profile_uuid="$(cat "$RUNNER_TEMP/ios-profile-uuid.txt")"
xcodebuild -project "$project" -scheme App -configuration Release \
  -destination 'generic/platform=iOS' -archivePath "$RUNNER_TEMP/App.xcarchive" \
  MARKETING_VERSION="$version" CURRENT_PROJECT_VERSION="$build_number" \
  DEVELOPMENT_TEAM="$IOS_TEAM_ID" CODE_SIGN_STYLE=Manual \
  CODE_SIGN_IDENTITY='Apple Distribution' PROVISIONING_PROFILE_SPECIFIER="$profile_uuid" \
  OTHER_CODE_SIGN_FLAGS="--keychain $keychain" archive > "$RUNNER_TEMP/ios-archive.log" 2>&1 || {
    tail -80 "$RUNNER_TEMP/ios-archive.log"; exit 1;
  }
xcodebuild -exportArchive -archivePath "$RUNNER_TEMP/App.xcarchive" \
  -exportOptionsPlist "$RUNNER_TEMP/ios-export-options.plist" \
  -exportPath "$RUNNER_TEMP/ios-export" > "$RUNNER_TEMP/ios-export.log" 2>&1 || {
    tail -80 "$RUNNER_TEMP/ios-export.log"; exit 1;
  }
cp "$RUNNER_TEMP/ios-export/App.ipa" "artifacts/$APP_SLUG-ios-teste.ipa"
