"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Play, Users, UserCheck, GraduationCap, Calendar } from 'lucide-react'
import Image from 'next/image'
import { useI18n } from "@/lib/i18n-context"

const Hero = () => {
  const { t } = useI18n()
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50/50 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              {t('landing.heroBadge')}
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 leading-[1.1] mb-6">
              {t('landing.heroTitle')}
            </h1>
            
            <p className="text-lg text-slate-600 mb-8 max-w-xl leading-relaxed">
              {t('landing.heroSubtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 hover:shadow-blue-300 group">
                {t('landing.heroCta')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold border border-slate-200 flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                <Play className="w-5 h-5 fill-slate-900" />
                {t('landing.heroViewDemo')}
              </button>
            </div>

            <div className="mt-10 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                    <img 
                      src={`https://i.pravatar.cc/100?img=${i + 10}`} 
                      alt={t('landing.userAvatar')}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="text-sm text-slate-500">
                <span className="text-slate-900 font-bold">500+</span> {t('landing.schoolsTrust')}
              </div>
            </div>
          </motion.div>

          {/* Right Content - Visuals */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Soft Glow/Blur Behind Image */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-400/10 rounded-full blur-[100px] -z-10" />

            {/* Main Image Container */}
            <div className="relative rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] z-10 border-[12px] border-white ring-1 ring-slate-100">
              <img 
                src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop" 
                alt={t('landing.heroImageAlt')}
                className="w-full h-full object-cover aspect-[4/5] scale-105 hover:scale-110 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 via-transparent to-transparent" />
            </div>

            {/* Floating Card 1: Stats */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-16 top-[15%] z-20 glass p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/60 max-w-[220px]"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-200">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.1em]">{t('landing.totalStudents')}</div>
                  <div className="text-xl font-bold text-slate-900 tracking-tight">1,240</div>
                </div>
              </div>
              <div className="space-y-2.5">
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "85%" }}
                    transition={{ duration: 1.5, delay: 1 }}
                    className="h-full bg-blue-600 rounded-full" 
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-[10px] text-blue-600 font-bold">{t('landing.growthStat')}</div>
                  <div className="text-[10px] text-slate-400 font-medium">{t('landing.annual')}</div>
                </div>
              </div>
            </motion.div>

            {/* Floating Card 2: Quick Stats / Attendance */}
            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -right-12 bottom-[10%] z-20 glass p-7 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/60 min-w-[240px]"
            >
              <div className="flex items-center justify-between mb-5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">{t('landing.schoolInsights')}</h4>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center border border-green-100/50">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">98.4%</div>
                    <div className="text-[10px] text-slate-400 font-medium">{t('landing.dailyAttendance')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100/50">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">42 {t('landing.classesCount')}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{t('landing.activeThisTerm')}</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Premium Decorative Accent */}
            <div className="absolute -z-10 -bottom-8 -right-8 w-full h-full bg-gradient-to-br from-blue-600/5 to-indigo-600/10 rounded-[3rem] blur-sm" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Hero
