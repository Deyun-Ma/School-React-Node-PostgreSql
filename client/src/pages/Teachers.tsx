import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Teacher } from "@shared/schema";
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
import { Badge } from "@/components/ui/badge";
import TeacherForm from "@/components/TeacherForm";
import { format } from "date-fns";

export default function Teachers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [sortKey, setSortKey] = useState<string>("firstName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  // Fetch teachers
  const { data: teachers, isLoading, error } = useQuery<Teacher[]>({
    queryKey: ["/api/teachers"],
  });

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load teachers. Please try again.",
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

  // Sort teachers
  const sortedTeachers = teachers
    ? [...teachers].sort((a, b) => {
        let aValue: any = a[sortKey as keyof Teacher];
        let bValue: any = b[sortKey as keyof Teacher];
        
        // Handle special case for name sorting
        if (sortKey === "name") {
          aValue = `${a.firstName} ${a.lastName}`;
          bValue = `${b.firstName} ${b.lastName}`;
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

  // Handle view teacher (simplified view in this implementation)
  const handleViewTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowEditDialog(true); // Reuse edit dialog for view
  };

  // Handle edit teacher
  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowEditDialog(true);
  };

  // Handle delete teacher
  const handleDeleteTeacher = async (teacher: Teacher) => {
    try {
      await apiRequest("DELETE", `/api/teachers/${teacher.id}`);
      toast({
        title: "Success",
        description: "Teacher deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete teacher. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return format(new Date(date), "MMM dd, yyyy");
  };

  // Teacher table columns
  const teacherColumns = [
    {
      key: "teacherId",
      header: "ID",
      sortable: true,
    },
    {
      key: "name",
      header: "Name",
      cell: (teacher: Teacher) => (
        <div className="flex items-center">
          <AvatarPlaceholder
            src={teacher.avatar}
            name={`${teacher.firstName} ${teacher.lastName}`}
            className="h-8 w-8 mr-3"
          />
          <div>
            <div className="font-medium">{teacher.firstName} {teacher.lastName}</div>
            <div className="text-gray-500 text-xs">{teacher.qualification || 'No qualification'}</div>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "subjects",
      header: "Subjects",
      cell: (teacher: Teacher) => (
        <div className="flex flex-wrap gap-1">
          {teacher.subjects && teacher.subjects.length > 0 ? 
            teacher.subjects.map((subject, index) => (
              <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {subject}
              </Badge>
            )) : 
            "No subjects"
          }
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      cell: (teacher: Teacher) => (
        <div>
          <div>{teacher.email}</div>
          <div className="text-gray-500 text-xs">{teacher.phone || 'No phone'}</div>
        </div>
      ),
    },
    {
      key: "joinDate",
      header: "Join Date",
      cell: (teacher: Teacher) => formatDate(teacher.joinDate),
      sortable: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Teachers</h1>
        <p className="text-gray-600">Manage faculty information and assignments</p>
      </div>

      <DataTable
        title="Teacher List"
        data={sortedTeachers}
        columns={teacherColumns}
        isLoading={isLoading}
        onAdd={() => setShowAddDialog(true)}
        onView={handleViewTeacher}
        onEdit={handleEditTeacher}
        onDelete={handleDeleteTeacher}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={handleSort}
        downloadable={true}
        fileName="teachers_list"
        emptyMessage="No teachers found"
      />

      {/* Add Teacher Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Add New Teacher</DialogTitle>
            <DialogDescription>
              Fill in the form below to create a new teacher record.
            </DialogDescription>
          </DialogHeader>
          <TeacherForm 
            onSuccess={() => {
              setShowAddDialog(false);
              queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
            }}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Teacher Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Edit Teacher</DialogTitle>
            <DialogDescription>
              Make changes to the teacher's information below.
            </DialogDescription>
          </DialogHeader>
          {selectedTeacher && (
            <TeacherForm 
              teacher={selectedTeacher}
              onSuccess={() => {
                setShowEditDialog(false);
                queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
              }}
              onCancel={() => setShowEditDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
