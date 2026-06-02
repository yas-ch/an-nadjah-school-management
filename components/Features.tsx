"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Users, Briefcase, FileCheck, Calendar, ArrowRight } from 'lucide-react'
import { useI18n } from "@/lib/i18n-context"

const Features = () => {
  const { t } = useI18n()

  const features = [
    {
      title: t('landing.featureStudentLabel'),
      description: t('landing.featureStudentLabelDesc'),
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: t('landing.featureTeachersLabel'),
      description: t('landing.featureTeachersLabelDesc'),
      icon: Briefcase,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      title: t('landing.featureGradesLabel'),
      description: t('landing.featureGradesLabelDesc'),
      icon: FileCheck,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      title: t('landing.featureAttendanceLabel'),
      description: t('landing.featureAttendanceLabelDesc'),
      icon: Calendar,
      color: "bg-orange-50 text-orange-600",
    },
  ]

  return (
    <section id="features" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-blue-600 font-bold tracking-tight uppercase text-sm mb-3">{t('landing.featuresTitle')}</h2>
          <h3 className="text-4xl font-bold text-slate-900 mb-6">{t('landing.featuresSubtitle')}</h3>
          <p className="text-lg text-slate-600">
            {t('landing.featuresDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all group"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
              <p className="text-slate-600 mb-6 leading-relaxed text-sm">
                {feature.description}
              </p>
              <button className="text-blue-600 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                {t('landing.learnMore')} <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
