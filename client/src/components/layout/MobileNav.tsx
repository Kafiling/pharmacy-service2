import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

type SidebarItemProps = {
  href: string;
  icon: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
};

const SidebarItem = ({ href, icon, label, active, onClick }: SidebarItemProps) => {
  return (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-md",
          active
            ? "bg-primary/10 text-primary"
            : "text-neutral-700 hover:bg-neutral-100"
        )}
        onClick={onClick}
      >
        <i className={`${icon} mr-3 text-lg`}></i>
        {label}
      </a>
    </Link>
  );
};

const MobileNav = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [location] = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile navbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-white border-b border-neutral-200">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <button 
              onClick={toggleSidebar} 
              className="p-2 text-neutral-500 rounded-md hover:bg-neutral-100"
            >
              <i className="ri-menu-line text-xl"></i>
            </button>
            <div className="flex items-center ml-2">
              <i className="ri-medicine-bottle-line text-primary text-xl mr-2"></i>
              <span className="text-lg font-semibold">PharmaSys</span>
            </div>
          </div>
          <div className="flex items-center">
            <button className="p-2 text-neutral-500 rounded-md hover:bg-neutral-100">
              <i className="ri-notification-3-line text-xl"></i>
            </button>
            <div className="ml-3 relative">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                JD
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-neutral-900/50 z-20 md:hidden",
          isSidebarOpen ? "block" : "hidden"
        )}
        onClick={closeSidebar}
      ></div>
      
      {/* Mobile sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 bg-white transform transition-transform duration-300 ease-in-out md:hidden",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-neutral-200">
            <div className="flex items-center">
              <i className="ri-medicine-bottle-line text-primary text-2xl mr-2"></i>
              <span className="text-lg font-semibold">PharmaSys</span>
            </div>
            <button 
              onClick={closeSidebar} 
              className="p-2 text-neutral-500 rounded-md hover:bg-neutral-100"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="px-2 py-4 space-y-1">
              <SidebarItem 
                href="/" 
                icon="ri-dashboard-line" 
                label="Dashboard" 
                active={location === "/"} 
                onClick={closeSidebar}
              />
              <SidebarItem 
                href="/inventory" 
                icon="ri-medicine-bottle-line" 
                label="Inventory" 
                active={location === "/inventory"} 
                onClick={closeSidebar}
              />
              <SidebarItem 
                href="/orders" 
                icon="ri-shopping-cart-line" 
                label="Orders" 
                active={location === "/orders"} 
                onClick={closeSidebar}
              />
              <SidebarItem 
                href="/customers" 
                icon="ri-user-3-line" 
                label="Customers" 
                active={location === "/customers"} 
                onClick={closeSidebar}
              />
              <SidebarItem 
                href="/suppliers" 
                icon="ri-truck-line" 
                label="Suppliers" 
                active={location === "/suppliers"} 
                onClick={closeSidebar}
              />
              <SidebarItem 
                href="/reports" 
                icon="ri-line-chart-line" 
                label="Reports" 
                active={location === "/reports"} 
                onClick={closeSidebar}
              />
              <SidebarItem 
                href="/settings" 
                icon="ri-settings-line" 
                label="Settings" 
                active={location === "/settings"} 
                onClick={closeSidebar}
              />
            </nav>
          </div>
          <div className="p-4 border-t border-neutral-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                JD
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-neutral-800">Dr. Jane Doe</p>
                <p className="text-xs text-neutral-500">Pharmacist</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileNav;
