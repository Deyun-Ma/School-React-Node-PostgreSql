import { cn } from "@/lib/utils";
import {
  Users,
  UserCheck,
  BookOpen,
  CalendarCheck,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

type StatTrend = {
  value: number;
  direction: "up" | "down" | "none";
  label: string;
};

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: "students" | "teachers" | "classes" | "attendance";
  trend?: StatTrend;
  isLoading?: boolean;
}

const StatsCard = ({
  title,
  value,
  icon,
  trend,
  isLoading = false,
}: StatsCardProps) => {
  const getIcon = () => {
    switch (icon) {
      case "students":
        return (
          <div className="p-3 bg-blue-50 rounded-full">
            <Users className="h-5 w-5 text-blue-500" />
          </div>
        );
      case "teachers":
        return (
          <div className="p-3 bg-emerald-50 rounded-full">
            <UserCheck className="h-5 w-5 text-emerald-500" />
          </div>
        );
      case "classes":
        return (
          <div className="p-3 bg-indigo-50 rounded-full">
            <BookOpen className="h-5 w-5 text-indigo-500" />
          </div>
        );
      case "attendance":
        return (
          <div className="p-3 bg-amber-50 rounded-full">
            <CalendarCheck className="h-5 w-5 text-amber-500" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          {isLoading ? (
            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded mt-1"></div>
          ) : (
            <p className="text-2xl font-semibold text-gray-800">{value}</p>
          )}
        </div>
        {getIcon()}
      </div>

      {trend && !isLoading && (
        <div className="mt-4 flex items-center text-sm">
          <span
            className={cn(
              "flex items-center",
              trend.direction === "up" && "text-green-500",
              trend.direction === "down" && "text-red-500",
              trend.direction === "none" && "text-gray-400"
            )}
          >
            {trend.direction === "up" && <TrendingUp className="mr-1 h-4 w-4" />}
            {trend.direction === "down" && (
              <TrendingDown className="mr-1 h-4 w-4" />
            )}
            {trend.value !== 0 && `${trend.value}%`}
          </span>
          <span className="text-gray-400 ml-2">{trend.label}</span>
        </div>
      )}
    </div>
  );
};

export default StatsCard;
