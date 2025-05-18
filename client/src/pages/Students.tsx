import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Student } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

import DataTable from "@/components/DataTable";
import AvatarPlaceholder from "@/components/ui/avatar-placeholder";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import StudentForm from "@/components/StudentForm";
import StudentProfile from "@/components/StudentProfile";

export default function Students() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [sortKey, setSortKey] = useState<string>("firstName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentProfile, setShowStudentProfile] = useState(false);

  // Fetch students
  const { data: students, isLoading, error } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load students. Please try again.",
      variant: "destructive",
    });
  }

  // Handle sort
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  // Sort students
  const sortedStudents = students
    ? [...students].sort((a, b) => {
        let aValue: any = a[sortKey as keyof Student];
        let bValue: any = b[sortKey as keyof Student];
        
        // Handle special case for name sorting
        if (sortKey === "name") {
          aValue = `${a.firstName} ${a.lastName}`;
          bValue = `${b.firstName} ${b.lastName}`;
        } else if (sortKey === "gradeSection") {
          aValue = `${a.gradeLevel}${a.section}`;
          bValue = `${b.gradeLevel}${b.section}`;
        }
        
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      })
    : [];

  // Handle view student
  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowStudentProfile(true);
  };

  // Handle edit student
  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowEditDialog(true);
  };

  // Handle delete student
  const handleDeleteStudent = async (student: Student) => {
    try {
      await apiRequest("DELETE", `/api/students/${student.id}`);
      toast({
        title: "Success",
        description: "Student deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete student. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Student table columns
  const studentColumns = [
    {
      key: "studentId",
      header: "ID",
      sortable: true,
    },
    {
      key: "name",
      header: "Name",
      cell: (student: Student) => (
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
      cell: (student: Student) => `Grade ${student.gradeLevel}-${student.section}`,
      sortable: true,
    },
    {
      key: "contact",
      header: "Contact",
      cell: (student: Student) => (
        <div>
          <div>{student.email}</div>
          <div className="text-gray-500 text-xs">{student.phone || 'No phone'}</div>
        </div>
      ),
    },
    {
      key: "guardian",
      header: "Guardian",
      cell: (student: Student) => (
        <div>
          <div>{student.guardianName || 'N/A'}</div>
          <div className="text-gray-500 text-xs">{student.guardianPhone || 'No phone'}</div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Students</h1>
        <p className="text-gray-600">Manage student information and records</p>
      </div>

      <DataTable
        title="Student List"
        data={sortedStudents}
        columns={studentColumns}
        isLoading={isLoading}
        onAdd={() => setShowAddDialog(true)}
        onView={handleViewStudent}
        onEdit={handleEditStudent}
        onDelete={handleDeleteStudent}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={handleSort}
        downloadable={true}
        fileName="students_list"
        emptyMessage="No students found"
      />

      {/* Add Student Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Fill in the form below to create a new student record.
            </DialogDescription>
          </DialogHeader>
          <StudentForm 
            onSuccess={() => {
              setShowAddDialog(false);
              queryClient.invalidateQueries({ queryKey: ["/api/students"] });
            }}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Make changes to the student's information below.
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <StudentForm 
              student={selectedStudent}
              onSuccess={() => {
                setShowEditDialog(false);
                queryClient.invalidateQueries({ queryKey: ["/api/students"] });
              }}
              onCancel={() => setShowEditDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Student Profile Drawer */}
      <Sheet open={showStudentProfile} onOpenChange={setShowStudentProfile}>
        <SheetContent className="sm:max-w-[800px] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Student Profile</SheetTitle>
            <SheetDescription>
              View detailed information about the student.
            </SheetDescription>
          </SheetHeader>
          
          {selectedStudent && (
            <StudentProfile 
              student={selectedStudent}
              onClose={() => setShowStudentProfile(false)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
