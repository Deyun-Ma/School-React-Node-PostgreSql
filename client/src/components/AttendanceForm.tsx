import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertAttendanceSchema, InsertAttendance } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient, useQuery } from "@tanstack/react-query";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Extend the attendance schema with client-side validation
const attendanceFormSchema = insertAttendanceSchema.extend({
  date: z.string().min(1, "Date is required"),
  studentIds: z.array(z.number()).optional(),
});

type AttendanceFormValues = z.infer<typeof attendanceFormSchema>;

interface AttendanceFormProps {
  attendance?: any;
  classId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
  isBulk?: boolean;
}

export default function AttendanceForm({ 
  attendance, 
  classId, 
  onSuccess, 
  onCancel,
  isBulk = false 
}: AttendanceFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClass, setSelectedClass] = useState<number | undefined>(classId);
  const [studentStatuses, setStudentStatuses] = useState<{[key: number]: string}>({});

  // Format today's date as YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  const defaultValues: Partial<AttendanceFormValues> = {
    classId: classId || attendance?.classId || undefined,
    studentId: attendance?.studentId || undefined,
    date: attendance?.date ? new Date(attendance.date).toISOString().split('T')[0] : today,
    status: attendance?.status || "present",
    notes: attendance?.notes || "",
  };

  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues,
  });

  // Fetch classes for dropdown
  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ["/api/classes"],
  });

  // Fetch students enrolled in the selected class
  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["/api/class-enrollments", selectedClass],
    enabled: !!selectedClass,
  });

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["/api/students"],
  });

  useEffect(() => {
    if (selectedClass) {
      form.setValue("classId", selectedClass);
    }
  }, [selectedClass, form]);

  // Initialize statuses for all students in bulk mode
  useEffect(() => {
    if (isBulk && enrollments) {
      const initialStatuses: {[key: number]: string} = {};
      enrollments.forEach((enrollment: any) => {
        initialStatuses[enrollment.studentId] = "present";
      });
      setStudentStatuses(initialStatuses);
    }
  }, [isBulk, enrollments]);

  const getStudentById = (id: number) => {
    return students?.find((student: any) => student.id === id);
  };

  const handleStatusChange = (studentId: number, status: string) => {
    setStudentStatuses(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const onSubmit = async (data: AttendanceFormValues) => {
    setIsSubmitting(true);
    try {
      if (isBulk) {
        // Bulk submission for all students in the class
        const promises = Object.entries(studentStatuses).map(([studentId, status]) => {
          const payload: InsertAttendance = {
            classId: selectedClass!,
            studentId: parseInt(studentId),
            date: new Date(data.date),
            status,
            notes: data.notes || ""
          };
          return apiRequest("POST", "/api/attendance", payload);
        });

        await Promise.all(promises);
        
        toast({
          title: "Attendance recorded",
          description: "Attendance has been recorded for all students.",
        });
      } else {
        // Single student attendance
        const payload: InsertAttendance = {
          classId: data.classId!,
          studentId: data.studentId!,
          date: new Date(data.date),
          status: data.status,
          notes: data.notes || ""
        };

        if (attendance?.id) {
          // Update existing attendance
          await apiRequest(
            "PUT",
            `/api/attendance/${attendance.id}`,
            payload
          );
          toast({
            title: "Attendance updated",
            description: "Attendance record has been updated successfully.",
          });
        } else {
          // Create new attendance
          await apiRequest("POST", "/api/attendance", payload);
          toast({
            title: "Attendance recorded",
            description: "New attendance record has been added successfully.",
          });
        }
      }

      // Invalidate attendance queries
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });

      // Call the success callback
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error submitting attendance form:", error);
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Class */}
              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(parseInt(value));
                        setSelectedClass(parseInt(value));
                      }}
                      defaultValue={field.value?.toString()}
                      disabled={!!classId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classesLoading ? (
                          <SelectItem value="loading">Loading classes...</SelectItem>
                        ) : classes?.length > 0 ? (
                          classes.map((classItem: any) => (
                            <SelectItem key={classItem.id} value={classItem.id.toString()}>
                              {classItem.className} ({classItem.classCode})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none">No classes available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Student (only for individual attendance) */}
              {!isBulk && (
                <FormField
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select student" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {enrollmentsLoading || studentsLoading ? (
                            <SelectItem value="loading">Loading students...</SelectItem>
                          ) : enrollments?.length > 0 ? (
                            enrollments.map((enrollment: any) => {
                              const student = getStudentById(enrollment.studentId);
                              return student ? (
                                <SelectItem key={student.id} value={student.id.toString()}>
                                  {student.firstName} {student.lastName} ({student.studentId})
                                </SelectItem>
                              ) : null;
                            })
                          ) : (
                            <SelectItem value="none">No students enrolled</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Status (only for individual attendance) */}
              {!isBulk && (
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="present">Present</SelectItem>
                          <SelectItem value="absent">Absent</SelectItem>
                          <SelectItem value="late">Late</SelectItem>
                          <SelectItem value="excused">Excused</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes about attendance"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bulk attendance section */}
            {isBulk && selectedClass && enrollments && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Mark Attendance for All Students</h3>
                
                <div className="border rounded-md p-4 space-y-4">
                  {enrollmentsLoading || studentsLoading ? (
                    <div>Loading students...</div>
                  ) : enrollments.length > 0 ? (
                    enrollments.map((enrollment: any) => {
                      const student = getStudentById(enrollment.studentId);
                      return student ? (
                        <div key={student.id} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center">
                              {student.firstName[0]}{student.lastName[0]}
                            </div>
                            <div>
                              <p className="font-medium">{student.firstName} {student.lastName}</p>
                              <p className="text-sm text-gray-500">{student.studentId}</p>
                            </div>
                          </div>
                          <RadioGroup 
                            defaultValue="present"
                            className="flex space-x-4"
                            value={studentStatuses[student.id] || "present"}
                            onValueChange={(value) => handleStatusChange(student.id, value)}
                          >
                            <div className="flex items-center space-x-1">
                              <RadioGroupItem value="present" id={`present-${student.id}`} />
                              <Label htmlFor={`present-${student.id}`} className="text-green-600">Present</Label>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <RadioGroupItem value="absent" id={`absent-${student.id}`} />
                              <Label htmlFor={`absent-${student.id}`} className="text-red-600">Absent</Label>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <RadioGroupItem value="late" id={`late-${student.id}`} />
                              <Label htmlFor={`late-${student.id}`} className="text-amber-600">Late</Label>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <RadioGroupItem value="excused" id={`excused-${student.id}`} />
                              <Label htmlFor={`excused-${student.id}`} className="text-blue-600">Excused</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      ) : null;
                    })
                  ) : (
                    <p className="text-gray-500">No students enrolled in this class</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={isSubmitting || (!isBulk && !form.getValues().studentId) || !form.getValues().classId}
              >
                {isSubmitting ? "Saving..." : attendance?.id ? "Update Attendance" : isBulk ? "Mark Attendance" : "Record Attendance"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
