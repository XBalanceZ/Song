
firebase.initializeApp({
 apiKey: "AIzaSyBpQx0-8bm5ixwWENLE_aOc8UHAWMKXCqE",
 authDomain: "song-ab616.firebaseapp.com",
 databaseURL: "https://song-ab616-default-rtdb.asia-southeast1.firebasedatabase.app",
 projectId: "song-ab616"
});
const db = firebase.database();
const room = new URLSearchParams(location.search).get("room");

const statusEl = document.getElementById('status');
const scoresEl = document.getElementById('scores');
const timeLeftEl = document.getElementById('timeLeft');
const player = document.getElementById('player');

let timerInterval = null;
let stopTimeout = null;

if(!room){
  statusEl.innerText = "No room specified";
}

// Watch overall room state (status, scores)
db.ref("rooms/"+room).on("value", snap => {
  const d = snap.val(); if(!d) return;
  statusEl.innerText = d.status || "";
  // show scores (from /scores)
  scoresEl.innerHTML = "";
  if(d.scores){
    Object.keys(d.scores).forEach(pid => {
      scoresEl.innerHTML += `<li>${pid}: ${d.scores[pid]}</li>`;
    });
  }
});

// Listen for current question / audio clip
db.ref("rooms/"+room+"/current").on("value", snap => {
  const q = snap.val();
  // stop any previous timers/audio
  if(timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  if(stopTimeout) { clearTimeout(stopTimeout); stopTimeout = null; }
  timeLeftEl.innerText = "--";
  if(!q){
    player.pause();
    player.src = "";
    return;
  }

  statusEl.innerText = q.prompt || statusEl.innerText;

  // play audio clip if provided
  if(q.audio){
    try{
      player.src = q.audio;
      player.currentTime = q.clipStart || 0;
      player.play().catch(()=>{});
    }catch(e){
      console.warn("audio play error", e);
    }
  }

  // start timer display based on endsAt
  function updateTimer(){
    const leftMs = (q.endsAt || 0) - Date.now();
    const left = Math.max(0, Math.ceil(leftMs/1000));
    timeLeftEl.innerText = left;
    if(left <= 0){
      clearInterval(timerInterval);
      timerInterval = null;
      // stop audio when time's up
      try{ player.pause(); }catch(e){}
    }
  }
  updateTimer();
  timerInterval = setInterval(updateTimer, 250);

  // ensure audio stops after the time limit (in case endsAt drift)
  const remaining = Math.max(0, (q.endsAt || 0) - Date.now());
  stopTimeout = setTimeout(()=>{
    try{ player.pause(); }catch(e){}
    if(timerInterval){ clearInterval(timerInterval); timerInterval = null; }
    timeLeftEl.innerText = 0;
  }, remaining + 50);
});
