
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
