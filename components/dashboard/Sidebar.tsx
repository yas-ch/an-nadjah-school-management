"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, Settings, UserCircle,
  FileSpreadsheet, Calendar, School, X, LogOut, Clock, StickyNote, Paperclip,
  BarChart3, ClipboardList, Megaphone, BookMarked, LineChart,
} from "lucide-react";
import { Sparkles, Stars } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n-context";

interface SidebarProps {
  user: { name: string; email: string; role: string; };
  open: boolean;
  onClose: () => void;
}

const navKeys: Record<string, { nameKey: string; href: string; icon: React.ComponentType }[]> = {
  admin: [
    { nameKey: "nav.dashboard", href: "/admin", icon: LayoutDashboard },
    { nameKey: "nav.teachers", href: "/admin/teachers", icon: GraduationCap },
    { nameKey: "nav.students", href: "/admin/students", icon: Users },
    { nameKey: "nav.classes", href: "/admin/classes", icon: BookOpen },
    { nameKey: "nav.subjects", href: "/admin/subjects", icon: BookMarked },
    { nameKey: "nav.attendance", href: "/admin/attendance", icon: Calendar },
    { nameKey: "nav.grades", href: "/admin/grades", icon: FileSpreadsheet },
    { nameKey: "nav.reports", href: "/admin/reports", icon: LineChart },
    { nameKey: "nav.settings", href: "/admin/settings", icon: Settings },
  ],
  student: [
    { nameKey: "nav.dashboard", href: "/student", icon: LayoutDashboard },
    { nameKey: "nav.grades", href: "/student/grades", icon: FileSpreadsheet },
    { nameKey: "nav.attendance", href: "/student/attendance", icon: Calendar },
    { nameKey: "nav.classes", href: "/student/classes", icon: BookOpen },
    { nameKey: "nav.resources", href: "/student/resources", icon: Paperclip },
    { nameKey: "nav.reports", href: "/student/reports", icon: BarChart3 },
    { nameKey: "nav.profile", href: "/student/profile", icon: UserCircle },
  ],
  parent: [
    { nameKey: "nav.dashboard", href: "/parent", icon: LayoutDashboard },
    { nameKey: "nav.grades", href: "/parent/grades", icon: FileSpreadsheet },
    { nameKey: "nav.attendance", href: "/parent/attendance", icon: Calendar },
    { nameKey: "nav.classes", href: "/parent/classes", icon: BookOpen },
    { nameKey: "nav.resources", href: "/parent/resources", icon: Paperclip },
    { nameKey: "nav.reports", href: "/parent/reports", icon: BarChart3 },
    { nameKey: "nav.profile", href: "/parent/profile", icon: UserCircle },
  ],
  teacher: [
    { nameKey: "nav.dashboard", href: "/teacher", icon: LayoutDashboard },
    { nameKey: "nav.myClasses", href: "/teacher/classes", icon: BookOpen },
    { nameKey: "nav.students", href: "/teacher/students", icon: Users },
    { nameKey: "nav.attendance", href: "/teacher/attendance", icon: Calendar },
    { nameKey: "nav.grades", href: "/teacher/grades", icon: ClipboardList },
    { nameKey: "nav.resources", href: "/teacher/shared-resources", icon: Paperclip },
    { nameKey: "nav.notes", href: "/teacher/shared-notes", icon: StickyNote },
    { nameKey: "nav.announcements", href: "/teacher/announcements", icon: Megaphone },
    { nameKey: "nav.reports", href: "/teacher/reports", icon: BarChart3 },
    { nameKey: "nav.settings", href: "/teacher/settings", icon: Settings },
  ],
};

const sidebarVariants = { open: { x: 0 }, closed: { x: "-100%" } };

const roleKey = (role: string) =>
  role === "admin" ? "admin" : role === "teacher" ? "teacher" : role === "parent" ? "parent" : "student";

export default function Sidebar({ user, open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const navItems = navKeys[roleKey(user.role)] || [];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onClose}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
        )}
      </AnimatePresence>

      <motion.aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col lg:static lg:z-auto lg:translate-x-0",
          user.role === "student" || user.role === "parent"
            ? "bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-xl shadow-gray-200/30"
            : "bg-white border-r border-gray-100"
        )}
        variants={sidebarVariants} initial="closed" animate={open ? "open" : "closed"}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className={cn("flex h-16 items-center justify-between px-6 border-b", (user.role === "student" || user.role === "parent") ? "border-white/20" : "border-gray-100")}>
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/20">
              <School className="h-4 w-4" />
            </div>
            <span className={cn("bg-clip-text text-lg font-bold text-transparent", (user.role === "student" || user.role === "parent") ? "bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500" : "bg-gradient-to-r from-gray-900 to-gray-600")}>
              AN-NADJAH
            </span>
          </Link>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:hidden transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
          {navItems.map((item, i) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/admin" && item.href !== "/student" && item.href !== "/teacher" && item.href !== "/parent" && pathname.startsWith(item.href));
            const isViewer = user.role === "student" || user.role === "parent";
            const viewerGradient = user.role === "student" ? "from-blue-500 via-indigo-500 to-violet-500" : "from-violet-500 via-purple-500 to-pink-500";
            const viewerGlow = user.role === "student" ? "shadow-blue-500/25" : "shadow-violet-500/25";

            return (
              <motion.div key={item.nameKey} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Link href={item.href} onClick={onClose}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive && isViewer && cn("bg-gradient-to-r", viewerGradient, "text-white shadow-lg", viewerGlow, "hover:shadow-xl hover:brightness-110"),
                    isActive && !isViewer && "bg-primary-50 text-primary-700",
                    !isActive && "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  {isActive && !isViewer && (
                    <motion.div layoutId="sidebar-active" className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary-600"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className={cn("flex items-center justify-center", isActive && isViewer && "drop-shadow-sm")}>
                    <Icon />
                  </span>
                  {t(item.nameKey)}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <div className={cn("p-4", (user.role === "student" || user.role === "parent") ? "border-t border-white/20" : "border-t border-gray-100")}>
          <div className={cn("flex items-center gap-3 rounded-xl p-3", (user.role === "student" || user.role === "parent") ? "bg-white/60 backdrop-blur-md border border-white/30 shadow-sm" : "bg-gray-50")}>
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm",
              (user.role === "student" || user.role === "parent") ? "bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 shadow-primary-500/20" : "bg-gradient-to-br from-primary-500 to-primary-600"
            )}>
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className={cn("mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              (user.role === "student" || user.role === "parent") ? "text-gray-500 hover:bg-red-50/80 hover:text-red-600" : "text-gray-500 hover:bg-red-50 hover:text-red-600"
            )}
          >
            <LogOut className="h-4 w-4" />
            {t("common.signOut")}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
