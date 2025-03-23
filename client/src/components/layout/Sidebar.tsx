import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

type SidebarItemProps = {
  href: string;
  icon: string;
  label: string;
  active?: boolean;
};

const SidebarItem = ({ href, icon, label, active }: SidebarItemProps) => {
  return (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-md",
          active
            ? "bg-primary/10 text-primary"
            : "text-neutral-700 hover:bg-neutral-100"
        )}
      >
        <i className={`${icon} mr-3 text-lg`}></i>
        {label}
      </a>
    </Link>
  );
};

const Sidebar = () => {
  const [location] = useLocation();

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-white border-r border-neutral-200">
        <div className="flex items-center h-16 px-6 border-b border-neutral-200">
          <div className="flex items-center">
            <i className="ri-medicine-bottle-line text-primary text-2xl mr-2"></i>
            <span className="text-lg font-semibold text-neutral-900">PharmaSys</span>
          </div>
        </div>
        <div className="flex flex-col flex-grow overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            <SidebarItem 
              href="/" 
              icon="ri-dashboard-line" 
              label="Dashboard" 
              active={location === "/"} 
            />
            <SidebarItem 
              href="/inventory" 
              icon="ri-medicine-bottle-line" 
              label="Inventory" 
              active={location === "/inventory"} 
            />
            <SidebarItem 
              href="/orders" 
              icon="ri-shopping-cart-line" 
              label="Orders" 
              active={location === "/orders"} 
            />
            <SidebarItem 
              href="/customers" 
              icon="ri-user-3-line" 
              label="Customers" 
              active={location === "/customers"} 
            />
            <SidebarItem 
              href="/suppliers" 
              icon="ri-truck-line" 
              label="Suppliers" 
              active={location === "/suppliers"} 
            />
            <SidebarItem 
              href="/reports" 
              icon="ri-line-chart-line" 
              label="Reports" 
              active={location === "/reports"} 
            />
            <SidebarItem 
              href="/settings" 
              icon="ri-settings-line" 
              label="Settings" 
              active={location === "/settings"} 
            />
          </nav>
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
    </div>
  );
};

export default Sidebar;
