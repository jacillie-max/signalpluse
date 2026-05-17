import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
const VALUES = [
'Education',
'Climate',
'Health',
'Equity',
'Animals',
'Arts',
'Community',
'Faith',
'Hunger',
'Mental Health',
'Veterans',
'Youth'];

interface ValuesOnboardingProps {
  onComplete: () => void;
}
export function ValuesOnboarding({ onComplete }: ValuesOnboardingProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const toggleValue = (value: string) => {
    setSelected((prev) =>
    prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };
  const isComplete = selected.length >= 3;
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      className="min-h-screen flex flex-col items-center justify-center p-6 max-w-2xl mx-auto">
      
      <div className="w-full space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-stone-900">
            What matters most to you?
          </h1>
          <p className="text-stone-500 text-lg">
            Select at least 3 values that guide your giving.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 py-8">
          {VALUES.map((value) => {
            const isSelected = selected.includes(value);
            return (
              <motion.button
                key={value}
                whileTap={{
                  scale: 0.95
                }}
                onClick={() => toggleValue(value)}
                aria-pressed={isSelected}
                className={`
                  px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 border
                  ${isSelected ? 'bg-stone-900 text-white border-stone-900 shadow-md' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:bg-stone-50'}
                `}>
                
                {value}
              </motion.button>);

          })}
        </div>

        <div className="flex flex-col items-center space-y-6 pt-4 border-t border-stone-200">
          <div className="flex items-center space-x-2 text-sm font-medium">
            {isComplete ?
            <motion.div
              initial={{
                scale: 0
              }}
              animate={{
                scale: 1
              }}
              className="flex items-center text-amber-600 bg-amber-50 px-4 py-2 rounded-full">
              
                <Check className="w-4 h-4 mr-2" />
                <span>Great choices! You're ready.</span>
              </motion.div> :

            <span className="text-stone-500 bg-white px-4 py-2 rounded-full border border-stone-200 shadow-sm">
                <strong className="text-stone-900">{selected.length}</strong> of
                3 selected
              </span>
            }
          </div>

          <button
            onClick={onComplete}
            disabled={!isComplete}
            className={`
              w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300
              ${isComplete ? 'bg-stone-900 text-white hover:bg-stone-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5' : 'bg-stone-200 text-stone-400 cursor-not-allowed'}
            `}>
            
            Continue to Dashboard
          </button>
        </div>
      </div>
    </motion.div>);

}