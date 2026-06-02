"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Globe } from "lucide-react";
import { useI18n, type Locale } from "@/lib/i18n-context";
import { cn } from "@/lib/utils";

const locales: { value: Locale; label: string; flag: string }[] = [
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "ar", label: "العربية", flag: "🇲🇦" },
];

export default function LanguageSwitcher({ variant = "default" }: { variant?: "default" | "minimal" }) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = locales.find((l) => l.value === locale) || locales[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 rounded-lg transition-colors",
          variant === "minimal"
            ? "px-2 py-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            : "px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
        )}
      >
        {variant === "minimal" ? (
          <>
            <Globe className="h-4 w-4" />
            <span className="text-xs font-medium">{current.flag}</span>
          </>
        ) : (
          <>
            <span className="text-base">{current.flag}</span>
            <span className="text-sm font-medium">{current.label}</span>
            <ChevronDown className={cn("h-3.5 w-3.5 text-gray-400 transition-transform", open && "rotate-180")} />
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute right-0 top-full mt-1.5 w-40 rounded-xl border bg-white py-1 shadow-lg ring-1 ring-black/5 z-50",
              locale === "ar" ? "left-0 right-auto" : "right-0"
            )}
          >
            {locales.map((l) => (
              <button
                key={l.value}
                onClick={() => {
                  setLocale(l.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2 text-sm transition-colors",
                  l.value === locale
                    ? "bg-primary-50 text-primary-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <span className="text-base">{l.flag}</span>
                <span>{l.label}</span>
                {l.value === locale && (
                  <motion.div layoutId="lang-check" className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-600" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
