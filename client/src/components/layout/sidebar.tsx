import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  LayoutDashboard, 
  PackageSearch, 
  ShoppingCart, 
  Users, 
  Truck, 
  BarChart2, 
  Settings, 
  LogOut,
  Pill
} from "lucide-react";

type SidebarProps = {
  isMobile: boolean;
  isOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ isMobile, isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();

  // Navigation items
  const navItems = [
    { href: "/", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5 mr-3" /> },
    { href: "/inventory", label: "Inventory", icon: <PackageSearch className="w-5 h-5 mr-3" /> },
    { href: "/orders", label: "Orders", icon: <ShoppingCart className="w-5 h-5 mr-3" /> },
    { href: "/customers", label: "Customers", icon: <Users className="w-5 h-5 mr-3" /> },
    { href: "/suppliers", label: "Suppliers", icon: <Truck className="w-5 h-5 mr-3" /> },
    { href: "/reports", label: "Reports", icon: <BarChart2 className="w-5 h-5 mr-3" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="w-5 h-5 mr-3" /> },
  ];

  // CSS classes for mobile or desktop sidebar
  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-64 bg-white border-r shadow-sm flex flex-col h-full
    ${isMobile ? 
      (isOpen ? 'translate-x-0' : '-translate-x-full') : 
      'translate-x-0'}
    transform transition-transform duration-300 ease-in-out
  `;

  return (
    <div className={sidebarClasses}>
      <div className="flex items-center p-4 border-b">
        <div className="flex items-center space-x-2">
          <Pill className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold">PharmaCare</span>
        </div>
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto" 
            onClick={onClose}
          >
            <span className="sr-only">Close sidebar</span>
            <span aria-hidden="true">&times;</span>
          </Button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto py-2">
        <nav className="px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={isMobile ? onClose : undefined}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? "bg-primary-50 text-primary"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-4 border-t">
        <div className="flex items-center">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=128&q=80" alt="User avatar" />
            <AvatarFallback>SJ</AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-800">Dr. Sarah Johnson</p>
            <p className="text-xs text-gray-500">Pharmacist</p>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto">
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Sign out</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
