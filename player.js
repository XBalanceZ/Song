let roomRef, playerName;

function join(){
  const room = roomInput.value;
  playerName = nameInput.value;
  roomRef = db.ref("rooms/"+room);
  roomRef.child("players/"+playerName).set({score:0});
  document.getElementById("game").style.display="block";
}

function sendAnswer(){
  roomRef.child("answers/"+playerName).set({
    text: answer.value,
    time: Date.now()
  });
}