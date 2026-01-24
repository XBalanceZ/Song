// same sample songs for docs site
const SONGS = [
  {
    id: "s1",
    prompt: "ศิลปินเพลง 'Lalala' คือใคร?",
    choices: ["BLACKPINK", "BNK48", "Da Vinci", "เพลงตัวอย่าง"],
    answer: 2
  },
  {
    id: "s2",
    prompt: "เพลงใดเป็นเพลงเปิดตัวของวงนี้?",
    choices: ["Debut Song", "First Hit", "Opening Track", "Sample Song"],
    answer: 1
  },
  {
    id: "s3",
    prompt: "ทำนองเพลงนี้มาจากประเทศใด?",
    choices: ["USA", "Thailand", "Korea", "Japan"],
    answer: 2
  }
];
if(typeof window !== 'undefined') window.SONGS = SONGS;

