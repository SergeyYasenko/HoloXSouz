#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/../src/assets/holo"

THRESHOLD=1500000

for src in Build*.mp4; do
   if [[ ! -f "$src" ]]; then
      continue
   fi

   size_bytes=$(stat -c%s "$src")
   if (( size_bytes <= THRESHOLD )); then
      echo "Пропуск: $src (${size_bytes} bytes) <= ${THRESHOLD}"
      continue
   fi

   tmp="${src%.mp4}.tmp.mp4"
   echo "Сжатие $src (${size_bytes} bytes > ${THRESHOLD}) ..."
   ffmpeg -i "$src" -c:v libx264 -crf 32 -preset medium -an -movflags +faststart -vf "scale=1920:-2" -y "$tmp"
   mv -f "$tmp" "$src"
   echo "Готово: $src"
done

echo "Сжатие завершено."
