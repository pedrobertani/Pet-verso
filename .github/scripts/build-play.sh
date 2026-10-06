#!/usr/bin/env bash
set -euo pipefail
python3 - <<'PYTHON'
import json, os, re
from pathlib import Path
version=json.loads(Path('package.json').read_text())['version']
code=int(os.environ['VERSION_CODE'])
if not 1 <= code <= 2100000000: raise SystemExit('versionCode fora do intervalo permitido')
p=Path('android/app/build.gradle')
s=p.read_text()
s=re.sub(r'versionCode \d+', f'versionCode {code}', s)
s=re.sub(r'versionName "[^"]*"', f'versionName "{version}"', s)
p.write_text(s)
PYTHON
chmod +x android/gradlew
(cd android && ./gradlew bundleRelease --no-daemon)
mkdir -p artifacts
bundle="artifacts/${APP_SLUG}-play.aab"
cp android/app/build/outputs/bundle/release/app-release.aab "$bundle"
if [[ "${SIGNED_RELEASE:-false}" == true ]]; then
  for name in ANDROID_KEYSTORE_BASE64 ANDROID_KEYSTORE_PASSWORD ANDROID_KEY_ALIAS ANDROID_KEY_PASSWORD; do
    [[ -n "${!name:-}" ]] || { echo "Secret ausente: $name"; exit 1; }
  done
  keyfile="$RUNNER_TEMP/play-upload.jks"
  trap 'rm -f "$keyfile"' EXIT
  printf '%s' "$ANDROID_KEYSTORE_BASE64" | base64 --decode > "$keyfile"
  chmod 600 "$keyfile"
  jarsigner -keystore "$keyfile" -storepass:env ANDROID_KEYSTORE_PASSWORD -keypass:env ANDROID_KEY_PASSWORD "$bundle" "$ANDROID_KEY_ALIAS"
  jarsigner -verify "$bundle" > "$RUNNER_TEMP/play-signature.txt"
  grep -q 'jar verified' "$RUNNER_TEMP/play-signature.txt"
  echo 'AAB assinado com a chave de upload. Envie manualmente ao Play Console.' > artifacts/LEIA-ME.txt
else
  echo 'AAB de validação SEM assinatura: não enviar à loja. Execute manualmente com signed_release e os quatro secrets Android.' > artifacts/LEIA-ME.txt
fi
sha256sum "$bundle" > artifacts/SHA256SUMS.txt
cat artifacts/LEIA-ME.txt >> "$GITHUB_STEP_SUMMARY"
