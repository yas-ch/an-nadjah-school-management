"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Clock, FileText, Layout, Activity, CheckCircle2 } from 'lucide-react'
import { useI18n } from "@/lib/i18n-context"

const Benefits = () => {
  const { t } = useI18n()

  const benefits = [
    {
      title: t('landing.benefitSaveTime'),
      description: t('landing.benefitSaveTimeDesc'),
      icon: Clock,
    },
    {
      title: t('landing.benefitReducePaperwork'),
      description: t('landing.benefitReducePaperworkDesc'),
      icon: FileText,
    },
    {
      title: t('landing.benefitBetterOrg'),
      description: t('landing.benefitBetterOrgDesc'),
      icon: Layout,
    },
    {
      title: t('landing.benefitRealTime'),
      description: t('landing.benefitRealTimeDesc'),
      icon: Activity,
    },
  ]

  return (
    <section className="py-24 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Visual Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h4 className="font-bold text-slate-900">{t('landing.efficiencyGrowth')}</h4>
                <div className="px-3 py-1 bg-green-100 text-green-600 text-xs font-bold rounded-full">{t('landing.growthPercent')}</div>
              </div>
              
              <div className="space-y-6">
                {[
                  { label: t('landing.adminSpeed'), value: '92%' },
                  { label: t('landing.teacherProductivity'), value: '85%' },
                  { label: t('landing.parentEngagement'), value: '78%' },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm font-medium text-slate-600 mb-2">
                      <span>{item.label}</span>
                      <span className="text-slate-900 font-bold">{item.value}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: item.value }}
                        transition={{ duration: 1, delay: 0.5 + (i * 0.2) }}
                        viewport={{ once: true }}
                        className="h-full bg-blue-600 rounded-full" 
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 p-4 bg-blue-50 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  !
                </div>
                <p className="text-sm text-slate-600 leading-tight">
                  <span className="font-bold text-blue-600">{t('landing.smartAlert')}:</span> {t('landing.smartAlertText')}
                </p>
              </div>
            </div>

            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-200/40 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-200/40 rounded-full blur-3xl" />
          </motion.div>

          {/* Content Side */}
          <div>
            <h2 className="text-blue-600 font-bold tracking-tight uppercase text-sm mb-3">{t('landing.benefitsTitle')}</h2>
            <h3 className="text-4xl font-bold text-slate-900 mb-8 leading-tight">
              {t('landing.benefitsSubtitle')}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">{benefit.title}</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 pt-12 border-t border-slate-200">
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-3xl font-bold text-slate-900">10k+</div>
                  <div className="text-sm text-slate-500">{t('landing.activeStudents')}</div>
                </div>
                <div className="w-px h-12 bg-slate-200" />
                <div>
                  <div className="text-3xl font-bold text-slate-900">99%</div>
                  <div className="text-sm text-slate-500">{t('landing.satisfactionRate')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Benefits
