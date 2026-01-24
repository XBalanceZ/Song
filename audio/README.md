How to add audio clips for SongTrivia

- Create an `audio/` folder (already present) and put MP3 files there.
- Name files to match entries in `songs.js` (e.g. `audio/s1.mp3`, `audio/s2.mp3`).
- Alternatively you can use hosted URLs (CDN or public storage) and set the `audio` field in `songs.js` to that URL.

Quick download script:
- Run `./audio/download-sample.sh` to fetch a small sample MP3 (you need curl).

License:
- Ensure you have rights to use any audio you include.

Example in `songs.js`:
  audio: "audio/s1.mp3",
  clipStart: 10   # start at 10s into the file

