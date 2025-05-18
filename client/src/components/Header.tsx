import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { BellIcon, Menu, Settings, User, LogOut } from "lucide-react";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const { user, logout } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Sample notifications - in a real app these would come from the server
  const notifications = [
    {
      id: 1,
      type: "report",
      title: "New attendance report available",
      message: "Grade 10-A attendance for May is ready for review.",
      time: "2 hours ago",
      iconClass: "bg-blue-100 text-blue-600",
    },
    {
      id: 2,
      type: "user",
      title: "New student registered",
      message: "Emma Thompson has been registered in Grade 9-B.",
      time: "1 day ago",
      iconClass: "bg-emerald-100 text-emerald-600",
    },
  ];

  return (
    <header className="bg-white shadow-sm h-16 flex items-center px-4 sticky top-0 z-30">
      <button
        onClick={toggleSidebar}
        className="mr-4 text-gray-500 hover:text-gray-900 md:hidden"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="flex-1 flex justify-end items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <DropdownMenu
            open={notificationsOpen}
            onOpenChange={setNotificationsOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="bg-gray-100 rounded-full hover:bg-gray-200"
              >
                <BellIcon className="h-5 w-5 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="font-medium text-gray-800">
                Notifications
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="p-0 focus:bg-gray-50"
                  >
                    <div className="px-4 py-3 w-full">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                          <span
                            className={`p-2 rounded-full inline-flex items-center justify-center ${notification.iconClass}`}
                          >
                            {notification.type === "report" ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                                <polyline points="10 9 9 9 8 9" />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="8.5" cy="7" r="4" />
                                <line x1="20" y1="8" x2="20" y2="14" />
                                <line x1="23" y1="11" x2="17" y2="11" />
                              </svg>
                            )}
                          </span>
                        </div>
                        <div className="ml-3 w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {notification.message}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex justify-center text-blue-600 hover:text-blue-700 cursor-pointer"
                onClick={() => setNotificationsOpen(false)}
              >
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* User Menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center text-sm font-medium text-gray-700 hover:bg-transparent focus:outline-none focus:ring-0"
              >
                <span className="hidden md:block mr-2">{user.fullName}</span>
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`}
                  alt="User avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="px-4 py-2 text-sm">
                <User className="w-4 h-4 mr-2" />
                Your Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="px-4 py-2 text-sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="px-4 py-2 text-sm cursor-pointer"
                onClick={logout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};

export default Header;
