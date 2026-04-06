const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
async function test() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
     const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
     await model.generateContent('hi');
     console.log('SUCCESS');
  } catch(e) { console.error('FAILED:', e.message); }
}
test();
