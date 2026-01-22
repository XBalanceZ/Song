
let roomRef;

function join(){
 const r=document.getElementById("room").value;
 const n=document.getElementById("name").value;
 roomRef=db.ref("rooms/"+r+"/players/"+n);
 roomRef.set({score:0});
}

function send(){
 const ans=document.getElementById("answer").value;
 roomRef.update({answer:ans,score:10});
}
