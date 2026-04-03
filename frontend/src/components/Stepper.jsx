import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const steps = [
  { id: 1, title: 'Configuration' },
  { id: 2, title: 'Generating AI' },
  { id: 3, title: 'Preview & Export' },
];

export default function Stepper({ currentStep }) {
  return (
    <div className="w-full py-6 mb-8">
      <div className="flex items-center justify-between max-w-3xl mx-auto relative">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-200 z-0 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-indigo-500"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>

        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors duration-300 ${
                  isActive
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : isCompleted
                    ? 'bg-indigo-500 border-indigo-500 text-white'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
                initial={false}
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : step.id}
              </motion.div>
              <span
                className={`mt-3 text-sm font-medium transition-colors duration-300 ${
                  isActive || isCompleted ? 'text-slate-800' : 'text-slate-400'
                }`}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
