"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, MessageSquare } from 'lucide-react'
import { useI18n } from "@/lib/i18n-context"

const CTA = () => {
  const { t } = useI18n()
  
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-blue-600 rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-200"
        >
          {/* Glow effects */}
          <div className="absolute top-[-50%] left-[-10%] w-[60%] h-[100%] bg-blue-400 rounded-full blur-[120px] opacity-30" />
          <div className="absolute bottom-[-50%] right-[-10%] w-[60%] h-[100%] bg-indigo-400 rounded-full blur-[120px] opacity-30" />
          
          <div className="relative z-10">
            <h2 className="text-white font-bold tracking-tight uppercase text-sm mb-6">{t('landing.ctaBadge')}</h2>
            <h3 className="text-4xl lg:text-6xl font-bold text-white mb-8 leading-tight max-w-4xl mx-auto">
              {t('landing.ctaElevate')}
            </h3>
            <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed">
              {t('landing.ctaSubtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="bg-white text-blue-600 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all shadow-xl flex items-center justify-center gap-2 group">
                {t('landing.ctaButton')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-blue-700/50 backdrop-blur-sm text-white px-10 py-5 rounded-2xl font-bold text-lg border border-blue-400/30 hover:bg-blue-700/70 transition-all flex items-center justify-center gap-2">
                <MessageSquare className="w-5 h-5" />
                {t('landing.ctaContactSales')}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-1/2 left-0 w-full h-px bg-slate-100 -z-10" />
    </section>
  )
}

export default CTA
