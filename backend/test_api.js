

async function testAPI() {
  const url = 'http://localhost:5000/api/generate';
  const body = {
    subject: "DAA",
    examType: "SEM",
    difficulty: "Medium",
    marks: 100
  };

  try {
    console.log('Sending request to', url, 'with body:', JSON.stringify(body, null, 2));
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const status = response.status;
    const data = await response.text();
    require('fs').writeFileSync('out.json', JSON.stringify({ status, body: JSON.parse(data) }, null, 2));
    console.log('Successfully wrote out.json');
  } catch (err) {
    console.error('Test API failed:', err);
  }
}

testAPI();
