"use client"

import React from 'react'
import { GraduationCap, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'
import { useI18n } from "@/lib/i18n-context"

const Footer = () => {
  const { t } = useI18n()
  
  return (
    <footer className="bg-white pt-20 pb-10 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Col */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-xl">
                <GraduationCap className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                AN-NADJAH
              </span>
            </div>
            <p className="text-slate-500 leading-relaxed max-w-xs">
              {t('landing.footerDesc')}
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Col 1 */}
          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">{t('landing.footerPlatform')}</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">{t('landing.footerFeatures')}</a></li>
              <li><a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">{t('landing.footerPricing')}</a></li>
              <li><a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">{t('landing.footerDemo')}</a></li>
              <li><a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">{t('landing.footerSecurity')}</a></li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">{t('landing.footerCompany')}</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">{t('landing.footerAbout')}</a></li>
              <li><a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">{t('landing.footerCareers')}</a></li>
              <li><a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">{t('landing.footerBlog')}</a></li>
              <li><a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">{t('landing.footerContact')}</a></li>
            </ul>
          </div>

          {/* Links Col 3 */}
          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">{t('landing.footerLegal')}</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">{t('landing.footerPrivacy')}</a></li>
              <li><a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">{t('landing.footerTerms')}</a></li>
              <li><a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">{t('landing.footerCookiePolicy')}</a></li>
            </ul>
          </div>

        </div>

        <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-400 text-sm">
            &copy; 2026 AN-NADJAH. {t('landing.footerRights')}
          </p>
          <div className="flex gap-8 text-sm text-slate-400">
            <a href="#" className="hover:text-slate-900 transition-colors">{t('landing.footerLangEn')}</a>
            <a href="#" className="hover:text-slate-900 transition-colors">{t('landing.footerLangFr')}</a>
            <a href="#" className="hover:text-slate-900 transition-colors">{t('landing.footerLangAr')}</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
