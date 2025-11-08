'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutGrid, Calendar, BarChart3, LogOut, Play, Pause, Menu, X, Settings } from 'lucide-react';
import { format } from 'date-fns';

const Navigation = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const navItems = [
    { name: 'Kanban', path: '/kanban', icon: LayoutGrid },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsSidebarOpen(false);
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Side - Logo & Hamburger */}
            <div className="flex items-center gap-4">
              {/* Hamburger Menu Button (Mobile) */}
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900 p-2"
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>

              <div className="flex items-center">
                <h1 className="text-xl font-bold text-blue-600">TaskFlow</h1>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;

                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => router.push(item.path)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2 md:gap-6">
              {/* Date Display (Hidden on small screens) */}
              <div className="hidden xl:block text-sm text-gray-600">
                {format(currentTime, 'EEEE, MMMM d, yyyy')}
              </div>

              {/* Timer */}
              <div className="flex items-center gap-2 bg-gray-50 px-2 md:px-4 py-2 rounded-lg">
                <span className="text-xs md:text-sm font-mono text-gray-900 min-w-[60px] md:min-w-[70px]">
                  {formatTimer(timerSeconds)}
                </span>
                <button
                  type="button"
                  onClick={toggleTimer}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                  title={isTimerRunning ? 'Pause Timer' : 'Start Timer'}
                >
                  {isTimerRunning ? <Pause size={18} /> : <Play size={18} />}
                </button>
                {timerSeconds > 0 && (
                  <button
                    type="button"
                    onClick={resetTimer}
                    className="hidden md:block text-xs text-gray-500 hover:text-red-600 transition-colors"
                    title="Reset Timer"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* User Info (Hidden on small screens) */}
              <span className="hidden md:block text-sm text-gray-600">
                {user?.username || user?.email}
              </span>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 px-2 md:px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
                <span className="hidden md:inline font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setIsSidebarOpen(false);
          }}
          aria-label="Close menu"
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-blue-600">TaskFlow</h1>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="text-gray-600 hover:text-gray-900 p-2"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          {/* User Info in Sidebar */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-lg">
                  {(user?.username?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.username || user?.email}
                </p>
                <p className="text-xs text-gray-500">Free Plan</p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;

                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                handleLogout();
                setIsSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;
