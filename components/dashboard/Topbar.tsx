"use client";

import { Menu, Bell, Search, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n-context";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

interface TopbarProps {
  user: { name: string; role: string; };
  onMenuClick: () => void;
}

const roleLabels: Record<string, string> = {
  admin: "Administrator",
  teacher: "Teacher",
  student: "Student",
  parent: "Parent",
};

const pageKeys: Record<string, string> = {
  "/admin": "nav.overview",
  "/admin/teachers": "nav.teachers",
  "/admin/students": "nav.students",
  "/admin/classes": "nav.classes",
  "/admin/subjects": "nav.subjects",
  "/admin/attendance": "nav.attendance",
  "/admin/grades": "nav.grades",
  "/admin/reports": "nav.reports",
  "/admin/settings": "nav.settings",
  "/student": "nav.dashboard",
  "/student/grades": "nav.grades",
  "/student/attendance": "nav.attendance",
  "/student/classes": "nav.classes",
  "/student/resources": "nav.resources",
  "/student/reports": "nav.reports",
  "/student/profile": "nav.profile",
  "/parent": "nav.dashboard",
  "/parent/grades": "nav.grades",
  "/parent/attendance": "nav.attendance",
  "/parent/classes": "nav.classes",
  "/parent/resources": "nav.resources",
  "/parent/reports": "nav.reports",
  "/parent/profile": "nav.profile",
  "/teacher": "nav.dashboard",
  "/teacher/grades": "nav.grades",
  "/teacher/attendance": "nav.attendance",
  "/teacher/shared-resources": "nav.resources",
  "/teacher/shared-notes": "nav.notes",
  "/teacher/announcements": "nav.announcements",
};

export default function Topbar({ user, onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, locale } = useI18n();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const titleKey = pageKeys[pathname] || "nav.dashboard";
  const title = t(titleKey);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className={cn(
      "flex h-16 items-center justify-between border-b px-4 lg:px-6 sticky top-0 z-30 transition-all",
      user.role === "student" || user.role === "parent"
        ? "bg-white/70 backdrop-blur-xl border-white/20 shadow-sm shadow-gray-200/20"
        : "bg-white/80 backdrop-blur-md border-gray-100"
    )}>
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden transition-colors">
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className={cn(
            "text-lg font-semibold bg-clip-text text-transparent",
            user.role === "student"
              ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600"
              : user.role === "parent"
              ? "bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600"
              : "text-gray-900"
          )}>{title}</h1>
          <p className="text-xs text-gray-500 -mt-0.5 capitalize">
            {t(`roles.${user.role}`)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <LanguageSwitcher variant="minimal" />

        <div className={cn(
          "hidden md:flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all",
          (user.role === "student" || user.role === "parent")
            ? "border-white/30 bg-white/50 focus-within:border-primary-400 focus-within:bg-white focus-within:ring-1 focus-within:ring-primary-400"
            : "border-gray-200 bg-gray-50 hover:border-gray-300 focus-within:border-primary-400 focus-within:bg-white focus-within:ring-1 focus-within:ring-primary-400"
        )}>
          <Search className="h-4 w-4 text-gray-400" />
          <input type="text" placeholder={t("common.search")} className="bg-transparent outline-none text-gray-900 placeholder-gray-400 w-40 lg:w-56" />
          <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded border border-gray-200 bg-white/80 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 backdrop-blur-sm">
            <span>⌘</span>K
          </kbd>
        </div>

        <button className={cn("relative rounded-lg p-2 transition-colors", (user.role === "student" || user.role === "parent") ? "text-gray-500 hover:bg-white/50" : "text-gray-500 hover:bg-gray-100")}>
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-[9px] font-bold text-white shadow-sm">3</span>
        </button>

        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setDropdownOpen(!dropdownOpen)}
            className={cn("flex items-center gap-2 rounded-lg p-1.5 transition-colors", (user.role === "student" || user.role === "parent") ? "hover:bg-white/50" : "hover:bg-gray-100")}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-sm font-semibold text-white shadow-lg shadow-primary-500/20">
              {user.name.charAt(0)}
            </div>
            <ChevronDown className={cn("hidden sm:block h-4 w-4 text-gray-400 transition-transform duration-200", dropdownOpen && "rotate-180")} />
          </button>

          {dropdownOpen && (
            <div className={cn("absolute right-0 top-full mt-2 w-48 rounded-xl border py-1.5 shadow-lg ring-1 ring-black/5",
              (user.role === "student" || user.role === "parent")
                ? "bg-white/80 backdrop-blur-xl border-white/30 shadow-lg shadow-gray-200/30"
                : "border-gray-100 bg-white shadow-lg shadow-gray-200/50"
            )}>
              <div className="px-4 py-2 border-b border-gray-50">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{t(`roles.${user.role}`)}</p>
              </div>
              <button onClick={() => { setDropdownOpen(false); router.push(`/${user.role}/settings`); }}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <Settings className="h-4 w-4" /> {t("common.settings")}
              </button>
              <button onClick={() => { setDropdownOpen(false); }}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <User className="h-4 w-4" /> {t("common.profile")}
              </button>
              <div className="border-t border-gray-50 mt-1 pt-1">
                <button onClick={async () => { setDropdownOpen(false); await fetch("/api/auth/logout", { method: "POST" }); router.push("/"); }}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut className="h-4 w-4" /> {t("common.signOut")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
