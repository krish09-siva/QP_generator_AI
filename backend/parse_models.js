const fs = require('fs');
require('dotenv').config();
async function run() {
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + process.env.GEMINI_API_KEY);
  const data = await res.json();
  const models = data.models || [];
  const targets = models.filter(m => m.name.includes('flash'));
  fs.writeFileSync('flash_models.json', JSON.stringify(targets.map(m => m.name), null, 2), 'utf8');
}
run();
