// Sample songs/questions for SongTrivia
// Each item: { id, prompt, choices: [], answer: index }
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
  },
  {
    id: "s4",
    prompt: "ชื่ออัลบั้มที่ออกพร้อมเพลงนี้คืออะไร?",
    choices: ["Album A", "Greatest Hits", "The Debut", "Sample Album"],
    answer: 0
  },
  {
    id: "s5",
    prompt: "ปีที่ปล่อยเพลงคือปีใด?",
    choices: ["2018", "2019", "2020", "2021"],
    answer: 3
  }
];

// Export for UMD/simple include
if(typeof window !== 'undefined') window.SONGS = SONGS;

