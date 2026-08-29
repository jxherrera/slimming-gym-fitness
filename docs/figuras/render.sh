#!/bin/bash
# Renderiza a PNG (2x) cada SVG de esta carpeta usando Chrome sin interfaz.
cd "$(dirname "$0")"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if [ $# -gt 0 ]; then archivos=("$@"); else archivos=(figura-*.svg); fi
for f in "${archivos[@]}"; do
  [ -e "$f" ] || continue
  base="${f%.svg}"
  W=$(sed -n 's/.*<svg[^>]*width="\([0-9]*\)".*/\1/p' "$f" | head -1)
  H=$(sed -n 's/.*height="\([0-9]*\)".*/\1/p' "$f" | head -1)
  "$CHROME" --headless --disable-gpu --no-sandbox --hide-scrollbars \
    --screenshot="$base.png" --window-size="$W,$H" \
    --force-device-scale-factor=2 --default-background-color=FFFFFFFF "$f" 2>/dev/null
  echo "$base.png  (${W}x${H} @2x)"
done
