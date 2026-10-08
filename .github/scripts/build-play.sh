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
mkdir -p artifacts
if [[ "${SIGNED_RELEASE:-false}" == true ]]; then
  for name in ANDROID_KEYSTORE_BASE64 ANDROID_KEYSTORE_PASSWORD ANDROID_KEY_ALIAS ANDROID_KEY_PASSWORD; do
    [[ -n "${!name:-}" ]] || { echo "Secret ausente: $name"; exit 1; }
  done
  keyfile="$RUNNER_TEMP/play-upload.jks"
  trap 'rm -f "$keyfile"' EXIT
  printf '%s' "$ANDROID_KEYSTORE_BASE64" | base64 --decode > "$keyfile"
  chmod 600 "$keyfile"
  (cd android && ./gradlew assembleRelease bundleRelease \
    -Pandroid.injected.signing.store.file="$keyfile" \
    -Pandroid.injected.signing.store.password="$ANDROID_KEYSTORE_PASSWORD" \
    -Pandroid.injected.signing.key.alias="$ANDROID_KEY_ALIAS" \
    -Pandroid.injected.signing.key.password="$ANDROID_KEY_PASSWORD" \
    --no-daemon)
  bundle="artifacts/${APP_SLUG}-play.aab"
  apk_unsigned="android/app/build/outputs/apk/release/app-release-unsigned.apk"
  apk_aligned="artifacts/${APP_SLUG}-release-aligned.apk"
  apk="artifacts/${APP_SLUG}-release.apk"
  cp android/app/build/outputs/bundle/release/app-release.aab "$bundle"
  zipalign -p -f 4 "$apk_unsigned" "$apk_aligned"
  apksigner sign --ks "$keyfile" --ks-pass env:ANDROID_KEYSTORE_PASSWORD --ks-key-alias "$ANDROID_KEY_ALIAS" --key-pass env:ANDROID_KEY_PASSWORD --out "$apk" "$apk_aligned"
  apksigner verify --print-certs "$apk" > "$RUNNER_TEMP/apk-signature.txt"
  jarsigner -verify "$bundle" > "$RUNNER_TEMP/aab-signature.txt"
  grep -q 'jar verified' "$RUNNER_TEMP/aab-signature.txt"
  rm -f "$apk_aligned"
  echo 'APK assinado para teste e AAB assinado com a chave de upload. Envie o AAB ao Play Console.' > artifacts/LEIA-ME.txt
else
  (cd android && ./gradlew assembleRelease bundleRelease --no-daemon)
  cp android/app/build/outputs/bundle/release/app-release.aab "artifacts/${APP_SLUG}-play.aab"
  cp android/app/build/outputs/apk/release/app-release-unsigned.apk "artifacts/${APP_SLUG}-release-unsigned.apk"
  echo 'Artefatos de validação SEM assinatura: não enviar à loja.' > artifacts/LEIA-ME.txt
fi
sha256sum artifacts/*.{aab,apk} > artifacts/SHA256SUMS.txt 2>/dev/null || true
cat artifacts/LEIA-ME.txt >> "$GITHUB_STEP_SUMMARY"
