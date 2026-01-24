
firebase.initializeApp({
 apiKey: "AIzaSyBpQx0-8bm5ixwWENLE_aOc8UHAWMKXCqE",
 authDomain: "song-ab616.firebaseapp.com",
 databaseURL: "https://song-ab616-default-rtdb.asia-southeast1.firebasedatabase.app",
 projectId: "song-ab616"
});
const db=firebase.database();
const room=new URLSearchParams(location.search).get("room");

db.ref("rooms/"+room).on("value",snap=>{
 const d=snap.val(); if(!d) return;
 status.innerText=d.status||"";
 scores.innerHTML="";
 if(d.players)
  Object.keys(d.players).forEach(p=>{
   scores.innerHTML+=`<li>${p}: ${d.players[p].score}</li>`
  })
});
