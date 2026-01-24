#!/usr/bin/env bash
# Download a small MP3 sample into audio/sample.mp3
# You can replace the URL with any CC0 / permitted audio file.
mkdir -p "$(dirname "$0")"
OUT="audio/sample.mp3"
URL="https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_700KB.mp3"
echo "Downloading sample to $OUT ..."
curl -L --progress-bar "$URL" -o "$OUT"
echo "Done. Update songs.js to reference 'audio/sample.mp3'."
