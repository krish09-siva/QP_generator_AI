const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/generate', upload.single('syllabusFile'), async (req, res) => {
  try {
    let { subject, examType, syllabus, difficulty, sections, chapterAllocation } = req.body;
    
    // Parse JSON arrays sent from FormData
    if (typeof sections === 'string') {
      sections = JSON.parse(sections);
    }
    if (typeof chapterAllocation === 'string') {
      chapterAllocation = JSON.parse(chapterAllocation);
    }

    if (!subject || !sections || sections.length === 0) {
      return res.status(400).json({ error: 'Missing required configuration' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    let promptContext = `Syllabus/Units: ${syllabus || 'Provided in attached file'}`;
    let filePart = null;

    if (req.file) {
      // Provide file inline
      filePart = {
        inlineData: {
          data: req.file.buffer.toString("base64"),
          mimeType: req.file.mimetype
        }
      };
      promptContext = "Syllabus details are provided in the attached file. Carefully analyze the attached file to generate the questions.";
    }

    let allocationConstraint = '';
    if (chapterAllocation && Array.isArray(chapterAllocation) && chapterAllocation.length > 0) {
      allocationConstraint = `
      CHAPTER DISTRIBUTION CONSTRAINTS:
      You must strictly distribute the questions across the specified chapters/topics as follows:
      ${chapterAllocation.map(c => `- Chapter/Topic '${c.chapterName}': Exactly ${c.questionCount} questions across the entire paper.`).join('\n')}
      Ensure the total questions you generate exactly fulfill these chapter distributions.
      `;
    }

    const promptText = `
      You are an expert ${subject} teacher. You need to create a question paper for a ${examType || 'General'} examination based on the following criteria:
      - ${promptContext}
      - Difficulty Level: ${difficulty}
      - Sections format: ${JSON.stringify(sections)}
      ${allocationConstraint}
      
      For each section, generate the required number of questions that add up to the total marks for that section.
      The questions should be clear, non-repetitive, and appropriate for the specified difficulty.
      If a section in the sections format requests 'hasInternalChoice: true', EVERY question within that section MUST have exactly 2 choices (Option A and Option B).
      
      Output ONLY a valid strictly formatted JSON object following this exact schema:
      {
        "title": "A string representing the paper title (e.g., '${subject} ${examType || 'Examination'}')",
        "subject": "${subject}",
        "totalMarks": Number (calculate total from all sections),
        "duration": "String (e.g., '3 Hours')",
        "sections": [
          {
            "name": "String (e.g., 'Section A')",
            "instructions": "String instructions for this section",
            "questions": [
              {
                "id": "Number",
                "hasInternalChoice": "Boolean (true or false based on the section requirement)",
                "choices": ["String (First option)", "String (Second option if hasInternalChoice is true)"],
                "marks": Number
              }
            ]
          }
        ]
      }
      
      If 'hasInternalChoice' is false, the 'choices' array should still contain exactly 1 element: the actual question.
      If 'hasInternalChoice' is true, the 'choices' array MUST contain exactly 2 distinct equivalent choices.
      Ensure the total marks match the section configurations.
      Do not include any markdown formatting around the JSON string. Do not include \`\`\`json. Return strictly the unformatted JSON string.
    `;

    const requestParts = filePart ? [filePart, promptText] : [promptText];

    const result = await model.generateContent(requestParts);
    let text = result.response.text();
    text = text.trim();
    if (text.startsWith('```json')) {
      text = text.replace(/^```json/g, '').replace(/```$/g, '').trim();
    }
    const paperJSON = JSON.parse(text);

    return res.json(paperJSON);
  } catch (error) {
    console.error('Error generating question paper:', error);
    return res.status(500).json({ error: 'Failed to generate question paper' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
