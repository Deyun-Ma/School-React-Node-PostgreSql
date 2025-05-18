import { useQuery } from "@tanstack/react-query";
import { Activity } from "@shared/schema";
import { format } from "date-fns";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, UserPlus, CheckSquare, BookOpen, User } from "lucide-react";

interface ActivityListProps {
  limit?: number;
}

export default function ActivityList({ limit }: ActivityListProps) {
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const getActivityIcon = (action: string) => {
    switch (true) {
      case action.includes("Grade"):
        return <FileText className="h-5 w-5 text-blue-500" />;
      case action.includes("Student"):
        return <UserPlus className="h-5 w-5 text-emerald-500" />;
      case action.includes("Attendance"):
        return <CheckSquare className="h-5 w-5 text-amber-500" />;
      case action.includes("Class"):
        return <BookOpen className="h-5 w-5 text-indigo-500" />;
      case action.includes("Teacher"):
        return <User className="h-5 w-5 text-purple-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  // Format date
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return format(date, "MMM dd, yyyy");
  };

  const displayActivities = limit
    ? activities?.slice(0, limit)
    : activities;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayActivities && displayActivities.length > 0 ? (
              displayActivities.map((activity) => (
                <TableRow key={activity.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium flex items-center">
                    <span className="mr-2">
                      {getActivityIcon(activity.action)}
                    </span>
                    {activity.action}
                  </TableCell>
                  <TableCell>Admin</TableCell>
                  <TableCell>{formatDate(activity.timestamp)}</TableCell>
                  <TableCell>{activity.details}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No activities found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
