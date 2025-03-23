import React, { useState, useEffect } from 'react';
import Sidebar from './sidebar';
import { Button } from "@/components/ui/button";
import { Pill, Menu, Bell } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';

type MainLayoutProps = {
  children: React.ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar when switching to desktop view
  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        isMobile={isMobile} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto md:ml-64">
        {/* Mobile Header */}
        {isMobile && (
          <div className="sticky top-0 z-40 bg-white border-b p-4">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open sidebar</span>
              </Button>
              
              <div className="flex items-center space-x-2">
                <Pill className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold">PharmaCare</span>
              </div>
              
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
            </div>
          </div>
        )}
        
        {/* Page Content */}
        <main className="px-4 py-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
