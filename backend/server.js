const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');
const multer = require('multer');

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // <-- support form-urlencoded too

const PORT = process.env.PORT || 5000;

if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is missing from .env!');
  process.exit(1);
}
console.log('✅ GEMINI_API_KEY loaded, starts with:', process.env.GEMINI_API_KEY.substring(0, 8) + '...');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
const upload = multer({ storage: multer.memoryStorage() });

const paperSchema = {
  type: SchemaType.OBJECT,
  properties: {
    title: { type: SchemaType.STRING },
    subject: { type: SchemaType.STRING },
    duration: { type: SchemaType.STRING },
    totalMarks: { type: SchemaType.NUMBER },
    sections: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          sectionTitle: { type: SchemaType.STRING },
          instructions: { type: SchemaType.STRING },
          questions: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                question: { type: SchemaType.STRING },
                marks: { type: SchemaType.NUMBER },
                hasInternalChoice: { type: SchemaType.BOOLEAN },
                internalChoice: {
                  type: SchemaType.OBJECT,
                  nullable: true,
                  properties: {
                    question: { type: SchemaType.STRING },
                    marks: { type: SchemaType.NUMBER }
                  }
                }
              },
              required: ["question", "marks", "hasInternalChoice"]
            }
          }
        },
        required: ["sectionTitle", "questions"]
      }
    }
  },
  required: ["title", "sections"]
};

// Health check / Welcome route
app.get('/', (req, res) => {
  res.send('AI Question Paper Generator Backend is running! Send POST requests to /api/generate');
});

app.post('/api/generate', upload.single('syllabusFile'), async (req, res) => {
  try {
    let { subject, examType, syllabus, difficulty, sections, chapterAllocation } = req.body;

    console.log('\n📥 Received request:');
    console.log('  subject:', subject);
    console.log('  examType:', examType);
    console.log('  difficulty:', difficulty);
    console.log('  sections raw:', typeof sections, '|', String(sections).substring(0, 60));

    // Parse JSON strings (from FormData or URL-encoded body)
    if (typeof sections === 'string') {
      try { sections = JSON.parse(sections); }
      catch (e) { return res.status(400).json({ error: 'Invalid sections format: ' + e.message }); }
    }
    if (typeof chapterAllocation === 'string') {
      try { chapterAllocation = JSON.parse(chapterAllocation); }
      catch (e) { chapterAllocation = []; }
    }

    const totalMarksConstraint = req.body.marks ? req.body.marks : req.body.totalMarks;

    if (!subject) {
      return res.status(400).json({ error: 'Missing required field: subject is required.' });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: paperSchema
      }
    });

    let promptContext = `Syllabus/Units: ${syllabus || 'General topics for the subject'}`;
    let filePart = null;

    if (req.file) {
      filePart = {
        inlineData: {
          data: req.file.buffer.toString("base64"),
          mimeType: req.file.mimetype
        }
      };
      promptContext = "Carefully analyze the attached syllabus file to generate the questions.";
    }

    let allocationConstraint = '';
    if (chapterAllocation && Array.isArray(chapterAllocation) && chapterAllocation.length > 0) {
      allocationConstraint = `
      CHAPTER DISTRIBUTION:
      ${chapterAllocation.map(c => `- Chapter '${c.chapterName}': Exactly ${c.questionCount} questions.`).join('\n')}
      `;
    }

    const sectionsInfo = (sections && sections.length > 0) 
                         ? JSON.stringify(sections) 
                         : `Please create standard sections (e.g., Section A, Section B) that sum up to ${totalMarksConstraint || 100} marks.`;

    const promptText = `
      You are an expert ${subject} teacher. Create a ${examType || 'General'} examination question paper:
      - ${promptContext}
      - Difficulty: ${difficulty || 'Medium'}
      - Sections constraint: ${sectionsInfo}
      ${allocationConstraint}

      Rules:
      - If strict sections were provided with 'numQuestions', generate exactly that many questions per section.
      - Each question's marks must be appropriate. If 'marksPerQuestion' is given, adhere to it strictly.
      - If section hasInternalChoice is true, set hasInternalChoice to true and provide an internalChoice object with 'question' and 'marks'.
      - If section hasInternalChoice is false, set hasInternalChoice to false and internalChoice to null.
      - Questions must be clear, academic, and non-repetitive.
      - Calculate totalMarks as sum of all section marks. Ensure it matches ${totalMarksConstraint || "the sum"}.
      - Duration should be proportional to total marks (e.g., 1 hour per 30 marks).
    `;

    const requestParts = filePart ? [filePart, promptText] : [promptText];

    console.log('🤖 Calling Gemini API (model: gemini-2.5-flash)...');

    const result = await model.generateContent(requestParts);
    const rawText = result.response.text();

    console.log('\n--- RAW GEMINI RESPONSE ---');
    console.log(rawText.length > 500 ? rawText.substring(0, 500) + '... (truncated)' : rawText);
    console.log('✅ Gemini responded, parsing JSON...');

    let paperJSON;
    try {
      paperJSON = JSON.parse(rawText);
    } catch (parseError) {
      console.error('❌ Failed to parse JSON. Raw response was:', rawText);
      return res.status(500).json({ error: 'Failed to generate question paper. Invalid JSON returned by AI.' });
    }

    console.log('✅ Paper generated:', paperJSON.title, '| Sections:', paperJSON.sections?.length);

    return res.json(paperJSON);

  } catch (error) {
    console.error('\n❌ Error generating question paper:');
    console.error('  Message:', error.message);
    console.error('  Status:', error.status || 'N/A');
    console.error('  Code:', error.code || 'N/A');
    if (error.errorDetails) console.error('  Details:', JSON.stringify(error.errorDetails));
    console.error('  Full Error Object:', error);

    const userMessage = error.message?.includes('API_KEY') || error.message?.includes('403')
      ? 'Invalid or expired Gemini API key. Please check your .env file.'
      : error.message?.includes('429')
        ? 'Gemini API rate limit reached. Please wait and try again.'
        : 'Failed to generate question paper. Please try again.';

    return res.status(500).json({ error: userMessage });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;
