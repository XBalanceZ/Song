
firebase.initializeApp({
  apiKey: "AIzaSyBpQx0-8bm5ixwWENLE_aOc8UHAWMKXCqE",
  authDomain: "song-ab616.firebaseapp.com",
  databaseURL: "https://song-ab616-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "song-ab616"
});
const db = firebase.database();

// Auto quiz (SongTrivia) host controller
let quizInterval = null;
let currentRoom = null;
let currentIndex = 0;
let questionEndTs = 0;

function createRoom(){
  const r = document.getElementById('room').value;
  if(!r){ alert('กรุณากรอกรหัสห้อง'); return; }
  currentRoom = r;
  db.ref("rooms/"+r).set({ status: "Ready", players: {}, scores: {} });
  document.getElementById('info').innerText = "สร้างห้องแล้ว: " + r;
}

function startQuiz(){
  const r = document.getElementById('room').value;
  if(!r){ alert('กรุณากรอกรหัสห้อง'); return; }
  currentRoom = r;
  const qtime = parseInt(document.getElementById('qtime').value || '15', 10) * 1000;
  currentIndex = 0;
  db.ref("rooms/"+r+"/status").set("Quiz starting");
  advanceQuestion(qtime);
  quizInterval = setInterval(()=> advanceQuestion(qtime), qtime + 1000);
  document.getElementById('info').innerText = "Quiz started";
}

function stopQuiz(){
  if(quizInterval) clearInterval(quizInterval);
  quizInterval = null;
  if(currentRoom) db.ref("rooms/"+currentRoom+"/status").set("Quiz stopped");
  document.getElementById('info').innerText = "Quiz stopped";
}

function advanceQuestion(qtime){
  if(!currentRoom) return;
  if(!window.SONGS || SONGS.length===0){
    db.ref("rooms/"+currentRoom+"/status").set("No questions");
    return;
  }
  const q = SONGS[currentIndex % SONGS.length];
  const now = Date.now();
  questionEndTs = now + qtime;
  // publish question to room
  db.ref("rooms/"+currentRoom+"/current").set({
    index: currentIndex,
    id: q.id,
    prompt: q.prompt,
    choices: q.choices,
    endsAt: questionEndTs,
    timeLimitMs: qtime,
    audio: q.audio || null,
    clipStart: q.clipStart || 0
  });
  // clear previous answers
  db.ref("rooms/"+currentRoom+"/answers").set(null);
  db.ref("rooms/"+currentRoom+"/status").set("Question "+(currentIndex+1));
  // schedule scoring when ends
  setTimeout(()=> scoreQuestion(currentRoom, currentIndex, qtime), qtime);
  currentIndex++;
}

async function scoreQuestion(room, index, qtime){
  const snap = await db.ref("rooms/"+room+"/answers").once('value');
  const answers = snap.val() || {};
  // read existing scores
  const scoresSnap = await db.ref("rooms/"+room+"/scores").once('value');
  const scores = scoresSnap.val() || {};

  // compute per-player points based on correctness and answer time
  const results = {};
  const correctPlayers = [];
  Object.keys(answers).forEach(pid => {
    const a = answers[pid];
    if(a.choice === undefined || a.answeredAt===undefined) return;
    const correct = (a.choice === q.answer);
    let points = 0;
    if(correct){
      const delta = Math.max(0, questionEndTs - a.answeredAt); // ms remaining
      const base = Math.ceil((delta / qtime) * 100); // 0-100
      points = base;
      correctPlayers.push({ pid, answeredAt: a.answeredAt });
    }
    results[pid] = { choice: a.choice, answeredAt: a.answeredAt, correct, points };
  });

  // bonus to fastest correct responder
  if(correctPlayers.length > 0){
    correctPlayers.sort((a,b)=>a.answeredAt - b.answeredAt);
    const fastest = correctPlayers[0].pid;
    const BONUS = 20;
    results[fastest].points += BONUS;
  }

  // apply points to persistent scores
  Object.keys(results).forEach(pid=>{
    scores[pid] = (scores[pid] || 0) + (results[pid].points || 0);
  });

  await db.ref("rooms/"+room+"/scores").set(scores);
  // write results for clients to show per-round outcome
  await db.ref("rooms/"+room+"/lastResults").set(results);
  // reveal correct answer in /current so controllers/screens can show it
  await db.ref("rooms/"+room+"/current/correct").set(q.answer);
  await db.ref("rooms/"+room+"/status").set("Scored Q"+(index+1));
}

// --- Room helper: generate code + QR ---
function generateRoom(){
  const code = Math.random().toString(36).substr(2,5).toUpperCase();
  document.getElementById('room').value = code;
  updateQR(code);
}

function updateQR(code){
  const url = location.origin + '/controller.html?room=' + encodeURIComponent(code);
  const img = document.getElementById('qrimg');
  if(img){
    img.src = 'https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=' + encodeURIComponent(url);
    img.classList.remove('hidden');
  }
}
