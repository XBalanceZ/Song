
let room = Math.floor(1000+Math.random()*9000);
roomCode.innerText = room;

let timer;
let player;

function startGame(){
 const cat = document.getElementById("category").value;
 const song = SONGS[cat][Math.floor(Math.random()*SONGS[cat].length)];
 db.ref("rooms/"+room).set({
  song:song,
  time:10,
  started:true
 });
 playSong(song.id);
 startTimer();
}

function playSong(id){
 player = new YT.Player('player',{
  videoId:id,
  playerVars:{autoplay:1,start:0,end:10}
 });
}

function startTimer(){
 let t=10;
 timer.innerText=t;
 timer=setInterval(()=>{
  t--;
  timer.innerText=t;
  if(t<=0){
   clearInterval(timer);
   calcScore();
  }
 },1000);
}

function calcScore(){
 db.ref("rooms/"+room+"/players").once("value",snap=>{
  scoreboard.innerHTML="";
  snap.forEach(p=>{
   let li=document.createElement("li");
   li.innerText=p.key+" : "+(p.val().score||0);
   scoreboard.appendChild(li);
  });
 });
}
