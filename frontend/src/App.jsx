import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Library } from 'lucide-react';
import Stepper from './components/Stepper';
import ConfigurationForm from './components/ConfigurationForm';
import PaperPreview from './components/PaperPreview';

function App() {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [paperData, setPaperData] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = async (config) => {
    setIsGenerating(true);
    setError('');
    setStep(2);
    try {
      const response = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        body: config,
      });

      if (!response.ok) {
        throw new Error('Failed to generate paper. Please try again.');
      }

      const data = await response.json();
      setPaperData(data);
      setStep(3);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong');
      setStep(1);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setPaperData(null);
    setStep(1);
    setError('');
  };

  return (
    <div className="min-h-screen relative font-sans text-slate-800">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-100 to-transparent z-0 opacity-70 pointer-events-none" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none" />
      <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 glass border-b border-slate-200/50 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
              <Library className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-800 to-purple-800">
              AI Paper Generator
            </h1>
          </div>
          <div className="flex gap-4">
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Documentation</a>
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Teacher Login</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Intro */}
        {step === 1 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Create the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Perfect Question Paper</span> in Seconds
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Leverage the power of AI to generate well-structured, syllabus-aligned test papers. Export instantly to PDF or Word.
            </p>
          </motion.div>
        )}

        <Stepper currentStep={step} />

        {error && (
          <div className="max-w-3xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center shadow-sm">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <ConfigurationForm 
                onSubmit={handleGenerate} 
                isGenerating={isGenerating} 
              />
            </motion.div>
          )}

          {step === 2 && (
             <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center justify-center py-20"
             >
               <div className="relative">
                 <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center animate-pulse">
                   <Sparkles className="w-10 h-10 text-indigo-600 animate-bounce" />
                 </div>
                 <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
               </div>
               <h3 className="text-2xl font-bold text-slate-800 mt-8 mb-2">Our AI is drafting the paper...</h3>
               <p className="text-slate-500 text-center max-w-sm">
                 Analyzing your syllabus, balancing difficulty, and curating unique questions.
               </p>
             </motion.div>
          )}

          {step === 3 && paperData && (
             <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
             >
               <PaperPreview paperData={paperData} onReset={handleReset} />
             </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <footer className="relative z-10 border-t border-slate-200 mt-20 py-8 text-center text-slate-500 text-sm">
        &copy; {new Date().getFullYear()} AI Paper Generator. Built for the modern classroom.
      </footer>
    </div>
  );
}

export default App;
