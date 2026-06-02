"use client"

import React, { useState, useEffect } from 'react'
import { GraduationCap, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n-context'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'

const Navbar = () => {
  const router = useRouter()
  const { t } = useI18n()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { nameKey: "nav.dashboard", href: '/login' },
  ]

  const handleLogin = () => router.push('/login')

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent',
      isScrolled ? 'bg-white/80 backdrop-blur-md border-slate-200 py-3' : 'bg-transparent py-5'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-xl">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">AN-NADJAH</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a key={link.nameKey} href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
              >{t(link.nameKey)}</a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
            <button onClick={handleLogin} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              {t("landing.heroLogin")}
            </button>
            <button onClick={handleLogin} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300">
              {t("landing.heroCta")}
            </button>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher variant="minimal" />
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                <a key={link.nameKey} href={link.href}
                  className="block px-3 py-2 text-base font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >{t(link.nameKey)}</a>
              ))}
              <div className="pt-4 flex flex-col gap-3">
                <button onClick={handleLogin} className="w-full text-center py-2.5 text-slate-600 font-medium">{t("landing.heroLogin")}</button>
                <button onClick={handleLogin} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium">{t("landing.heroCta")}</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
