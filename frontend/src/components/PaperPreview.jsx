import React from 'react';
import { Download, FileText, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { exportToPDF, exportToDOCX } from '../utils/exportUtils';

export default function PaperPreview({ paperData, onReset }) {
  const [openSections, setOpenSections] = React.useState(
    paperData?.sections?.map((_, i) => i) || []
  );

  if (!paperData) return null;

  const toggleSection = (idx) => {
    setOpenSections(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const handleExportPDF = async () => {
    await exportToPDF('question-paper-content');
  };

  const handleExportDOCX = async () => {
    await exportToDOCX(paperData);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto"
    >
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 gap-4">
        <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
          <FileText className="text-indigo-600" /> Paper Generated Successfully
        </h2>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-medium rounded-lg transition-colors border border-rose-200"
          >
            <Download className="w-4 h-4" /> PDF
          </button>
          <button 
            onClick={handleExportDOCX}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium rounded-lg transition-colors border border-blue-200"
          >
            <Download className="w-4 h-4" /> DOCX
          </button>
          <button 
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium rounded-lg transition-colors border border-slate-300"
          >
            <RefreshCw className="w-4 h-4" /> Start Over
          </button>
        </div>
      </div>

      {/* Actual Paper Content */}
      <div className="bg-white shadow-xl shadow-slate-200/50 rounded-xl overflow-hidden border border-slate-200">
        <div id="question-paper-content" className="p-8 md:p-12 font-serif text-slate-900 bg-white">
          <div className="text-center mb-10 border-b-2 border-slate-800 pb-6">
            <h1 className="text-3xl font-bold uppercase tracking-wide mb-2">
              {paperData.title || `${paperData.subject} Examination`}
            </h1>
            <div className="flex justify-between items-center mt-6 text-sm font-semibold uppercase tracking-widest text-slate-600">
              <span>Subject: {paperData.subject}</span>
              <span>Time: {paperData.duration || '3 Hours'}</span>
              <span>Max Marks: {paperData.totalMarks}</span>
            </div>
          </div>

          <div className="space-y-8">
            {paperData.sections?.map((section, idx) => {
              const isOpen = openSections.includes(idx);
              return (
                <div key={idx} className="section-container">
                  <div 
                    className="flex justify-between items-center group cursor-pointer lg:cursor-default py-2"
                    onClick={() => toggleSection(idx)}
                  >
                    <h3 className="text-xl font-bold border-b border-slate-300 pb-1 w-full flex justify-between">
                      {section.name}
                      <span className="lg:hidden p-1 rounded hover:bg-slate-100">
                        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                      </span>
                    </h3>
                  </div>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        {section.instructions && (
                          <p className="italic text-slate-600 mt-2 mb-4 text-sm">
                            Instructions: {section.instructions}
                          </p>
                        )}
                        
                        <div className="space-y-6 mt-4">
                          {section.questions?.map((q, qIdx) => (
                            <div key={qIdx} className="group hover:bg-slate-50 p-3 -mx-3 rounded-lg transition-colors relative space-y-3 border border-transparent hover:border-slate-200">
                              {q.choices?.map((choiceText, cIdx) => (
                                <React.Fragment key={cIdx}>
                                  <div className="flex gap-4">
                                    <span className="font-bold min-w-[32px]">{cIdx === 0 ? `Q${qIdx + 1}.` : ''}</span>
                                    <div className="flex-1">
                                      <p className="leading-relaxed">{choiceText}</p>
                                    </div>
                                    {cIdx === 0 && (
                                       <span className="font-bold whitespace-nowrap opacity-60">[{q.marks}]</span>
                                    )}
                                  </div>
                                  {cIdx < q.choices.length - 1 && (
                                    <div className="flex gap-4 items-center pl-8 py-1">
                                      <div className="flex-1 border-t border-slate-300 border-dashed"></div>
                                      <span className="font-bold text-slate-400 tracking-widest uppercase text-sm">Or</span>
                                      <div className="flex-1 border-t border-slate-300 border-dashed"></div>
                                      <span className="min-w-[40px]"></span>
                                    </div>
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
          
          <div className="mt-16 text-center text-sm font-bold tracking-widest text-slate-400 uppercase">
            *** End of Paper ***
          </div>
        </div>
      </div>
    </motion.div>
  );
}
