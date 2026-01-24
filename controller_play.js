firebase.initializeApp({
  apiKey: "AIzaSyBpQx0-8bm5ixwWENLE_aOc8UHAWMKXCqE",
  authDomain: "song-ab616.firebaseapp.com",
  databaseURL: "https://song-ab616-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "song-ab616"
});
const db = firebase.database();

function qp(name){
  return new URLSearchParams(location.search).get(name) || sessionStorage.getItem(name) || '';
}

const currentRoom = qp('room');
const playerName = qp('name') || ('P'+Math.floor(Math.random()*1000));
const infoEl = document.getElementById('info');
const promptArea = document.getElementById('promptArea');
const promptEl = document.getElementById('prompt');
const choicesEl = document.getElementById('choices');
const timeLeftEl = document.getElementById('timeLeft');
const player = document.getElementById('player');
const unlockBtn = document.getElementById('unlockBtn');
const tapToPlay = document.getElementById('tapToPlay');
const waiting = document.getElementById('waiting');
const resultEl = document.getElementById('result');

let timerInterval = null;
let currentQuestionRef = null;

if(!currentRoom){
  infoEl.innerText = "ไม่มีรหัสห้อง";
} else {
  infoEl.innerText = `ห้อง: ${currentRoom} — ชื่อ: ${playerName}`;
  // register player
  db.ref("rooms/"+currentRoom+"/players/"+playerName).set({ name: playerName });
  waiting.classList.add('hidden');
  promptArea.classList.remove('hidden');
  // unlock button to allow user gesture to play audio if needed
  unlockBtn.addEventListener('click', () => {
    player.play().catch(()=>{});
    tapToPlay.style.display = 'none';
  });

  // listen for current question
  currentQuestionRef = db.ref("rooms/"+currentRoom+"/current");
  currentQuestionRef.on('value', snap => {
    const q = snap.val();
    if(!q){
      promptArea.classList.add('hidden');
      waiting.classList.remove('hidden');
      return;
    }
    waiting.classList.add('hidden');
    promptArea.classList.remove('hidden');
    showQuestion(q);
  });
}

function showQuestion(q){
  promptEl.innerText = q.prompt || '';
  // build choices
  choicesEl.innerHTML = '';
  q.choices.forEach((c, i) => {
    const btn = document.createElement('button');
    btn.className = 'w-full bg-white text-black p-4 rounded text-left text-xl';
    btn.innerText = c;
    btn.dataset.index = i;
    btn.onclick = () => submitAnswer(i);
    choicesEl.appendChild(btn);
  });
  resultEl.classList.add('hidden');

  // audio
  if(q.audio){
    player.src = q.audio;
    try{
      player.currentTime = q.clipStart || 0;
    }catch(e){}
    // attempt autoplay; if blocked, show unlock button
    player.play().then(()=> {
      tapToPlay.style.display = 'none';
    }).catch(()=> {
      tapToPlay.style.display = '';
    });
  } else {
    player.pause();
    player.src = '';
    tapToPlay.style.display = 'none';
  }

  // timer
  if(timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(()=> {
    const leftMs = (q.endsAt || 0) - Date.now();
    const left = Math.max(0, Math.ceil(leftMs/1000));
    timeLeftEl.innerText = left;
    if(left <= 0){
      clearInterval(timerInterval);
      timerInterval = null;
      // disable buttons
      Array.from(choicesEl.children).forEach(b => b.disabled = true);
      // show correct if available
      if(q.correct !== undefined){
        revealCorrect(q.correct);
      } else {
        // fetch lastResults to display
        db.ref("rooms/"+currentRoom+"/lastResults").once('value').then(snap=>{
          const res = snap.val() || {};
          showResults(res);
        }).catch(()=>{});
      }
    }
  }, 250);
}

function submitAnswer(idx){
  if(!currentRoom || !playerName) return;
  db.ref("rooms/"+currentRoom+"/answers/"+playerName).set({ choice: idx, answeredAt: Date.now() });
  // disable choices UI
  Array.from(choicesEl.children).forEach(b => b.disabled = true);
}

function revealCorrect(correctIdx){
  Array.from(choicesEl.children).forEach(btn => {
    const idx = parseInt(btn.dataset.index, 10);
    if(idx === correctIdx){
      btn.classList.add('bg-green-400');
    } else {
      btn.classList.add('opacity-60');
    }
  });
  // show lastResults
  db.ref("rooms/"+currentRoom+"/lastResults").once('value').then(snap=>{
    const res = snap.val() || {};
    showResults(res);
  }).catch(()=>{});
}

function showResults(res){
  resultEl.classList.remove('hidden');
  let html = '<strong>ผลคะแนนรอบนี้</strong><br>';
  Object.keys(res).forEach(pid=>{
    const r = res[pid];
    html += `${pid}: ${r.correct ? 'ถูก' : 'ผิด'} (+${r.points})<br>`;
  });
  resultEl.innerHTML = html;
}

