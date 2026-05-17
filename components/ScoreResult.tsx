import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp } from 'lucide-react';
interface ScoreResultProps {
  onNavigateDashboard: () => void;
  onNavigateValues: () => void;
}
export function ScoreResult({
  onNavigateDashboard,
  onNavigateValues
}: ScoreResultProps) {
  const score = 78;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - score / 100 * circumference;
  return (
    <motion.div
      initial={{
        opacity: 0
      }}
      animate={{
        opacity: 1
      }}
      exit={{
        opacity: 0
      }}
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-cream">
      
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-stone-200 p-8 space-y-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-stone-900">
            Your Giving Score
          </h1>
          <p className="text-stone-500 text-sm">
            Based on your recent impact and consistency.
          </p>
        </div>

        {/* Score Ring */}
        <div className="relative flex items-center justify-center py-4">
          <svg className="w-64 h-64 transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="128"
              cy="128"
              r={radius}
              stroke="currentColor"
              strokeWidth="16"
              fill="transparent"
              className="text-stone-100" />
            
            {/* Animated Progress Circle */}
            <motion.circle
              cx="128"
              cy="128"
              r={radius}
              stroke="currentColor"
              strokeWidth="16"
              fill="transparent"
              strokeDasharray={circumference}
              initial={{
                strokeDashoffset: circumference
              }}
              animate={{
                strokeDashoffset
              }}
              transition={{
                duration: 1.5,
                ease: 'easeOut',
                delay: 0.2
              }}
              strokeLinecap="round"
              className="text-amber-500" />
            
          </svg>

          <div className="absolute flex flex-col items-center justify-center">
            <motion.span
              initial={{
                opacity: 0,
                scale: 0.5
              }}
              animate={{
                opacity: 1,
                scale: 1
              }}
              transition={{
                delay: 0.8,
                duration: 0.5,
                type: 'spring'
              }}
              className="text-6xl font-bold text-stone-900 tracking-tighter">
              
              {score}
            </motion.span>
            <span className="text-stone-400 font-medium text-sm mt-1">
              out of 100
            </span>
          </div>
        </div>

        {/* Benchmark */}
        <motion.div
          initial={{
            opacity: 0,
            y: 10
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: 1
          }}
          className="bg-stone-50 rounded-2xl p-5 border border-stone-100">
          
          <div className="flex justify-between items-end mb-3">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Benchmark
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-stone-900 font-medium">You: {score}</span>
                <span className="text-stone-300">|</span>
                <span className="text-stone-500">Avg: 54</span>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              <span>+24</span>
            </div>
          </div>

          {/* Mini bar chart */}
          <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-stone-400"
              style={{
                width: '54%'
              }} />
            
            <div
              className="h-full bg-amber-500 rounded-r-full"
              style={{
                width: `${score - 54}%`
              }} />
            
          </div>
        </motion.div>

        {/* Streak */}
        <motion.div
          initial={{
            opacity: 0,
            y: 10
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: 1.2
          }}
          className="flex flex-col items-center space-y-3">
          
          <span className="text-sm font-medium text-stone-600">
            Current streak: 5 weeks
          </span>
          <div className="flex space-x-2">
            {Array.from({
              length: 7
            }).map((_, i) =>
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${i < 5 ? 'bg-amber-500 shadow-sm' : 'bg-stone-200'}`} />

            )}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          transition={{
            delay: 1.5
          }}
          className="pt-4 space-y-4">
          
          <button
            onClick={onNavigateDashboard}
            className="w-full bg-stone-900 text-white py-4 rounded-xl font-semibold hover:bg-stone-800 transition-colors shadow-md hover:shadow-lg">
            
            Continue to Dashboard
          </button>

          <button
            onClick={onNavigateValues}
            className="w-full flex items-center justify-center space-x-2 text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
            
            <ArrowLeft className="w-4 h-4" />
            <span>Revisit my values</span>
          </button>
        </motion.div>
      </div>
    </motion.div>);

}