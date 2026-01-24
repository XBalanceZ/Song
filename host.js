const roomCode = Math.random().toString(36).substring(2,7).toUpperCase();
document.getElementById("room").innerText = "ROOM: " + roomCode;
const roomRef = db.ref("rooms/" + roomCode);
roomRef.set({status:"waiting"});

let player = null;
let ytReady = false;
let countdownId = null;

// Called by YouTube IFrame API when ready
window.onYouTubeIframeAPIReady = function(){
  ytReady = true;
  player = new YT.Player('player', {
    height: '0',
    width: '0',
    videoId: '',
    events: {
      onReady: function() { /* ready */ }
    }
  });
};

function startRound(){
  if (typeof SONGS === "undefined") {
    console.error("SONGS not loaded");
    return;
  }
  // สุ่ม category -> สุ่มเพลง
  const cats = Object.keys(SONGS);
  const cat = cats[Math.floor(Math.random()*cats.length)];
  const song = SONGS[cat][Math.floor(Math.random()*SONGS[cat].length)];

  // update room in DB
  roomRef.update({
    status: "playing",
    song: { title: song.answer, youtube: song.id, category: cat },
    start: Date.now(),
    duration: 10
  });

  // play locally (if YouTube API ready)
  playSong(song.id, 10);
  startCountdown(10);
}

function playSong(id, seconds=10){
  if (ytReady && player && typeof player.loadVideoById === "function"){
    player.loadVideoById({videoId: id, startSeconds: 0});
    // ensure stop after duration
    setTimeout(()=> {
      try{ player.stopVideo(); } catch(e){/*ignore*/ }
    }, seconds*1000);
  } else {
    console.warn("YouTube API not ready yet - cannot play");
  }
}

function startCountdown(sec){
  clearInterval(countdownId);
  let t = sec;
  const el = document.getElementById("timer");
  if(el) el.innerText = t;
  countdownId = setInterval(()=>{
    t--;
    if(el) el.innerText = t;
    if(t<=0){
      clearInterval(countdownId);
      roomRef.update({status: "waiting"});
      calcScore();
    }
  },1000);
}

function calcScore(){
  roomRef.child("players").once("value",snap=>{
    let html="";
    snap.forEach(p=>{
      html += `<div>${p.key} : ${p.val().score||0}</div>`;
    });
    document.getElementById("players").innerHTML=html;
  });
}

roomRef.child("players").on("value", snap=>{
  let html="";
  snap.forEach(p=>{
    html += `<div>${p.key} : ${p.val().score||0}</div>`;
  });
  document.getElementById("players").innerHTML=html;
});