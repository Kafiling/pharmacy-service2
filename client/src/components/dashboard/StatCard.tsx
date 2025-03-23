import { Link } from "wouter";
import { cn } from "@/lib/utils";

type StatCardProps = {
  icon: string;
  iconClass?: string;
  title: string;
  value: string | number;
  link: {
    text: string;
    href: string;
  };
};

const StatCard = ({ icon, iconClass, title, value, link }: StatCardProps) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 p-3 rounded-full", iconClass || "bg-primary/10")}>
            <i className={`${icon} ${!iconClass ? "text-primary" : ""} text-xl`}></i>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-neutral-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-semibold text-neutral-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-neutral-50 px-5 py-3">
        <div className="text-sm">
          <Link href={link.href}>
            <a className="font-medium text-primary hover:text-primary-dark">
              {link.text}
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
