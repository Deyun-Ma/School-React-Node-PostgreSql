import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Attendance as AttendanceType, Class, Student } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import AttendanceForm from "@/components/AttendanceForm";
import AvatarPlaceholder from "@/components/ui/avatar-placeholder";

export default function AttendancePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedClass, setSelectedClass] = useState<number | undefined>();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceType | null>(null);

  // Fetch classes for filter
  const { data: classes, isLoading: classesLoading } = useQuery<Class[]>({
    queryKey: ["/api/classes"],
  });

  // Fetch attendance records filtered by date and class
  const { data: attendanceRecords, isLoading: attendanceLoading } = useQuery<AttendanceType[]>({
    queryKey: ["/api/attendance", { date: selectedDate, classId: selectedClass }],
    enabled: !!selectedDate,
  });

  // Fetch students for reference
  const { data: students } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  // Get student name by ID
  const getStudentName = (studentId: number): string => {
    if (!students) return "Unknown Student";
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : "Unknown Student";
  };

  // Get student by ID
  const getStudent = (studentId: number): Student | undefined => {
    if (!students) return undefined;
    return students.find(s => s.id === studentId);
  };

  // Get class name by ID
  const getClassName = (classId: number): string => {
    if (!classes) return "Unknown Class";
    const classData = classes.find(c => c.id === classId);
    return classData ? `${classData.className} (${classData.classCode})` : "Unknown Class";
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return format(new Date(date), "MMMM dd, yyyy");
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string): string => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800";
      case "absent":
        return "bg-red-100 text-red-800";
      case "late":
        return "bg-amber-100 text-amber-800";
      case "excused":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Handle edit attendance
  const handleEditAttendance = (attendance: AttendanceType) => {
    setSelectedAttendance(attendance);
    setShowEditDialog(true);
  };

  // Handle delete attendance
  const handleDeleteAttendance = async (attendance: AttendanceType) => {
    try {
      await apiRequest("DELETE", `/api/attendance/${attendance.id}`);
      toast({
        title: "Success",
        description: "Attendance record deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete attendance record. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Attendance table columns
  const attendanceColumns = [
    {
      key: "date",
      header: "Date",
      cell: (attendance: AttendanceType) => formatDate(attendance.date),
      sortable: true,
    },
    {
      key: "student",
      header: "Student",
      cell: (attendance: AttendanceType) => {
        const student = getStudent(attendance.studentId);
        return (
          <div className="flex items-center">
            <AvatarPlaceholder
              src={student?.avatar || undefined}
              name={getStudentName(attendance.studentId)}
              className="h-8 w-8 mr-3"
            />
            <span>{getStudentName(attendance.studentId)}</span>
          </div>
        );
      },
    },
    {
      key: "class",
      header: "Class",
      cell: (attendance: AttendanceType) => getClassName(attendance.classId),
    },
    {
      key: "status",
      header: "Status",
      cell: (attendance: AttendanceType) => (
        <Badge className={`capitalize ${getStatusBadgeColor(attendance.status)}`}>
          {attendance.status}
        </Badge>
      ),
    },
    {
      key: "notes",
      header: "Notes",
      cell: (attendance: AttendanceType) => attendance.notes || "-",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Attendance</h1>
        <p className="text-gray-600">Manage and track student attendance records</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class
            </label>
            <Select
              value={selectedClass?.toString()}
              onValueChange={(value) => 
                setSelectedClass(value ? parseInt(value) : undefined)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Classes</SelectItem>
                {classes?.map((classItem) => (
                  <SelectItem key={classItem.id} value={classItem.id.toString()}>
                    {classItem.className} ({classItem.classCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end space-x-2">
            <Button
              onClick={() => setShowAddDialog(true)}
              className="whitespace-nowrap"
            >
              <CalendarCheck className="h-4 w-4 mr-2" />
              Record Attendance
            </Button>
            
            <Button
              onClick={() => setShowBulkDialog(true)}
              variant="outline"
              className="whitespace-nowrap"
            >
              <Users className="h-4 w-4 mr-2" />
              Bulk Attendance
            </Button>
          </div>
        </div>
      </div>

      {/* Attendance Records */}
      <DataTable
        title="Attendance Records"
        data={attendanceRecords || []}
        columns={attendanceColumns}
        isLoading={attendanceLoading || classesLoading}
        onEdit={handleEditAttendance}
        onDelete={handleDeleteAttendance}
        downloadable={true}
        fileName={`attendance_${selectedDate}`}
        emptyMessage="No attendance records found for the selected criteria"
      />

      {/* Add Single Attendance Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Record Attendance</DialogTitle>
            <DialogDescription>
              Record attendance for an individual student.
            </DialogDescription>
          </DialogHeader>
          <AttendanceForm 
            classId={selectedClass}
            onSuccess={() => {
              setShowAddDialog(false);
              queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
            }}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Bulk Attendance Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Bulk Attendance</DialogTitle>
            <DialogDescription>
              Record attendance for all students in a class at once.
            </DialogDescription>
          </DialogHeader>
          <AttendanceForm 
            classId={selectedClass}
            isBulk={true}
            onSuccess={() => {
              setShowBulkDialog(false);
              queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
            }}
            onCancel={() => setShowBulkDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Attendance Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Edit Attendance</DialogTitle>
            <DialogDescription>
              Update the attendance record.
            </DialogDescription>
          </DialogHeader>
          {selectedAttendance && (
            <AttendanceForm 
              attendance={selectedAttendance}
              onSuccess={() => {
                setShowEditDialog(false);
                queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
              }}
              onCancel={() => setShowEditDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
