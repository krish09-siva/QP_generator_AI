// Simulates exactly what the frontend ConfigurationForm sends to the backend
const { FormData, fetch } = globalThis;

const sections = JSON.stringify([
  { id: 1, name: "Section A", numQuestions: 3, marksPerQuestion: 2, hasInternalChoice: false },
  { id: 2, name: "Section B", numQuestions: 2, marksPerQuestion: 5, hasInternalChoice: true }
]);

const chapterAllocation = JSON.stringify([]);

// Use URLSearchParams to simulate FormData text fields (no file upload)
const body = new URLSearchParams();
body.append('subject', 'Computer Science');
body.append('examType', 'Mid-Term');
body.append('difficulty', 'Medium');
body.append('syllabus', 'Unit 1: Data Structures (Arrays, Linked Lists, Stacks). Unit 2: Algorithms (Sorting and Searching). Unit 3: OOP (Classes, Inheritance, Polymorphism).');
body.append('sections', sections);
body.append('chapterAllocation', chapterAllocation);

async function run() {
  console.log('📤 Sending request to backend...\n');
  try {
    const res = await fetch('http://localhost:5000/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('❌ HTTP Error', res.status, ':', errText);
      return;
    }

    const data = await res.json();

    console.log('✅ SUCCESS! Paper Generated:\n');
    console.log('  📄 Title:', data.title);
    console.log('  📚 Subject:', data.subject);
    console.log('  ⏱️  Duration:', data.duration);
    console.log('  🎯 Total Marks:', data.totalMarks);
    console.log('  📑 Sections:', data.sections?.length);
    console.log('');

    data.sections?.forEach((sec, i) => {
      console.log(`  [Section ${i+1}] ${sec.name} — ${sec.questions?.length} questions`);
      console.log(`    Instructions: ${sec.instructions || '(none)'}`);
      sec.questions?.slice(0, 2).forEach((q, qi) => {
        console.log(`    Q${qi+1} [${q.marks}m | choice=${q.hasInternalChoice}]:`);
        q.choices?.forEach((c, ci) => {
          console.log(`      ${ci === 0 ? 'A' : 'B'}: ${c.substring(0, 90)}...`);
        });
      });
      if (sec.questions?.length > 2) console.log(`    ... and ${sec.questions.length - 2} more questions`);
    });

  } catch (e) {
    console.error('❌ Fetch/Parse error:', e.message);
  }
}

run();
