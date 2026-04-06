const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('AIzaSyCm0Zzl8nB0GWTgZmbAKvVo_D5IvjJEN4E');

async function test() {
  const modelsToTest = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
  for (const m of modelsToTest) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent('hi');
      console.log(m, "WORKS!");
    } catch (e) {
      console.log(m, "ERROR:", e.statusText || e.message);
    }
  }
}
test();
