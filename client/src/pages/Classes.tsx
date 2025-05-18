import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Class, Teacher } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

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
import ClassForm from "@/components/ClassForm";
import { BookOpen } from "lucide-react";

export default function Classes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [sortKey, setSortKey] = useState<string>("className");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  // Fetch classes
  const { data: classes, isLoading: classesLoading, error: classesError } = useQuery<Class[]>({
    queryKey: ["/api/classes"],
  });

  // Fetch teachers for reference
  const { data: teachers, isLoading: teachersLoading } = useQuery<Teacher[]>({
    queryKey: ["/api/teachers"],
  });

  if (classesError) {
    toast({
      title: "Error",
      description: "Failed to load classes. Please try again.",
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

  // Sort classes
  const sortedClasses = classes
    ? [...classes].sort((a, b) => {
        let aValue: any = a[sortKey as keyof Class];
        let bValue: any = b[sortKey as keyof Class];
        
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

  // Get teacher name by ID
  const getTeacherName = (teacherId?: number): string => {
    if (!teacherId || !teachers) return "Unassigned";
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : "Unassigned";
  };

  // Handle view class (simplified view in this implementation)
  const handleViewClass = (classData: Class) => {
    setSelectedClass(classData);
    setShowEditDialog(true); // Reuse edit dialog for view
  };

  // Handle edit class
  const handleEditClass = (classData: Class) => {
    setSelectedClass(classData);
    setShowEditDialog(true);
  };

  // Handle delete class
  const handleDeleteClass = async (classData: Class) => {
    try {
      await apiRequest("DELETE", `/api/classes/${classData.id}`);
      toast({
        title: "Success",
        description: "Class deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete class. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Class table columns
  const classColumns = [
    {
      key: "classCode",
      header: "Code",
      sortable: true,
    },
    {
      key: "className",
      header: "Class Name",
      cell: (classData: Class) => (
        <div className="flex items-center">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 mr-2">
            <BookOpen className="h-3 w-3 mr-1" />
            {classData.classCode}
          </Badge>
          <span className="font-medium">{classData.className}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: "gradeLevel",
      header: "Grade",
      cell: (classData: Class) => (
        <div>
          Grade {classData.gradeLevel}
          {classData.section && <span>-{classData.section}</span>}
        </div>
      ),
      sortable: true,
    },
    {
      key: "teacher",
      header: "Teacher",
      cell: (classData: Class) => getTeacherName(classData.teacherId),
    },
    {
      key: "schedule",
      header: "Schedule",
      cell: (classData: Class) => (
        <div>
          <div>{classData.schedule || "No schedule"}</div>
          <div className="text-gray-500 text-xs">Room: {classData.roomNumber || "TBD"}</div>
        </div>
      ),
    },
    {
      key: "academicYear",
      header: "Academic Year",
      cell: (classData: Class) => classData.academicYear,
      sortable: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Classes</h1>
        <p className="text-gray-600">Manage class information and schedules</p>
      </div>

      <DataTable
        title="Class List"
        data={sortedClasses}
        columns={classColumns}
        isLoading={classesLoading || teachersLoading}
        onAdd={() => setShowAddDialog(true)}
        onView={handleViewClass}
        onEdit={handleEditClass}
        onDelete={handleDeleteClass}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={handleSort}
        downloadable={true}
        fileName="classes_list"
        emptyMessage="No classes found"
      />

      {/* Add Class Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Add New Class</DialogTitle>
            <DialogDescription>
              Fill in the form below to create a new class.
            </DialogDescription>
          </DialogHeader>
          <ClassForm 
            onSuccess={() => {
              setShowAddDialog(false);
              queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
            }}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Class Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
            <DialogDescription>
              Make changes to the class information below.
            </DialogDescription>
          </DialogHeader>
          {selectedClass && (
            <ClassForm 
              classData={selectedClass}
              onSuccess={() => {
                setShowEditDialog(false);
                queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
              }}
              onCancel={() => setShowEditDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
