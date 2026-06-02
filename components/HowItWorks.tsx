"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Settings, LayoutDashboard } from 'lucide-react'
import { useI18n } from "@/lib/i18n-context"

const HowItWorks = () => {
  const { t } = useI18n()

  const steps = [
    {
      title: t('landing.step1Title'),
      description: t('landing.step1Desc'),
      icon: UserPlus,
    },
    {
      title: t('landing.step2Title'),
      description: t('landing.step2Desc'),
      icon: Settings,
    },
    {
      title: t('landing.step3Title'),
      description: t('landing.step3Desc'),
      icon: LayoutDashboard,
    },
  ]

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-blue-600 font-bold tracking-tight uppercase text-sm mb-3">{t('landing.howItWorksBadge')}</h2>
          <h3 className="text-4xl font-bold text-slate-900 mb-6">{t('landing.howItWorksTitle')}</h3>
          <p className="text-lg text-slate-600">
            {t('landing.howItWorksDesc')}
          </p>
        </div>

        <div className="relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-blue-100 -translate-y-1/2 -z-10" />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-20 h-20 rounded-full bg-white border-4 border-blue-50 shadow-xl shadow-blue-100 flex items-center justify-center mb-8 relative group-hover:border-blue-200 transition-all">
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <step.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-4">{step.title}</h4>
                <p className="text-slate-600 leading-relaxed max-w-[280px]">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
