
firebase.initializeApp({
  apiKey: "AIzaSyBpQx0-8bm5ixwWENLE_aOc8UHAWMKXCqE",
  authDomain: "song-ab616.firebaseapp.com",
  databaseURL: "https://song-ab616-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "song-ab616"
});
const db = firebase.database();

function buzz(){
  const r = document.getElementById('room').value;
  const n = document.getElementById('name').value;
  if(!r || !n){
    alert('กรุณากรอกห้องและชื่อ');
    return;
  }
  db.ref("rooms/"+r+"/buzz").transaction(v => v || n);
}

// --- QR scanner integration using html5-qrcode ---
let qrScanner = null;

function startScan(){
  const reader = document.getElementById('reader');
  reader.classList.remove('hidden');
  if(qrScanner) return;
  qrScanner = new Html5QrcodeScanner(
    "reader",
    { fps: 10, qrbox: 250 },
    false
  );
  qrScanner.render(onScanSuccess, onScanError);
}

function stopScan(){
  const reader = document.getElementById('reader');
  if(qrScanner){
    qrScanner.clear().then(() => {
      qrScanner = null;
      reader.classList.add('hidden');
    }).catch(() => {
      qrScanner = null;
      reader.classList.add('hidden');
    });
  } else {
    reader.classList.add('hidden');
  }
}

function onScanSuccess(decodedText, decodedResult){
  const roomCode = parseRoomFromText(decodedText);
  if(roomCode){
    document.getElementById('room').value = roomCode;
  }
  stopScan();
}

function onScanError(errorMessage){
  // ignore non-fatal scan errors
}

function parseRoomFromText(text){
  try{
    const u = new URL(text);
    return u.searchParams.get('room') || u.searchParams.get('r') || u.pathname.split('/').pop();
  }catch(e){
    return text.trim();
  }
}

// --- Quiz player logic ---
let playerId = null;
let currentRoom = null;
let currentQuestionListener = null;
let timerInterval = null;

function joinRoom(){
  const r = document.getElementById('room').value;
  const n = document.getElementById('name').value || ('P'+Math.floor(Math.random()*1000));
  if(!r){ alert('กรุณากรอกรหัสห้องก่อน Join'); return; }
  playerId = n;
  currentRoom = r;
  // write player entry
  db.ref("rooms/"+r+"/players/"+playerId).set({ name: n });
  // listen for current question
  if(currentQuestionListener) currentQuestionListener.off();
  const ref = db.ref("rooms/"+r+"/current");
  ref.on('value', snap => {
    const q = snap.val();
    if(!q){ document.getElementById('questionArea').classList.add('hidden'); return; }
    showQuestion(q);
  });
  currentQuestionListener = ref;
  alert('เข้าร่วมห้อง: '+r);
}

function showQuestion(q){
  document.getElementById('questionArea').classList.remove('hidden');
  document.getElementById('prompt').innerText = q.prompt;
  const choicesDiv = document.getElementById('choices');
  choicesDiv.innerHTML = '';
  // build choice buttons
  q.choices.forEach((c, i) => {
    const btn = document.createElement('button');
    btn.className = 'w-full bg-white text-black p-2 rounded text-left';
    btn.innerText = c;
    btn.dataset.index = i;
    btn.onclick = () => submitAnswer(i);
    choicesDiv.appendChild(btn);
  });

  // hide previous result area
  const resultEl = document.getElementById('result');
  if(resultEl) resultEl.innerHTML = '';

  // timer display
  if(timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(()=> {
    const leftMs = q.endsAt - Date.now();
    const left = Math.max(0, Math.ceil(leftMs/1000));
    document.getElementById('timeLeft').innerText = left;
    if(left<=0){
      clearInterval(timerInterval);
      // disable buttons when time's up
      Array.from(choicesDiv.children).forEach(b => b.disabled = true);
    }
  },250);

  // If host has attached the 'correct' field (after scoring), reveal correct and show per-player results
  if(q.correct !== undefined){
    revealCorrect(q);
  }
}

function revealCorrect(q){
  const choicesDiv = document.getElementById('choices');
  const correctIdx = q.correct;
  Array.from(choicesDiv.children).forEach(btn => {
    const idx = parseInt(btn.dataset.index, 10);
    if(idx === correctIdx){
      btn.classList.add('bg-green-400');
    } else {
      btn.classList.add('opacity-60');
    }
    btn.disabled = true;
  });
  // show result text (per-player) if available
  const resultEl = document.getElementById('result') || (() => {
    const el = document.createElement('div');
    el.id = 'result';
    el.className = 'mt-3 text-sm bg-white/5 p-2 rounded';
    document.getElementById('questionArea').appendChild(el);
    return el;
  })();
  // fetch lastResults from DB to show points (optional)
  if(!currentRoom) return;
  db.ref("rooms/"+currentRoom+"/lastResults").once('value').then(snap=>{
    const res = snap.val() || {};
    let html = '<strong>ผลคะแนนรอบนี้</strong><br>';
    Object.keys(res).forEach(pid=>{
      const r = res[pid];
      html += `${pid}: ${r.correct ? 'ถูก' : 'ผิด'} (+${r.points})<br>`;
    });
    resultEl.innerHTML = html;
  }).catch(()=>{});
}

function submitAnswer(choiceIndex){
  if(!currentRoom || !playerId) { alert('กรุณา Join ก่อนตอบ'); return; }
  const payload = { choice: choiceIndex, answeredAt: Date.now() };
  db.ref("rooms/"+currentRoom+"/answers/"+playerId).set(payload);
  // disable choices UI
  const choicesDiv = document.getElementById('choices');
  Array.from(choicesDiv.children).forEach(b => b.disabled = true);
}
