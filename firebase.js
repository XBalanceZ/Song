
const firebaseConfig = {
 apiKey: "YOUR_API_KEY",
 authDomain: "YOUR_PROJECT.firebaseapp.com",
 databaseURL: "https://YOUR_PROJECT.firebaseio.com",
 projectId: "YOUR_PROJECT"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
