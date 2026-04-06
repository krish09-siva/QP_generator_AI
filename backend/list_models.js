require('dotenv').config();
async function test() {
  try {
    const result = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await result.json();
    console.log(JSON.stringify(data, null, 2));
  } catch(e) { console.error(e.message); }
}
test();
