import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertTeacherSchema, InsertTeacher } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

// Extend the teacher schema with client-side validation
const teacherFormSchema = insertTeacherSchema.extend({
  joinDate: z.string().min(1, "Join date is required"),
  subjects: z.array(z.string()).min(1, "At least one subject is required")
});

type TeacherFormValues = z.infer<typeof teacherFormSchema> & {
  subjectInput?: string;
};

interface TeacherFormProps {
  teacher?: any; // Using any temporarily as we need to accommodate the database model
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function TeacherForm({ teacher, onSuccess, onCancel }: TeacherFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subjects, setSubjects] = useState<string[]>(teacher?.subjects || []);
  const [subjectInput, setSubjectInput] = useState("");

  const defaultValues: Partial<TeacherFormValues> = {
    teacherId: teacher?.teacherId || "",
    firstName: teacher?.firstName || "",
    lastName: teacher?.lastName || "",
    email: teacher?.email || "",
    phone: teacher?.phone || "",
    address: teacher?.address || "",
    qualification: teacher?.qualification || "",
    joinDate: teacher?.joinDate ? new Date(teacher.joinDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    subjects: teacher?.subjects || [],
    avatar: teacher?.avatar || "",
    userId: teacher?.userId || undefined,
  };

  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues,
  });

  // Add subject to the list
  const handleAddSubject = () => {
    if (subjectInput.trim() && !subjects.includes(subjectInput.trim())) {
      const newSubjects = [...subjects, subjectInput.trim()];
      setSubjects(newSubjects);
      form.setValue("subjects", newSubjects);
      setSubjectInput("");
    }
  };

  // Remove subject from the list
  const handleRemoveSubject = (subject: string) => {
    const newSubjects = subjects.filter((s) => s !== subject);
    setSubjects(newSubjects);
    form.setValue("subjects", newSubjects);
  };

  const onSubmit = async (data: TeacherFormValues) => {
    setIsSubmitting(true);
    try {
      // Prepare the payload
      const payload: InsertTeacher = {
        ...data,
        joinDate: new Date(data.joinDate),
      };

      if (teacher?.id) {
        // Update
        await apiRequest(
          "PUT",
          `/api/teachers/${teacher.id}`,
          payload
        );
        toast({
          title: "Teacher updated",
          description: "Teacher information has been updated successfully.",
        });
      } else {
        // Create
        await apiRequest("POST", "/api/teachers", payload);
        toast({
          title: "Teacher added",
          description: "New teacher has been added successfully.",
        });
      }

      // Invalidate teacher queries
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });

      // Call the success callback
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error submitting teacher form:", error);
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
              {/* Teacher ID */}
              <FormField
                control={form.control}
                name="teacherId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teacher ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., TCH1001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* First Name */}
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Last Name */}
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="teacher@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 234-567-8901" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Qualification */}
              <FormField
                control={form.control}
                name="qualification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qualification</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., M.Ed in Mathematics" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Join Date */}
              <FormField
                control={form.control}
                name="joinDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Join Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Avatar URL */}
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/avatar.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Address - Full width */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter full address"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Subjects - Custom input with chips */}
            <FormField
              control={form.control}
              name="subjects"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subjects</FormLabel>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Add a subject (e.g., Mathematics)"
                        value={subjectInput}
                        onChange={(e) => setSubjectInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSubject();
                          }
                        }}
                      />
                      <Button 
                        type="button" 
                        onClick={handleAddSubject}
                        variant="outline"
                      >
                        Add
                      </Button>
                    </div>
                    {subjects.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {subjects.map((subject, index) => (
                          <div
                            key={index}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                          >
                            {subject}
                            <button
                              type="button"
                              className="ml-2 focus:outline-none"
                              onClick={() => handleRemoveSubject(subject)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No subjects added yet. Add at least one subject.
                      </p>
                    )}
                  </div>
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : teacher?.id ? "Update Teacher" : "Add Teacher"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
