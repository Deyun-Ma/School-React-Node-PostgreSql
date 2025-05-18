import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Student, ClassEnrollment, Grade, Attendance } from "@shared/schema";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Book, BookOpen, GraduationCap, Users, CalendarCheck, BarChart } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import StudentForm from "./StudentForm";

interface StudentProfileProps {
  student: Student;
  onClose?: () => void;
}

export default function StudentProfile({ student, onClose }: StudentProfileProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Fetch enrollments for this student
  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery<ClassEnrollment[]>({
    queryKey: ["/api/class-enrollments", student.id],
  });

  // Fetch grades for this student
  const { data: grades, isLoading: gradesLoading } = useQuery<Grade[]>({
    queryKey: ["/api/grades", student.id],
  });

  // Fetch attendance records for this student
  const { data: attendance, isLoading: attendanceLoading } = useQuery<Attendance[]>({
    queryKey: ["/api/attendance", student.id],
  });

  // Fetch classes for reference
  const { data: classes } = useQuery({
    queryKey: ["/api/classes"],
  });

  // Helper to get class name by ID
  const getClassName = (classId: number) => {
    const classObject = classes?.find((c: any) => c.id === classId);
    return classObject ? `${classObject.className} (${classObject.classCode})` : "Unknown Class";
  };

  // Format date
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return format(date, "MMMM dd, yyyy");
  };

  // Calculate age
  const calculateAge = (dob: Date) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Calculate grade point average
  const calculateGPA = () => {
    if (!grades || grades.length === 0) return "N/A";
    
    let totalPercentage = 0;
    grades.forEach(grade => {
      const percentage = (Number(grade.score) / Number(grade.maxScore)) * 100;
      totalPercentage += percentage;
    });
    
    const averagePercentage = totalPercentage / grades.length;
    
    // Convert percentage to 4.0 scale (approximate)
    let gpa;
    if (averagePercentage >= 90) gpa = 4.0;
    else if (averagePercentage >= 80) gpa = 3.0 + (averagePercentage - 80) / 10;
    else if (averagePercentage >= 70) gpa = 2.0 + (averagePercentage - 70) / 10;
    else if (averagePercentage >= 60) gpa = 1.0 + (averagePercentage - 60) / 10;
    else gpa = 0.0;
    
    return gpa.toFixed(1);
  };

  // Calculate attendance rate
  const calculateAttendanceRate = () => {
    if (!attendance || attendance.length === 0) return "N/A";
    
    const presentCount = attendance.filter(record => 
      record.status === "present" || record.status === "late"
    ).length;
    
    const rate = (presentCount / attendance.length) * 100;
    return `${rate.toFixed(1)}%`;
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
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

  return (
    <div className="space-y-6">
      {/* Student Information Card */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">
              {student.firstName} {student.lastName}
            </CardTitle>
            <CardDescription>Student ID: {student.studentId}</CardDescription>
          </div>
          <Button onClick={() => setShowEditDialog(true)}>Edit Profile</Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 flex flex-col items-center">
              <div className="h-32 w-32 rounded-full overflow-hidden mb-4">
                <img
                  src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(`${student.firstName} ${student.lastName}`)}&background=random&size=128`}
                  alt={`${student.firstName} ${student.lastName}`}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium">{student.gradeLevel}-{student.section}</p>
                <p className="text-sm text-gray-500">{student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : 'Other'} • {calculateAge(student.dateOfBirth)} years</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 w-full">
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-500">GPA</p>
                  <p className="text-lg font-semibold text-blue-700">{calculateGPA()}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Attendance</p>
                  <p className="text-lg font-semibold text-green-700">{calculateAttendanceRate()}</p>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p>{student.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p>{student.phone || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p>{formatDate(student.dateOfBirth)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Enrollment Date</p>
                  <p>{formatDate(student.enrollmentDate)}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Address</p>
                  <p>{student.address || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Guardian Name</p>
                  <p>{student.guardianName || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Guardian Phone</p>
                  <p>{student.guardianPhone || "Not provided"}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for academic information */}
      <Tabs defaultValue="enrollments">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="enrollments" className="flex items-center">
            <BookOpen className="h-4 w-4 mr-2" /> Enrollments
          </TabsTrigger>
          <TabsTrigger value="grades" className="flex items-center">
            <BarChart className="h-4 w-4 mr-2" /> Grades
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center">
            <CalendarCheck className="h-4 w-4 mr-2" /> Attendance
          </TabsTrigger>
        </TabsList>
        
        {/* Enrollments Tab */}
        <TabsContent value="enrollments">
          <Card>
            <CardHeader>
              <CardTitle>Class Enrollments</CardTitle>
              <CardDescription>Classes the student is currently enrolled in</CardDescription>
            </CardHeader>
            <CardContent>
              {enrollmentsLoading ? (
                <div className="text-center py-4">Loading enrollments...</div>
              ) : enrollments && enrollments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class</TableHead>
                      <TableHead>Enrollment Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell className="font-medium">{getClassName(enrollment.classId)}</TableCell>
                        <TableCell>{formatDate(enrollment.enrollmentDate)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No enrollments found for this student
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Grades Tab */}
        <TabsContent value="grades">
          <Card>
            <CardHeader>
              <CardTitle>Academic Grades</CardTitle>
              <CardDescription>Student's performance in various assignments</CardDescription>
            </CardHeader>
            <CardContent>
              {gradesLoading ? (
                <div className="text-center py-4">Loading grades...</div>
              ) : grades && grades.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class</TableHead>
                      <TableHead>Assignment</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grades.map((grade) => (
                      <TableRow key={grade.id}>
                        <TableCell>{getClassName(grade.classId)}</TableCell>
                        <TableCell className="font-medium">{grade.assignmentName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {grade.assignmentType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {grade.score}/{grade.maxScore} 
                          ({((Number(grade.score) / Number(grade.maxScore)) * 100).toFixed(1)}%)
                        </TableCell>
                        <TableCell>{formatDate(grade.gradedDate)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No grades recorded for this student
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Attendance Tab */}
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>Student's attendance history</CardDescription>
            </CardHeader>
            <CardContent>
              {attendanceLoading ? (
                <div className="text-center py-4">Loading attendance records...</div>
              ) : attendance && attendance.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{formatDate(record.date)}</TableCell>
                        <TableCell>{getClassName(record.classId)}</TableCell>
                        <TableCell>
                          <Badge className={`capitalize ${getStatusBadgeColor(record.status)}`}>
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.notes || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No attendance records found for this student
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Student Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Edit Student Profile</DialogTitle>
            <DialogDescription>
              Make changes to the student's information below.
            </DialogDescription>
          </DialogHeader>
          <StudentForm 
            student={student} 
            onSuccess={() => {
              setShowEditDialog(false);
              // Refresh student data if needed
            }}
            onCancel={() => setShowEditDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
