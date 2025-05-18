import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  School,
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: "/", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5 mr-3" /> },
    { path: "/students", label: "Students", icon: <Users className="w-5 h-5 mr-3" /> },
    { path: "/teachers", label: "Teachers", icon: <GraduationCap className="w-5 h-5 mr-3" /> },
    { path: "/classes", label: "Classes", icon: <BookOpen className="w-5 h-5 mr-3" /> },
    { path: "/attendance", label: "Attendance", icon: <CalendarCheck className="w-5 h-5 mr-3" /> },
    { path: "/grades", label: "Grades", icon: <BarChart3 className="w-5 h-5 mr-3" /> },
  ];

  const settingsItems = [
    { path: "/settings", label: "Settings", icon: <Settings className="w-5 h-5 mr-3" /> },
    { path: "/help", label: "Help & Support", icon: <HelpCircle className="w-5 h-5 mr-3" /> },
  ];

  return (
    <aside
      className={cn(
        "fixed md:sticky top-0 left-0 z-40 h-screen md:h-auto w-64 bg-white border-r border-gray-200 transition-transform duration-300 md:transition-none flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100">
        <div className="flex items-center">
          <School className="w-6 h-6 text-primary mr-2" />
          <span className="font-semibold text-gray-900">SchoolSync</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden text-gray-500 hover:text-gray-900"
        >
          <span className="sr-only">Close sidebar</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Main
          </p>

          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  location === item.path
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                {item.icon}
                {item.label}
              </a>
            </Link>
          ))}
        </div>

        <div className="mt-8 space-y-1">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Settings
          </p>

          {settingsItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  location === item.path
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                {item.icon}
                {item.label}
              </a>
            </Link>
          ))}
        </div>
      </nav>

      {/* User */}
      {user && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`}
              alt="User avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user.fullName}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="ml-auto text-gray-400 hover:text-gray-700"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
