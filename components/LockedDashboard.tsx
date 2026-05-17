"use client"
"use client"
import React from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  User,
  Lock,
  Activity,
  Clock,
  Flame,
  FileText,
  Users,
  BookOpen,
  Target,
  ChevronRight,
  Sparkles } from
'lucide-react';
interface LockedDashboardProps {
  onNavigateScore: () => void;
}
export function LockedDashboard({ onNavigateScore }: LockedDashboardProps) {
  const freeFeatures = [
  {
    title: 'Impact Tracker',
    icon: Activity,
    desc: 'Monitor your lifetime giving impact.'
  },
  {
    title: 'Recent Donations',
    icon: Clock,
    desc: 'View your giving history and receipts.'
  },
  {
    title: 'Giving Streak',
    icon: Flame,
    desc: 'You are on a 5-week streak!'
  }];

  const lockedFeatures = [
  {
    title: 'Tax Insights',
    icon: FileText,
    desc: 'Automated tax deduction reports.'
  },
  {
    title: 'Donor Matching',
    icon: Users,
    desc: 'Find corporate matches for your gifts.'
  },
  {
    title: 'Legacy Planning',
    icon: BookOpen,
    desc: 'Set up long-term giving vehicles.'
  },
  {
    title: 'Cause Deep-Dives',
    icon: Target,
    desc: 'Detailed research on specific charities.'
  }];

  return (
    <div className="min-h-screen bg-cream pb-20">
      {/* Top Nav */}
      <nav className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-stone-900 font-bold text-xl">
            <Heart className="w-6 h-6 text-amber-600 fill-amber-600" />
            <span>Altru</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={onNavigateScore}
              className="text-sm font-medium text-stone-600 hover:text-stone-900 flex items-center space-x-1 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-full transition-colors">
              
              <Activity className="w-4 h-4" />
              <span>View Score</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-600">
              <User className="w-4 h-4" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pt-10 space-y-12">
        <motion.div
          initial={{
            opacity: 0,
            y: 10
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          className="space-y-2">
          
          <h1 className="text-3xl font-bold text-stone-900">
            Welcome back, Alex
          </h1>
          <p className="text-stone-500">
            Here's an overview of your giving journey.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {freeFeatures.map((feat, i) =>
          <motion.div
            key={feat.title}
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              delay: i * 0.1
            }}
            className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
            
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feat.icon className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-semibold text-stone-900 mb-1">
                {feat.title}
              </h3>
              <p className="text-sm text-stone-500">{feat.desc}</p>
            </motion.div>
          )}

          {lockedFeatures.map((feat, i) =>
          <motion.div
            key={feat.title}
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              delay: (i + freeFeatures.length) * 0.1
            }}
            className="relative bg-white p-6 rounded-2xl border border-stone-200 overflow-hidden group">
            
              <div className="opacity-40 blur-[2px] transition-all duration-300 group-hover:blur-sm">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center mb-4">
                  <feat.icon className="w-5 h-5 text-stone-400" />
                </div>
                <h3 className="font-semibold text-stone-900 mb-1">
                  {feat.title}
                </h3>
                <p className="text-sm text-stone-500">{feat.desc}</p>
              </div>

              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[1px]">
                <div className="bg-white p-3 rounded-full shadow-sm border border-stone-100 mb-2 group-hover:-translate-y-1 transition-transform">
                  <Lock className="w-5 h-5 text-stone-400" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 bg-stone-100 px-2 py-1 rounded-md">
                  Pro Feature
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Upgrade CTA */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: 0.6
          }}
          className="bg-stone-900 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center space-x-2 bg-stone-800 px-3 py-1 rounded-full border border-stone-700">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-medium text-stone-300 uppercase tracking-wide">
                Altru Pro
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Unlock your full giving potential
            </h2>
            <p className="text-stone-400 text-lg">
              Get access to tax insights, donor matching, and deep-dive research
              to make every dollar count.
            </p>
          </div>
          <button className="w-full md:w-auto whitespace-nowrap bg-white text-stone-900 px-8 py-4 rounded-xl font-semibold hover:bg-stone-100 transition-colors flex items-center justify-center space-x-2 group">
            <span>Upgrade to Pro</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </main>
    </div>);

}