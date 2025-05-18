import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Grade, Class, Student } from "@shared/schema";
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
import { FileText, BarChart } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import GradeForm from "@/components/GradeForm";
import AvatarPlaceholder from "@/components/ui/avatar-placeholder";

export default function Grades() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedClass, setSelectedClass] = useState<number | undefined>();
  const [selectedStudent, setSelectedStudent] = useState<number | undefined>();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);

  // Fetch classes for filter
  const { data: classes, isLoading: classesLoading } = useQuery<Class[]>({
    queryKey: ["/api/classes"],
  });

  // Fetch students for filter
  const { data: students, isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  // Fetch grades filtered by class and student
  const { data: grades, isLoading: gradesLoading } = useQuery<Grade[]>({
    queryKey: ["/api/grades", { classId: selectedClass, studentId: selectedStudent }],
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

  // Get assignment type badge color
  const getAssignmentTypeBadgeColor = (type: string): string => {
    switch (type) {
      case "exam":
        return "bg-blue-100 text-blue-800";
      case "quiz":
        return "bg-green-100 text-green-800";
      case "homework":
        return "bg-amber-100 text-amber-800";
      case "project":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Handle edit grade
  const handleEditGrade = (grade: Grade) => {
    setSelectedGrade(grade);
    setShowEditDialog(true);
  };

  // Handle delete grade
  const handleDeleteGrade = async (grade: Grade) => {
    try {
      await apiRequest("DELETE", `/api/grades/${grade.id}`);
      toast({
        title: "Success",
        description: "Grade record deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/grades"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete grade record. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Grade table columns
  const gradeColumns = [
    {
      key: "assignment",
      header: "Assignment",
      cell: (grade: Grade) => (
        <div>
          <div className="font-medium">{grade.assignmentName}</div>
          <Badge className={`capitalize ${getAssignmentTypeBadgeColor(grade.assignmentType)}`}>
            {grade.assignmentType}
          </Badge>
        </div>
      ),
      sortable: true,
    },
    {
      key: "student",
      header: "Student",
      cell: (grade: Grade) => {
        const student = getStudent(grade.studentId);
        return (
          <div className="flex items-center">
            <AvatarPlaceholder
              src={student?.avatar}
              name={getStudentName(grade.studentId)}
              className="h-8 w-8 mr-3"
            />
            <span>{getStudentName(grade.studentId)}</span>
          </div>
        );
      },
    },
    {
      key: "class",
      header: "Class",
      cell: (grade: Grade) => getClassName(grade.classId),
    },
    {
      key: "score",
      header: "Score",
      cell: (grade: Grade) => {
        const percentage = ((Number(grade.score) / Number(grade.maxScore)) * 100).toFixed(1);
        const getScoreColor = () => {
          const scorePercent = Number(percentage);
          if (scorePercent >= 90) return "text-green-600";
          if (scorePercent >= 80) return "text-blue-600";
          if (scorePercent >= 70) return "text-amber-600";
          if (scorePercent >= 60) return "text-orange-600";
          return "text-red-600";
        };
        
        return (
          <div>
            <span className="font-medium">{grade.score}/{grade.maxScore}</span>
            <span className={`ml-2 ${getScoreColor()}`}>({percentage}%)</span>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: "date",
      header: "Graded Date",
      cell: (grade: Grade) => formatDate(new Date(grade.gradedDate)),
      sortable: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Grades</h1>
        <p className="text-gray-600">Manage and record student grades</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class
            </label>
            <Select
              value={selectedClass?.toString()}
              onValueChange={(value) => 
                setSelectedClass(value !== "all_classes" ? parseInt(value) : undefined)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_classes">All Classes</SelectItem>
                {classes?.map((classItem) => (
                  <SelectItem key={classItem.id} value={classItem.id.toString()}>
                    {classItem.className} ({classItem.classCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student
            </label>
            <Select
              value={selectedStudent?.toString()}
              onValueChange={(value) => 
                setSelectedStudent(value !== "all_students" ? parseInt(value) : undefined)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Students" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_students">All Students</SelectItem>
                {students?.map((student) => (
                  <SelectItem key={student.id} value={student.id.toString()}>
                    {student.firstName} {student.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={() => setShowAddDialog(true)}
              className="whitespace-nowrap"
            >
              <FileText className="h-4 w-4 mr-2" />
              Add Grade
            </Button>
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <DataTable
        title="Grade Records"
        data={grades || []}
        columns={gradeColumns}
        isLoading={gradesLoading || classesLoading || studentsLoading}
        onEdit={handleEditGrade}
        onDelete={handleDeleteGrade}
        downloadable={true}
        fileName="grades_export"
        emptyMessage="No grade records found for the selected criteria"
      />

      {/* Add Grade Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Add Grade</DialogTitle>
            <DialogDescription>
              Record a new grade for a student.
            </DialogDescription>
          </DialogHeader>
          <GradeForm 
            classId={selectedClass}
            onSuccess={() => {
              setShowAddDialog(false);
              queryClient.invalidateQueries({ queryKey: ["/api/grades"] });
            }}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Grade Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Edit Grade</DialogTitle>
            <DialogDescription>
              Update the grade record.
            </DialogDescription>
          </DialogHeader>
          {selectedGrade && (
            <GradeForm 
              grade={selectedGrade}
              onSuccess={() => {
                setShowEditDialog(false);
                queryClient.invalidateQueries({ queryKey: ["/api/grades"] });
              }}
              onCancel={() => setShowEditDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
