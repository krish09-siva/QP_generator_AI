import React, { useState } from 'react';
import { Plus, Trash2, ShieldAlert, FileText, Type, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const defaultSection = { id: Date.now(), name: 'Section A', numQuestions: 5, marksPerQuestion: 2, hasInternalChoice: false };

export default function ConfigurationForm({ onSubmit, isGenerating }) {
  const [subject, setSubject] = useState('');
  const [examType, setExamType] = useState('');
  const [inputType, setInputType] = useState('text'); // 'text' or 'file'
  const [syllabus, setSyllabus] = useState('');
  const [syllabusFile, setSyllabusFile] = useState(null);
  const [difficulty, setDifficulty] = useState('Medium');
  const [sections, setSections] = useState([{ ...defaultSection }]);
  const [chapterAllocation, setChapterAllocation] = useState([]);
  const [error, setError] = useState('');

  const handleAddSection = () => {
    setSections([
      ...sections,
      { id: Date.now(), name: `Section ${String.fromCharCode(65 + sections.length)}`, numQuestions: 5, marksPerQuestion: 5, hasInternalChoice: false }
    ]);
  };

  const handleRemoveSection = (id) => {
    if (sections.length === 1) return;
    setSections(sections.filter(s => s.id !== id));
  };

  const handleChangeSection = (id, field, value) => {
    setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSyllabusFile(e.target.files[0]);
    }
  };

  const handleAddChapter = () => {
    setChapterAllocation([
      ...chapterAllocation,
      { id: Date.now(), chapterName: '', questionCount: 1 }
    ]);
  };

  const handleRemoveChapter = (id) => {
    setChapterAllocation(chapterAllocation.filter(c => c.id !== id));
  };

  const handleChangeChapter = (id, field, value) => {
    setChapterAllocation(chapterAllocation.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim()) {
      setError('Subject is required.');
      return;
    }
    
    if (inputType === 'text' && !syllabus.trim()) {
      setError('Please provide syllabus text.');
      return;
    }

    if (inputType === 'file' && !syllabusFile) {
      setError('Please upload a syllabus file.');
      return;
    }

    if (sections.some(s => !s.name || s.numQuestions < 1 || s.marksPerQuestion < 1)) {
      setError('Please provide valid section details (Questions & Marks > 0).');
      return;
    }
    
    // Ensure all chapters have names if specified
    if (chapterAllocation.some(c => !c.chapterName.trim() || c.questionCount < 1)) {
      setError('Please provide valid Chapter allocations (Valid name & Count > 0).');
      return;
    }

    const totalQuestions = sections.reduce((acc, curr) => acc + (curr.numQuestions || 0), 0);
    const allocatedQuestions = chapterAllocation.reduce((acc, curr) => acc + (curr.questionCount || 0), 0);

    if (allocatedQuestions > totalQuestions) {
      setError(`Total allocated chapter questions (${allocatedQuestions}) exceed total paper questions (${totalQuestions}).`);
      return;
    }

    setError('');
    
    const formData = new FormData();
    formData.append('subject', subject);
    formData.append('examType', examType);
    formData.append('difficulty', difficulty);
    formData.append('sections', JSON.stringify(sections));
    
    if (chapterAllocation.length > 0) {
      formData.append('chapterAllocation', JSON.stringify(chapterAllocation));
    }
    
    if (inputType === 'file') {
      formData.append('syllabusFile', syllabusFile);
    } else {
      formData.append('syllabus', syllabus);
    }

    const totalMarks = sections.reduce((acc, curr) => acc + (curr.numQuestions * curr.marksPerQuestion), 0);
    onSubmit(formData, totalMarks); // pass forms and metadata if needed
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-3xl mx-auto glass rounded-2xl p-8"
      onSubmit={handleSubmit}
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Paper Configuration</h2>
        <p className="text-slate-500">Provide details so AI can generate the perfect test paper.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Subject Name</label>
          <input 
            type="text" 
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
            placeholder="e.g. Computer Science"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Exam Type</label>
          <input 
            type="text" 
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
            placeholder="e.g. Midterm, Final, Unit Test"
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Difficulty</label>
          <select 
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow bg-white"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-semibold text-slate-700">Syllabus Input Method</label>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              type="button"
              onClick={() => setInputType('text')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${inputType === 'text' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Type className="w-4 h-4" /> Text
            </button>
            <button 
              type="button"
              onClick={() => setInputType('file')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${inputType === 'file' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <FileText className="w-4 h-4" /> Upload File
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {inputType === 'text' ? (
            <motion.div key="text" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
              <textarea 
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow resize-none"
                placeholder="e.g. Unit 1: Data Structures (Arrays, Linked Lists, Trees), Unit 2: Algorithms"
                rows={4}
                value={syllabus}
                onChange={(e) => setSyllabus(e.target.value)}
              />
            </motion.div>
          ) : (
            <motion.div key="file" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
              <div className="w-full flex-col flex items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors relative cursor-pointer group">
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx,.txt"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
                <Upload className={`w-10 h-10 mb-3 ${syllabusFile ? 'text-indigo-500' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                {syllabusFile ? (
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-700">{syllabusFile.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{(syllabusFile.size / 1024).toFixed(2)} KB</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-700 mb-1">Click to upload syllabus file</p>
                    <p className="text-xs text-slate-500">Supports PDF, Word, or TXT documents</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">Sections Layout</h3>
          <button 
            type="button" 
            onClick={handleAddSection}
            className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Section
          </button>
        </div>

        <div className="space-y-4">
          {sections.map((section, idx) => (
            <motion.div 
              key={section.id} 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              className="flex flex-col gap-4 bg-white p-5 rounded-xl shadow-sm border border-slate-200"
            >
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Section Name</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={section.name}
                    onChange={(e) => handleChangeSection(section.id, 'name', e.target.value)}
                  />
                </div>
                <div className="w-full md:w-28">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Questions</label>
                  <input 
                    type="number" 
                    min="1"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={section.numQuestions}
                    onChange={(e) => handleChangeSection(section.id, 'numQuestions', parseInt(e.target.value) || '')}
                  />
                </div>
                <div className="w-full md:w-28">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Marks/Q</label>
                  <input 
                    type="number"
                    min="1" 
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={section.marksPerQuestion}
                    onChange={(e) => handleChangeSection(section.id, 'marksPerQuestion', parseInt(e.target.value) || '')}
                  />
                </div>
                <div className="w-full md:w-24 text-right">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total</label>
                  <div className="font-bold text-slate-700 py-2">
                    {((section.numQuestions || 0) * (section.marksPerQuestion || 0))} 
                  </div>
                </div>
                <div className="pt-5">
                  <button
                    type="button"
                    onClick={() => handleRemoveSection(section.id)}
                    disabled={sections.length === 1}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center mt-2 border-t border-slate-100 pt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    checked={section.hasInternalChoice}
                    onChange={(e) => handleChangeSection(section.id, 'hasInternalChoice', e.target.checked)}
                  />
                  <span className="text-sm font-medium text-slate-600">Include Internal Choices ("OR" questions)</span>
                </label>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Chapter Allocation UI */}
      <div className="mb-8 p-6 bg-slate-50/50 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Chapter Allocation <span className="text-slate-500 text-sm font-normal">(Optional)</span></h3>
            <p className="text-xs text-slate-500 mt-1">Specify how many questions exactly should appear from specific chapters.</p>
          </div>
          <button 
            type="button" 
            onClick={handleAddChapter}
            className="flex items-center gap-1.5 text-sm font-semibold text-purple-600 hover:text-purple-800 bg-purple-50 px-3 py-1.5 rounded-lg transition-colors border border-purple-100"
          >
            <Plus className="w-4 h-4" /> Add Chapter
          </button>
        </div>

        {chapterAllocation.length > 0 ? (
          <div className="space-y-3">
            {chapterAllocation.map((chapter) => (
              <motion.div 
                key={chapter.id} 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-slate-200"
              >
                <div className="flex-1">
                  <input 
                    type="text" 
                    placeholder="Chapter / Topic Name"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
                    value={chapter.chapterName}
                    onChange={(e) => handleChangeChapter(chapter.id, 'chapterName', e.target.value)}
                  />
                </div>
                <div className="w-24">
                  <input 
                    type="number" 
                    min="1"
                    placeholder="Questions"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none text-center"
                    value={chapter.questionCount}
                    onChange={(e) => handleChangeChapter(chapter.id, 'questionCount', parseInt(e.target.value) || '')}
                  />
                </div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[30px] text-center">Qs</label>
                <button
                  type="button"
                  onClick={() => handleRemoveChapter(chapter.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
            
            <div className="flex items-center justify-between text-xs font-medium pt-2 pl-1">
               <span className="text-slate-500">
                 Currently allocated: <span className="text-slate-800 font-bold">{chapterAllocation.reduce((acc, curr) => acc + (curr.questionCount || 0), 0)}</span> / <span className="text-slate-800 font-bold">{sections.reduce((acc, curr) => acc + (curr.numQuestions || 0), 0)}</span> Total Section Questions
               </span>
               {chapterAllocation.reduce((acc, curr) => acc + (curr.questionCount || 0), 0) > sections.reduce((acc, curr) => acc + (curr.numQuestions || 0), 0) && (
                 <span className="text-red-500 font-bold px-2 py-0.5 bg-red-50 rounded-md shadow-sm">
                   Wait! Decrease allocations (exceeds global total).
                 </span>
               )}
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-500 py-3 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white">
            No specific chapter constraints. The AI will freely balance questions across the entire syllabus.
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-200 flex justify-between flex-wrap gap-4 items-center">
        <div className="flex gap-4 items-center flex-wrap">
          <div>
            <span className="text-slate-500 text-sm">Total Questions: </span>
            <span className="text-lg font-bold text-slate-700">
              {sections.reduce((acc, curr) => acc + (curr.numQuestions || 0), 0)}
            </span>
          </div>
          <div className="h-6 w-px bg-slate-300 hidden md:block"></div>
          <div>
            <span className="text-slate-500 text-sm">Total Marks Estimate: </span>
            <span className="text-xl font-bold text-indigo-700">
              {sections.reduce((acc, curr) => acc + ((curr.numQuestions || 0) * (curr.marksPerQuestion || 0)), 0)}
            </span>
          </div>
        </div>
        <button 
          type="submit" 
          disabled={isGenerating}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-75 relative overflow-hidden flex items-center gap-2"
        >
          {isGenerating && (
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {isGenerating ? 'Generating Paper...' : 'Generate with AI'}
        </button>
      </div>
    </motion.form>
  );
}
