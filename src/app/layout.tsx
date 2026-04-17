'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Users,
  DollarSign,
  Settings,
  Menu,
  X,
  ChevronDown,
  Briefcase,
  Bell
} from 'lucide-react';

import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navItems = [
    { path: '/employees', name: 'Employees', icon: Users },
    { path: '/payroll', name: 'Payroll', icon: DollarSign },
  ];

  const isActive = (path: string) => pathname?.startsWith(path);

  return (
    <html lang="en">
      <body className="bg-gray-100 text-sm">

        {isMobile && (
          <div className="fixed top-0 left-0 right-0 bg-white border-b z-50 px-3 py-2 flex items-center justify-between">
            <button onClick={() => setSidebarOpen(true)} className="p-1">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-semibold">Payroll</h1>
          </div>
        )}

        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}


        <aside
          className={`
            fixed top-0 left-0 z-50 h-screen w-52
            bg-gray-900 text-white
            transition-transform duration-300
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0
          `}
        >
          <div className="flex items-center gap-2 p-4 border-b border-gray-800">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="font-semibold">Payroll</span>
          </div>

          <div className="p-4 border-b border-gray-800 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs">
              JD
            </div>
            <div className="flex-1">
              <p className="text-xs">John</p>
              <p className="text-[10px] text-gray-400">Admin</p>
            </div>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </div>

          <nav className="p-2 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => isMobile && setSidebarOpen(false)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-md text-sm
                    ${active
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'}
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main
          className={`
            min-h-screen transition-all
            ${isMobile ? 'mt-12' : 'ml-52'}
          `}
        >
          {!isMobile && (
            <div className="bg-white  px-4 py-2 flex justify-between items-center sticky top-0 z-30">
              <button
                onClick={() => setSidebarOpen(prev => !prev)}
                className="p-1"
              >
                <Menu className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-gray-600" />
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                    JD
                  </div>
                  <span className="text-xs">John</span>
                </div>
              </div>
            </div>
          )}

          <div className="p-2">
            {children}
          </div>
        </main>

      </body>
    </html>
  );
}