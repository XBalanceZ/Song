
firebase.initializeApp({
 apiKey: "AIzaSyBpQx0-8bm5ixwWENLE_aOc8UHAWMKXCqE",
 authDomain: "song-ab616.firebaseapp.com",
 databaseURL: "https://song-ab616-default-rtdb.asia-southeast1.firebasedatabase.app",
 projectId: "song-ab616"
});
const db=firebase.database();

function createRoom(){
 db.ref("rooms/"+room.value).set({status:"🎵 พร้อมเริ่ม!"});
 info.innerText="สร้างห้องแล้ว";
}

function resetBuzz(){
 db.ref("rooms/"+room.value+"/buzz").set(null);
 db.ref("rooms/"+room.value+"/status").set("⌛ รอคนกด");
}

function next(){
 db.ref("rooms/"+room.value+"/status").set("🎶 เพลงถัดไป!");
}
