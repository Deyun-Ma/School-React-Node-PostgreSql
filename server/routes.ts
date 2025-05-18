import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertUserSchema,
  insertStudentSchema,
  insertTeacherSchema,
  insertClassSchema,
  insertClassEnrollmentSchema,
  insertAttendanceSchema,
  insertGradeSchema,
  insertEventSchema,
  insertActivitySchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard routes
  app.get("/api/dashboard/stats", async (_req: Request, res: Response) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to get dashboard stats" });
    }
  });

  app.get("/api/activities", async (_req: Request, res: Response) => {
    try {
      const activities = await storage.getActivities();
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to get activities" });
    }
  });

  // User routes
  app.get("/api/users", async (_req: Request, res: Response) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to get users" });
    }
  });

  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const validation = insertUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }
      
      const user = await storage.createUser(validation.data);
      
      // Log activity
      await storage.createActivity({
        userId: user.id,
        action: "Added User",
        details: `Added user ${user.username} with role ${user.role}`
      });
      
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.put("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const validation = insertUserSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }
      
      const updatedUser = await storage.updateUser(id, validation.data);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Log activity
      await storage.createActivity({
        userId: id,
        action: "Updated User",
        details: `Updated user ${updatedUser.username}`
      });
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(500).json({ error: "Failed to delete user" });
      }
      
      // Log activity
      await storage.createActivity({
        userId: 1, // Admin user ID
        action: "Deleted User",
        details: `Deleted user ${user.username}`
      });
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Student routes
  app.get("/api/students", async (req: Request, res: Response) => {
    try {
      const students = await storage.getStudents();
      res.json(students);
    } catch (error) {
      res.status(500).json({ error: "Failed to get students" });
    }
  });

  app.get("/api/students/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid student ID" });
      }
      
      const student = await storage.getStudent(id);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
      
      res.json(student);
    } catch (error) {
      res.status(500).json({ error: "Failed to get student" });
    }
  });

  app.post("/api/students", async (req: Request, res: Response) => {
    try {
      const validation = insertStudentSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }
      
      const student = await storage.createStudent(validation.data);
      
      // Log activity
      await storage.createActivity({
        userId: 1, // Admin user ID
        action: "Added Student",
        details: `Added ${student.firstName} ${student.lastName} to Grade ${student.gradeLevel}-${student.section}`
      });
      
      res.status(201).json(student);
    } catch (error) {
      res.status(500).json({ error: "Failed to create student" });
    }
  });

  app.put("/api/students/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid student ID" });
      }
      
      const validation = insertStudentSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }
      
      const updatedStudent = await storage.updateStudent(id, validation.data);
      if (!updatedStudent) {
        return res.status(404).json({ error: "Student not found" });
      }
      
      // Log activity
      await storage.createActivity({
        userId: 1, // Admin user ID
        action: "Updated Student",
        details: `Updated ${updatedStudent.firstName} ${updatedStudent.lastName}'s information`
      });
      
      res.json(updatedStudent);
    } catch (error) {
      res.status(500).json({ error: "Failed to update student" });
    }
  });

  app.delete("/api/students/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid student ID" });
      }
      
      const student = await storage.getStudent(id);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
      
      const success = await storage.deleteStudent(id);
      if (!success) {
        return res.status(500).json({ error: "Failed to delete student" });
      }
      
      // Log activity
      await storage.createActivity({
        userId: 1, // Admin user ID
        action: "Deleted Student",
        details: `Deleted ${student.firstName} ${student.lastName} from the system`
      });
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete student" });
    }
  });

  // Teacher routes
  app.get("/api/teachers", async (_req: Request, res: Response) => {
    try {
      const teachers = await storage.getTeachers();
      res.json(teachers);
    } catch (error) {
      res.status(500).json({ error: "Failed to get teachers" });
    }
  });

  app.get("/api/teachers/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid teacher ID" });
      }
      
      const teacher = await storage.getTeacher(id);
      if (!teacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }
      
      res.json(teacher);
    } catch (error) {
      res.status(500).json({ error: "Failed to get teacher" });
    }
  });

  app.post("/api/teachers", async (req: Request, res: Response) => {
    try {
      const validation = insertTeacherSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }
      
      const teacher = await storage.createTeacher(validation.data);
      
      // Log activity
      await storage.createActivity({
        userId: 1, // Admin user ID
        action: "Added Teacher",
        details: `Added ${teacher.firstName} ${teacher.lastName} to the faculty`
      });
      
      res.status(201).json(teacher);
    } catch (error) {
      res.status(500).json({ error: "Failed to create teacher" });
    }
  });

  app.put("/api/teachers/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid teacher ID" });
      }
      
      const validation = insertTeacherSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }
      
      const updatedTeacher = await storage.updateTeacher(id, validation.data);
      if (!updatedTeacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }
      
      // Log activity
      await storage.createActivity({
        userId: 1, // Admin user ID
        action: "Updated Teacher",
        details: `Updated ${updatedTeacher.firstName} ${updatedTeacher.lastName}'s information`
      });
      
      res.json(updatedTeacher);
    } catch (error) {
      res.status(500).json({ error: "Failed to update teacher" });
    }
  });

  app.delete("/api/teachers/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid teacher ID" });
      }
      
      const teacher = await storage.getTeacher(id);
      if (!teacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }
      
      const success = await storage.deleteTeacher(id);
      if (!success) {
        return res.status(500).json({ error: "Failed to delete teacher" });
      }
      
      // Log activity
      await storage.createActivity({
        userId: 1, // Admin user ID
        action: "Deleted Teacher",
        details: `Deleted ${teacher.firstName} ${teacher.lastName} from the system`
      });
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete teacher" });
    }
  });

  // Class routes
  app.get("/api/classes", async (_req: Request, res: Response) => {
    try {
      const classes = await storage.getClasses();
      res.json(classes);
    } catch (error) {
      res.status(500).json({ error: "Failed to get classes" });
    }
  });

  app.get("/api/classes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid class ID" });
      }
      
      const classItem = await storage.getClass(id);
      if (!classItem) {
        return res.status(404).json({ error: "Class not found" });
      }
      
      res.json(classItem);
    } catch (error) {
      res.status(500).json({ error: "Failed to get class" });
    }
  });

  app.post("/api/classes", async (req: Request, res: Response) => {
    try {
      const validation = insertClassSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }
      
      const classItem = await storage.createClass(validation.data);
      
      // Log activity
      await storage.createActivity({
        userId: 1, // Admin user ID
        action: "Added Class",
        details: `Added ${classItem.className} (${classItem.classCode}) for Grade ${classItem.gradeLevel}`
      });
      
      res.status(201).json(classItem);
    } catch (error) {
      res.status(500).json({ error: "Failed to create class" });
    }
  });

  app.put("/api/classes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid class ID" });
      }
      
      const validation = insertClassSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }
      
      const updatedClass = await storage.updateClass(id, validation.data);
      if (!updatedClass) {
        return res.status(404).json({ error: "Class not found" });
      }
      
      // Log activity
      await storage.createActivity({
        userId: 1, // Admin user ID
        action: "Updated Class",
        details: `Updated ${updatedClass.className} (${updatedClass.classCode}) information`
      });
      
      res.json(updatedClass);
    } catch (error) {
      res.status(500).json({ error: "Failed to update class" });
    }
  });

  app.delete("/api/classes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid class ID" });
      }
      
      const classItem = await storage.getClass(id);
      if (!classItem) {
        return res.status(404).json({ error: "Class not found" });
      }
      
      const success = await storage.deleteClass(id);
      if (!success) {
        return res.status(500).json({ error: "Failed to delete class" });
      }
      
      // Log activity
      await storage.createActivity({
        userId: 1, // Admin user ID
        action: "Deleted Class",
        details: `Deleted ${classItem.className} (${classItem.classCode})`
      });
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete class" });
    }
  });

  // Class Enrollment routes
  app.get("/api/class-enrollments", async (req: Request, res: Response) => {
    try {
      const classId = req.query.classId ? parseInt(req.query.classId as string) : undefined;
      const studentId = req.query.studentId ? parseInt(req.query.studentId as string) : undefined;
      
      let enrollments;
      if (classId) {
        enrollments = await storage.getClassEnrollmentsByClassId(classId);
      } else if (studentId) {
        enrollments = await storage.getClassEnrollmentsByStudentId(studentId);
      } else {
        enrollments = await storage.getClassEnrollments();
      }
      
      res.json(enrollments);
    } catch (error) {
      res.status(500).json({ error: "Failed to get class enrollments" });
    }
  });

  app.post("/api/class-enrollments", async (req: Request, res: Response) => {
    try {
      const validation = insertClassEnrollmentSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }
      
      const enrollment = await storage.createClassEnrollment(validation.data);
      
      // Get related data for activity log
      const student = await storage.getStudent(enrollment.studentId);
      const classItem = await storage.getClass(enrollment.classId);
      
      // Log activity
      await storage.createActivity({
        userId: 1, // Admin user ID
        action: "Enrolled Student",
        details: `Enrolled ${student?.firstName} ${student?.lastName} in ${classItem?.className}`
      });
      
      res.status(201).json(enrollment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create class enrollment" });
    }
  });

  app.delete("/api/class-enrollments/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid enrollment ID" });
      }
      
      const success = await storage.deleteClassEnrollment(id);
      if (!success) {
        return res.status(404).json({ error: "Enrollment not found" });
      }
      
      // Log activity
      await storage.createActivity({
        userId: 1, // Admin user ID
        action: "Removed Student from Class",
        details: "Removed student from class enrollment"
      });
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete class enrollment" });
    }
  });

  // Attendance routes
  app.get("/api/attendance", async (req: Request, res: Response) => {
    try {
      const classId = req.query.classId ? parseInt(req.query.classId as string) : undefined;
      const studentId = req.query.studentId ? parseInt(req.query.studentId as string) : undefined;
      const date = req.query.date ? new Date(req.query.date as string) : undefined;
      
      let attendanceRecords;
      if (classId) {
        attendanceRecords = await storage.getAttendanceByClassId(classId);
      } else if (studentId) {
        attendanceRecords = await storage.getAttendanceByStudentId(studentId);
      } else if (date) {
        attendanceRecords = await storage.getAttendanceByDate(date);
      } else {
        attendanceRecords = await storage.getAttendance();
      }
      
      res.json(attendanceRecords);
    } catch (error) {
      res.status(500).json({ error: "Failed to get attendance records" });
    }
  });

  app.post("/api/attendance", async (req: Request, res: Response) => {
    try {
      const validation = insertAttendanceSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }
      
      const attendance = await storage.createAttendance(validation.data);
      
      // Get related data for activity log
      const student = await storage.getStudent(attendance.studentId);
      const classItem = await storage.getClass(attendance.classId);
      
      // Log activity
      await storage.createActivity({
        userId: 1, // Admin user ID
        action: "Marked Attendance",
        details: `Marked ${student?.firstName} ${student?.lastName} as ${attendance.status} for ${classItem?.className}`
      });
      
      res.status(201).json(attendance);
    } catch (error) {
      res.status(500).json({ error: "Failed to create attendance record" });
    }
  });

  app.put("/api/attendance/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid attendance ID" });
      }
      
      const validation = insertAttendanceSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }
      
      const updatedAttendance = await storage.updateAttendance(id, validation.data);
      if (!updatedAttendance) {
        return res.status(404).json({ error: "Attendance record not found" });
      }
      
      // Log activity
      await storage.createActivity({
        userId: 1, // Admin user ID
        action: "Updated Attendance",
        details: `Updated attendance record to ${updatedAttendance.status}`
      });
      
      res.json(updatedAttendance);
    } catch (error) {
      res.status(500).json({ error: "Failed to update attendance record" });
    }
  });

  app.delete("/api/attendance/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid attendance ID" });
      }
      
      const success = await storage.deleteAttendance(id);
      if (!success) {
        return res.status(404).json({ error: "Attendance record not found" });
      }
      
      // Log activity
      await storage.createActivity({
        userId: 1, // Admin user ID
        action: "Deleted Attendance",
        details: "Removed attendance record"
      });
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete attendance record" });
    }
  });

  // Grade routes
  app.get("/api/grades", async (req: Request, res: Response) => {
    try {
      const classId = req.query.classId ? parseInt(req.query.classId as string) : undefined;
      const studentId = req.query.studentId ? parseInt(req.query.studentId as string) : undefined;
      
      let grades;
      if (classId) {
        grades = await storage.getGradesByClassId(classId);
      } else if (studentId) {
        grades = await storage.getGradesByStudentId(studentId);
      } else {
        grades = await storage.getGrades();
      }
      
      res.json(grades);
    } catch (error) {
      res.status(500).json({ error: "Failed to get grades" });
    }
  });

  app.post("/api/grades", async (req: Request, res: Response) => {
    try {
      const validation = insertGradeSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }
      
      const grade = await storage.createGrade(validation.data);
      
      // Get related data for activity log
      const student = await storage.getStudent(grade.studentId);
      const classItem = await storage.getClass(grade.classId);
      
      // Log activity
      await storage.createActivity({
        userId: 1, // Admin user ID
        action: "Added Grade",
        details: `Added grade for ${student?.firstName} ${student?.lastName} in ${classItem?.className}: ${grade.score}/${grade.maxScore}`
      });
      
      res.status(201).json(grade);
    } catch (error) {
      res.status(500).json({ error: "Failed to create grade" });
    }
  });

  app.put("/api/grades/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid grade ID" });
      }
      
      const validation = insertGradeSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }
      
      const updatedGrade = await storage.updateGrade(id, validation.data);
      if (!updatedGrade) {
        return res.status(404).json({ error: "Grade not found" });
      }
      
      // Log activity
      await storage.createActivity({
        userId: 1, // Admin user ID
        action: "Updated Grade",
        details: `Updated grade to ${updatedGrade.score}/${updatedGrade.maxScore}`
      });
      
      res.json(updatedGrade);
    } catch (error) {
      res.status(500).json({ error: "Failed to update grade" });
    }
  });

  app.delete("/api/grades/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid grade ID" });
      }
      
      const success = await storage.deleteGrade(id);
      if (!success) {
        return res.status(404).json({ error: "Grade not found" });
      }
      
      // Log activity
      await storage.createActivity({
        userId: 1, // Admin user ID
        action: "Deleted Grade",
        details: "Removed grade record"
      });
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete grade" });
    }
  });

  // Event routes
  app.get("/api/events", async (_req: Request, res: Response) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to get events" });
    }
  });

  app.get("/api/events/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid event ID" });
      }
      
      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to get event" });
    }
  });

  app.post("/api/events", async (req: Request, res: Response) => {
    try {
      const validation = insertEventSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }
      
      const event = await storage.createEvent(validation.data);
      
      // Log activity
      await storage.createActivity({
        userId: 1, // Admin user ID
        action: "Added Event",
        details: `Added event "${event.title}" on ${new Date(event.startDate).toLocaleDateString()}`
      });
      
      res.status(201).json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to create event" });
    }
  });

  app.put("/api/events/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid event ID" });
      }
      
      const validation = insertEventSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }
      
      const updatedEvent = await storage.updateEvent(id, validation.data);
      if (!updatedEvent) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      // Log activity
      await storage.createActivity({
        userId: 1, // Admin user ID
        action: "Updated Event",
        details: `Updated event "${updatedEvent.title}"`
      });
      
      res.json(updatedEvent);
    } catch (error) {
      res.status(500).json({ error: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid event ID" });
      }
      
      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      const success = await storage.deleteEvent(id);
      if (!success) {
        return res.status(500).json({ error: "Failed to delete event" });
      }
      
      // Log activity
      await storage.createActivity({
        userId: 1, // Admin user ID
        action: "Deleted Event",
        details: `Deleted event "${event.title}"`
      });
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete event" });
    }
  });

  // Authentication routes (basic, no real auth here)
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const schema = z.object({
      username: z.string(),
      password: z.string()
    });
    
    try {
      const validation = schema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }
      
      const { username, password } = validation.data;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      
      // In a real app, we would create a JWT token or session
      res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
        avatar: user.avatar
      });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
