import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";

import StatsCard from "@/components/StatsCard";
import ActivityList from "@/components/ActivityList";
import EventCard from "@/components/EventCard";
import DataTable from "@/components/DataTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AvatarPlaceholder from "@/components/ui/avatar-placeholder";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard stats
  const { data: stats, error: statsError } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  // Fetch activities
  const { data: activities, error: activitiesError } = useQuery({
    queryKey: ["/api/activities"],
  });

  // Fetch upcoming events
  const { data: events, error: eventsError } = useQuery({
    queryKey: ["/api/events"],
  });

  // Fetch students for the table
  const { data: students, error: studentsError } = useQuery({
    queryKey: ["/api/students"],
  });

  // Show loading state for a minimum time to prevent flashing
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Show error toast if any fetches fail
  useEffect(() => {
    if (statsError) {
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics.",
        variant: "destructive",
      });
    }
    if (activitiesError) {
      toast({
        title: "Error",
        description: "Failed to load recent activities.",
        variant: "destructive",
      });
    }
    if (eventsError) {
      toast({
        title: "Error",
        description: "Failed to load upcoming events.",
        variant: "destructive",
      });
    }
    if (studentsError) {
      toast({
        title: "Error",
        description: "Failed to load student data.",
        variant: "destructive",
      });
    }
  }, [statsError, activitiesError, eventsError, studentsError, toast]);

  // Define student table columns
  const studentColumns = [
    {
      key: "studentId",
      header: "ID",
      sortable: true,
    },
    {
      key: "name",
      header: "Name",
      cell: (student: any) => (
        <div className="flex items-center">
          <AvatarPlaceholder
            src={student.avatar}
            name={`${student.firstName} ${student.lastName}`}
            className="h-8 w-8 mr-3"
          />
          <div>
            <div className="font-medium">{student.firstName} {student.lastName}</div>
            <div className="text-gray-500 text-xs">
              {student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : 'Other'} • {new Date().getFullYear() - new Date(student.dateOfBirth).getFullYear()} years
            </div>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "gradeSection",
      header: "Grade/Class",
      cell: (student: any) => `Grade ${student.gradeLevel}-${student.section}`,
      sortable: true,
    },
    {
      key: "contact",
      header: "Contact",
      cell: (student: any) => (
        <div>
          <div>{student.email}</div>
          <div className="text-gray-500 text-xs">{student.phone || 'No phone'}</div>
        </div>
      ),
    },
    {
      key: "attendance",
      header: "Attendance",
      cell: (student: any) => (
        <div className="flex items-center">
          <Badge className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {stats?.attendanceRate ? `${stats.attendanceRate}%` : "N/A"}
          </Badge>
        </div>
      ),
    },
    {
      key: "gpa",
      header: "GPA",
      cell: () => (
        // Placeholder since we don't have per-student GPA in the dashboard stats
        <span>3.5</span>
      ),
      sortable: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome back, here's what's happening with your school today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Students"
          value={isLoading ? "" : stats?.totalStudents || 0}
          icon="students"
          trend={{
            value: 12,
            direction: "up",
            label: "from last year"
          }}
          isLoading={isLoading}
        />
        <StatsCard
          title="Teachers"
          value={isLoading ? "" : stats?.totalTeachers || 0}
          icon="teachers"
          trend={{
            value: 4,
            direction: "up",
            label: "from last year"
          }}
          isLoading={isLoading}
        />
        <StatsCard
          title="Classes"
          value={isLoading ? "" : stats?.totalClasses || 0}
          icon="classes"
          trend={{
            value: 0,
            direction: "none",
            label: "No change"
          }}
          isLoading={isLoading}
        />
        <StatsCard
          title="Attendance Rate"
          value={isLoading ? "" : `${stats?.attendanceRate || 0}%`}
          icon="attendance"
          trend={{
            value: 1.8,
            direction: "down",
            label: "from last month"
          }}
          isLoading={isLoading}
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <ActivityList />
        </div>

        {/* Upcoming Events */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-12 h-14 bg-gray-200 animate-pulse rounded-md"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : events && events.length > 0 ? (
                <div className="space-y-4">
                  {events.slice(0, 4).map((event: any) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No upcoming events
                </div>
              )}

              <div className="mt-6 text-center">
                <Button variant="link" className="text-blue-600 hover:text-blue-800">
                  View Full Calendar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Students Summary */}
      <div>
        <DataTable
          title="Students Summary"
          data={isLoading ? [] : students || []}
          columns={studentColumns}
          isLoading={isLoading}
          onAdd={() => { window.location.href = "/students"; }}
          downloadable={true}
          fileName="students_summary"
          emptyMessage="No students found"
        />
      </div>
    </div>
  );
}
