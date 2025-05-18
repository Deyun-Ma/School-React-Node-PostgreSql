import { pgTable, text, serial, integer, boolean, date, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication and role-based access
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("teacher"), // admin, teacher, staff
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  avatar: text("avatar"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Students table
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  studentId: text("student_id").notNull().unique(), // e.g., STU10045
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  gender: text("gender").notNull(), // M, F, Other
  dateOfBirth: date("date_of_birth").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  guardianName: text("guardian_name"),
  guardianPhone: text("guardian_phone"),
  gradeLevel: text("grade_level").notNull(), // e.g., 9, 10, 11, 12
  section: text("section").notNull(), // e.g., A, B, C
  enrollmentDate: date("enrollment_date").notNull(),
  avatar: text("avatar"),
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
});

// Teachers table
export const teachers = pgTable("teachers", {
  id: serial("id").primaryKey(),
  teacherId: text("teacher_id").notNull().unique(), // e.g., TCH1001
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  address: text("address"),
  qualification: text("qualification"),
  joinDate: date("join_date").notNull(),
  subjects: text("subjects").array(), // Array of subjects they can teach
  avatar: text("avatar"),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
});

export const insertTeacherSchema = createInsertSchema(teachers).omit({
  id: true,
});

// Classes/Courses table
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  className: text("class_name").notNull(), // e.g., "Mathematics 101"
  classCode: text("class_code").notNull().unique(), // e.g., "MATH101"
  gradeLevel: text("grade_level").notNull(), // e.g., 9, 10, 11, 12
  section: text("section"), // e.g., A, B, C
  description: text("description"),
  teacherId: integer("teacher_id").references(() => teachers.id),
  schedule: text("schedule"), // e.g., "Mon, Wed, Fri 9:00-10:00"
  roomNumber: text("room_number"),
  academicYear: text("academic_year").notNull(), // e.g., "2023-2024"
});

export const insertClassSchema = createInsertSchema(classes).omit({
  id: true,
});

// Class Enrollments (Students in a specific class)
export const classEnrollments = pgTable("class_enrollments", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").references(() => classes.id, { onDelete: "cascade" }).notNull(),
  studentId: integer("student_id").references(() => students.id, { onDelete: "cascade" }).notNull(),
  enrollmentDate: date("enrollment_date").notNull(),
});

export const insertClassEnrollmentSchema = createInsertSchema(classEnrollments).omit({
  id: true,
});

// Attendance Records
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").references(() => classes.id).notNull(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  date: date("date").notNull(),
  status: text("status").notNull(), // present, absent, late, excused
  notes: text("notes"),
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
});

// Grades Records
export const grades = pgTable("grades", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").references(() => classes.id).notNull(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  assignmentName: text("assignment_name").notNull(),
  assignmentType: text("assignment_type").notNull(), // exam, quiz, homework, project
  maxScore: decimal("max_score").notNull(),
  score: decimal("score").notNull(),
  gradedDate: date("graded_date").notNull(),
  comments: text("comments"),
});

export const insertGradeSchema = createInsertSchema(grades).omit({
  id: true,
});

// Events for the school calendar
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  startTime: text("start_time"),
  endTime: text("end_time"),
  allDay: boolean("all_day").default(false),
  location: text("location"),
  type: text("type").notNull(), // exam, meeting, holiday, activity
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
});

// Activities log for dashboard
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(), // e.g., "Added Student", "Updated Grade"
  details: text("details"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  timestamp: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;

export type Teacher = typeof teachers.$inferSelect;
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;

export type Class = typeof classes.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;

export type ClassEnrollment = typeof classEnrollments.$inferSelect;
export type InsertClassEnrollment = z.infer<typeof insertClassEnrollmentSchema>;

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;

export type Grade = typeof grades.$inferSelect;
export type InsertGrade = z.infer<typeof insertGradeSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
