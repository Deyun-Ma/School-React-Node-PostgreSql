import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertGradeSchema, InsertGrade } from "@shared/schema";
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

// Extend the grade schema with client-side validation
const gradeFormSchema = insertGradeSchema.extend({
  gradedDate: z.string().min(1, "Graded date is required"),
  maxScore: z.string().or(z.number()),
  score: z.string().or(z.number()),
});

type GradeFormValues = z.infer<typeof gradeFormSchema>;

interface GradeFormProps {
  grade?: any;
  classId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function GradeForm({ grade, classId, onSuccess, onCancel }: GradeFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClass, setSelectedClass] = useState<number | undefined>(classId);

  // Format today's date as YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  const defaultValues: Partial<GradeFormValues> = {
    classId: classId || grade?.classId || undefined,
    studentId: grade?.studentId || undefined,
    assignmentName: grade?.assignmentName || "",
    assignmentType: grade?.assignmentType || "quiz",
    maxScore: grade?.maxScore?.toString() || "100",
    score: grade?.score?.toString() || "",
    gradedDate: grade?.gradedDate ? new Date(grade.gradedDate).toISOString().split('T')[0] : today,
    comments: grade?.comments || "",
  };

  const form = useForm<GradeFormValues>({
    resolver: zodResolver(gradeFormSchema),
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

  const getStudentById = (id: number) => {
    return students?.find((student: any) => student.id === id);
  };

  const onSubmit = async (data: GradeFormValues) => {
    setIsSubmitting(true);
    try {
      // Convert string inputs to numbers
      const maxScore = typeof data.maxScore === 'string' 
        ? parseFloat(data.maxScore) 
        : data.maxScore;
      
      const score = typeof data.score === 'string' 
        ? parseFloat(data.score) 
        : data.score;

      const payload: InsertGrade = {
        classId: data.classId!,
        studentId: data.studentId!,
        assignmentName: data.assignmentName,
        assignmentType: data.assignmentType,
        maxScore,
        score,
        gradedDate: new Date(data.gradedDate),
        comments: data.comments
      };

      if (grade?.id) {
        // Update
        await apiRequest(
          "PUT",
          `/api/grades/${grade.id}`,
          payload
        );
        toast({
          title: "Grade updated",
          description: "Grade record has been updated successfully.",
        });
      } else {
        // Create
        await apiRequest("POST", "/api/grades", payload);
        toast({
          title: "Grade added",
          description: "New grade record has been added successfully.",
        });
      }

      // Invalidate grade queries
      queryClient.invalidateQueries({ queryKey: ["/api/grades"] });

      // Call the success callback
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error submitting grade form:", error);
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

              {/* Student */}
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

              {/* Assignment Name */}
              <FormField
                control={form.control}
                name="assignmentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignment Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Midterm Exam" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Assignment Type */}
              <FormField
                control={form.control}
                name="assignmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignment Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="exam">Exam</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                        <SelectItem value="homework">Homework</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Max Score */}
              <FormField
                control={form.control}
                name="maxScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Score</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Score */}
              <FormField
                control={form.control}
                name="score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Score</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Graded Date */}
              <FormField
                control={form.control}
                name="gradedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Graded Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Comments */}
            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comments</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Comments on student's performance"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                disabled={isSubmitting || !form.getValues().studentId || !form.getValues().classId}
              >
                {isSubmitting ? "Saving..." : grade?.id ? "Update Grade" : "Add Grade"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
