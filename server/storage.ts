import {
  users, User, InsertUser,
  students, Student, InsertStudent,
  teachers, Teacher, InsertTeacher,
  classes, Class, InsertClass,
  classEnrollments, ClassEnrollment, InsertClassEnrollment,
  attendance, Attendance, InsertAttendance,
  grades, Grade, InsertGrade,
  events, Event, InsertEvent,
  activities, Activity, InsertActivity
} from "@shared/schema";

export interface IStorage {
  // User management
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Student management
  getStudents(): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  getStudentByStudentId(studentId: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student | undefined>;
  deleteStudent(id: number): Promise<boolean>;

  // Teacher management
  getTeachers(): Promise<Teacher[]>;
  getTeacher(id: number): Promise<Teacher | undefined>;
  getTeacherByTeacherId(teacherId: string): Promise<Teacher | undefined>;
  createTeacher(teacher: InsertTeacher): Promise<Teacher>;
  updateTeacher(id: number, teacher: Partial<InsertTeacher>): Promise<Teacher | undefined>;
  deleteTeacher(id: number): Promise<boolean>;

  // Class management
  getClasses(): Promise<Class[]>;
  getClass(id: number): Promise<Class | undefined>;
  getClassByClassCode(classCode: string): Promise<Class | undefined>;
  createClass(classData: InsertClass): Promise<Class>;
  updateClass(id: number, classData: Partial<InsertClass>): Promise<Class | undefined>;
  deleteClass(id: number): Promise<boolean>;

  // Class Enrollment management
  getClassEnrollments(): Promise<ClassEnrollment[]>;
  getClassEnrollmentsByClassId(classId: number): Promise<ClassEnrollment[]>;
  getClassEnrollmentsByStudentId(studentId: number): Promise<ClassEnrollment[]>;
  createClassEnrollment(enrollment: InsertClassEnrollment): Promise<ClassEnrollment>;
  deleteClassEnrollment(id: number): Promise<boolean>;

  // Attendance management
  getAttendance(): Promise<Attendance[]>;
  getAttendanceByClassId(classId: number): Promise<Attendance[]>;
  getAttendanceByStudentId(studentId: number): Promise<Attendance[]>;
  getAttendanceByDate(date: Date): Promise<Attendance[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: number, attendance: Partial<InsertAttendance>): Promise<Attendance | undefined>;
  deleteAttendance(id: number): Promise<boolean>;

  // Grade management
  getGrades(): Promise<Grade[]>;
  getGradesByClassId(classId: number): Promise<Grade[]>;
  getGradesByStudentId(studentId: number): Promise<Grade[]>;
  createGrade(grade: InsertGrade): Promise<Grade>;
  updateGrade(id: number, grade: Partial<InsertGrade>): Promise<Grade | undefined>;
  deleteGrade(id: number): Promise<boolean>;

  // Event management
  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;

  // Activity logs
  getActivities(): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Dashboard data
  getDashboardStats(): Promise<{
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    attendanceRate: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private students: Map<number, Student>;
  private teachers: Map<number, Teacher>;
  private classes: Map<number, Class>;
  private classEnrollments: Map<number, ClassEnrollment>;
  private attendance: Map<number, Attendance>;
  private grades: Map<number, Grade>;
  private events: Map<number, Event>;
  private activities: Map<number, Activity>;
  
  private userIdCounter: number;
  private studentIdCounter: number;
  private teacherIdCounter: number;
  private classIdCounter: number;
  private classEnrollmentIdCounter: number;
  private attendanceIdCounter: number;
  private gradeIdCounter: number;
  private eventIdCounter: number;
  private activityIdCounter: number;

  constructor() {
    this.users = new Map();
    this.students = new Map();
    this.teachers = new Map();
    this.classes = new Map();
    this.classEnrollments = new Map();
    this.attendance = new Map();
    this.grades = new Map();
    this.events = new Map();
    this.activities = new Map();
    
    this.userIdCounter = 1;
    this.studentIdCounter = 1;
    this.teacherIdCounter = 1;
    this.classIdCounter = 1;
    this.classEnrollmentIdCounter = 1;
    this.attendanceIdCounter = 1;
    this.gradeIdCounter = 1;
    this.eventIdCounter = 1;
    this.activityIdCounter = 1;

    // Initialize with default admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      role: "admin",
      fullName: "Jane Cooper",
      email: "admin@school.edu",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100"
    });

    // Add some sample data for testing
    this.seedSampleData();
  }

  // User management
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  // Student management
  async getStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }

  async getStudent(id: number): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async getStudentByStudentId(studentId: string): Promise<Student | undefined> {
    return Array.from(this.students.values()).find(
      (student) => student.studentId === studentId,
    );
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = this.studentIdCounter++;
    const student: Student = { ...insertStudent, id };
    this.students.set(id, student);
    return student;
  }

  async updateStudent(id: number, studentData: Partial<InsertStudent>): Promise<Student | undefined> {
    const student = this.students.get(id);
    if (!student) return undefined;
    
    const updatedStudent = { ...student, ...studentData };
    this.students.set(id, updatedStudent);
    return updatedStudent;
  }

  async deleteStudent(id: number): Promise<boolean> {
    return this.students.delete(id);
  }

  // Teacher management
  async getTeachers(): Promise<Teacher[]> {
    return Array.from(this.teachers.values());
  }

  async getTeacher(id: number): Promise<Teacher | undefined> {
    return this.teachers.get(id);
  }

  async getTeacherByTeacherId(teacherId: string): Promise<Teacher | undefined> {
    return Array.from(this.teachers.values()).find(
      (teacher) => teacher.teacherId === teacherId,
    );
  }

  async createTeacher(insertTeacher: InsertTeacher): Promise<Teacher> {
    const id = this.teacherIdCounter++;
    const teacher: Teacher = { ...insertTeacher, id };
    this.teachers.set(id, teacher);
    return teacher;
  }

  async updateTeacher(id: number, teacherData: Partial<InsertTeacher>): Promise<Teacher | undefined> {
    const teacher = this.teachers.get(id);
    if (!teacher) return undefined;
    
    const updatedTeacher = { ...teacher, ...teacherData };
    this.teachers.set(id, updatedTeacher);
    return updatedTeacher;
  }

  async deleteTeacher(id: number): Promise<boolean> {
    return this.teachers.delete(id);
  }

  // Class management
  async getClasses(): Promise<Class[]> {
    return Array.from(this.classes.values());
  }

  async getClass(id: number): Promise<Class | undefined> {
    return this.classes.get(id);
  }

  async getClassByClassCode(classCode: string): Promise<Class | undefined> {
    return Array.from(this.classes.values()).find(
      (classItem) => classItem.classCode === classCode,
    );
  }

  async createClass(insertClass: InsertClass): Promise<Class> {
    const id = this.classIdCounter++;
    const classData: Class = { ...insertClass, id };
    this.classes.set(id, classData);
    return classData;
  }

  async updateClass(id: number, classData: Partial<InsertClass>): Promise<Class | undefined> {
    const classItem = this.classes.get(id);
    if (!classItem) return undefined;
    
    const updatedClass = { ...classItem, ...classData };
    this.classes.set(id, updatedClass);
    return updatedClass;
  }

  async deleteClass(id: number): Promise<boolean> {
    return this.classes.delete(id);
  }

  // Class Enrollment management
  async getClassEnrollments(): Promise<ClassEnrollment[]> {
    return Array.from(this.classEnrollments.values());
  }

  async getClassEnrollmentsByClassId(classId: number): Promise<ClassEnrollment[]> {
    return Array.from(this.classEnrollments.values()).filter(
      (enrollment) => enrollment.classId === classId,
    );
  }

  async getClassEnrollmentsByStudentId(studentId: number): Promise<ClassEnrollment[]> {
    return Array.from(this.classEnrollments.values()).filter(
      (enrollment) => enrollment.studentId === studentId,
    );
  }

  async createClassEnrollment(insertEnrollment: InsertClassEnrollment): Promise<ClassEnrollment> {
    const id = this.classEnrollmentIdCounter++;
    const enrollment: ClassEnrollment = { ...insertEnrollment, id };
    this.classEnrollments.set(id, enrollment);
    return enrollment;
  }

  async deleteClassEnrollment(id: number): Promise<boolean> {
    return this.classEnrollments.delete(id);
  }

  // Attendance management
  async getAttendance(): Promise<Attendance[]> {
    return Array.from(this.attendance.values());
  }

  async getAttendanceByClassId(classId: number): Promise<Attendance[]> {
    return Array.from(this.attendance.values()).filter(
      (attendance) => attendance.classId === classId,
    );
  }

  async getAttendanceByStudentId(studentId: number): Promise<Attendance[]> {
    return Array.from(this.attendance.values()).filter(
      (attendance) => attendance.studentId === studentId,
    );
  }

  async getAttendanceByDate(date: Date): Promise<Attendance[]> {
    const dateString = date.toISOString().split('T')[0];
    return Array.from(this.attendance.values()).filter(
      (attendance) => {
        const attendanceDate = new Date(attendance.date).toISOString().split('T')[0];
        return attendanceDate === dateString;
      }
    );
  }

  async createAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const id = this.attendanceIdCounter++;
    const attendance: Attendance = { ...insertAttendance, id };
    this.attendance.set(id, attendance);
    return attendance;
  }

  async updateAttendance(id: number, attendanceData: Partial<InsertAttendance>): Promise<Attendance | undefined> {
    const attendance = this.attendance.get(id);
    if (!attendance) return undefined;
    
    const updatedAttendance = { ...attendance, ...attendanceData };
    this.attendance.set(id, updatedAttendance);
    return updatedAttendance;
  }

  async deleteAttendance(id: number): Promise<boolean> {
    return this.attendance.delete(id);
  }

  // Grade management
  async getGrades(): Promise<Grade[]> {
    return Array.from(this.grades.values());
  }

  async getGradesByClassId(classId: number): Promise<Grade[]> {
    return Array.from(this.grades.values()).filter(
      (grade) => grade.classId === classId,
    );
  }

  async getGradesByStudentId(studentId: number): Promise<Grade[]> {
    return Array.from(this.grades.values()).filter(
      (grade) => grade.studentId === studentId,
    );
  }

  async createGrade(insertGrade: InsertGrade): Promise<Grade> {
    const id = this.gradeIdCounter++;
    const grade: Grade = { ...insertGrade, id };
    this.grades.set(id, grade);
    return grade;
  }

  async updateGrade(id: number, gradeData: Partial<InsertGrade>): Promise<Grade | undefined> {
    const grade = this.grades.get(id);
    if (!grade) return undefined;
    
    const updatedGrade = { ...grade, ...gradeData };
    this.grades.set(id, updatedGrade);
    return updatedGrade;
  }

  async deleteGrade(id: number): Promise<boolean> {
    return this.grades.delete(id);
  }

  // Event management
  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.eventIdCounter++;
    const event: Event = { ...insertEvent, id };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, ...eventData };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }

  // Activity logs
  async getActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values()).sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const activity: Activity = { ...insertActivity, id, timestamp: new Date() };
    this.activities.set(id, activity);
    return activity;
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    attendanceRate: number;
  }> {
    // Calculate attendance rate
    const attendanceRecords = Array.from(this.attendance.values());
    const presentCount = attendanceRecords.filter(a => a.status === 'present' || a.status === 'late').length;
    const attendanceRate = attendanceRecords.length > 0 
      ? (presentCount / attendanceRecords.length) * 100
      : 0;

    return {
      totalStudents: this.students.size,
      totalTeachers: this.teachers.size,
      totalClasses: this.classes.size,
      attendanceRate: Math.round(attendanceRate * 10) / 10 // Round to 1 decimal place
    };
  }

  // Seed some sample data for the application
  private seedSampleData() {
    // Sample teachers
    const teacher1 = this.createTeacher({
      teacherId: "TCH1001",
      firstName: "Robert",
      lastName: "Fox",
      email: "robert.fox@school.edu",
      phone: "+1-555-123-4567",
      address: "123 Oak St, Springfield",
      qualification: "M.Ed in Mathematics",
      joinDate: new Date("2020-08-01"),
      subjects: ["Mathematics", "Physics"],
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100",
      userId: 1
    });

    const teacher2 = this.createTeacher({
      teacherId: "TCH1002",
      firstName: "Esther",
      lastName: "Howard",
      email: "esther.howard@school.edu",
      phone: "+1-555-234-5678",
      address: "456 Maple Ave, Springfield",
      qualification: "Ph.D in Literature",
      joinDate: new Date("2019-07-15"),
      subjects: ["English Literature", "Grammar"],
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100",
      userId: undefined
    });

    const teacher3 = this.createTeacher({
      teacherId: "TCH1003",
      firstName: "Cameron",
      lastName: "Smith",
      email: "cameron.smith@school.edu",
      phone: "+1-555-345-6789",
      address: "789 Pine Rd, Springfield",
      qualification: "M.Sc in Biology",
      joinDate: new Date("2021-01-10"),
      subjects: ["Biology", "Chemistry"],
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100",
      userId: undefined
    });

    // Sample students
    const student1 = this.createStudent({
      studentId: "STU10045",
      firstName: "Sarah",
      lastName: "Johnson",
      gender: "F",
      dateOfBirth: new Date("2007-05-15"),
      email: "sarah.j@example.com",
      phone: "+1 234-567-8901",
      address: "101 Student Way, Springfield",
      guardianName: "Michael Johnson",
      guardianPhone: "+1 234-567-8910",
      gradeLevel: "10",
      section: "A",
      enrollmentDate: new Date("2022-09-01"),
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100"
    });

    const student2 = this.createStudent({
      studentId: "STU10046",
      firstName: "Michael",
      lastName: "Brown",
      gender: "M",
      dateOfBirth: new Date("2006-08-22"),
      email: "michael.b@example.com",
      phone: "+1 234-567-8902",
      address: "202 Student Ave, Springfield",
      guardianName: "Patricia Brown",
      guardianPhone: "+1 234-567-8920",
      gradeLevel: "11",
      section: "B",
      enrollmentDate: new Date("2021-09-01"),
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100"
    });

    const student3 = this.createStudent({
      studentId: "STU10047",
      firstName: "Emma",
      lastName: "Wilson",
      gender: "F",
      dateOfBirth: new Date("2007-03-10"),
      email: "emma.w@example.com",
      phone: "+1 234-567-8903",
      address: "303 Student Blvd, Springfield",
      guardianName: "David Wilson",
      guardianPhone: "+1 234-567-8930",
      gradeLevel: "10",
      section: "A",
      enrollmentDate: new Date("2022-09-01"),
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100"
    });

    const student4 = this.createStudent({
      studentId: "STU10048",
      firstName: "James",
      lastName: "Taylor",
      gender: "M",
      dateOfBirth: new Date("2008-12-05"),
      email: "james.t@example.com",
      phone: "+1 234-567-8904",
      address: "404 Student Circle, Springfield",
      guardianName: "Mary Taylor",
      guardianPhone: "+1 234-567-8940",
      gradeLevel: "9",
      section: "C",
      enrollmentDate: new Date("2023-09-01"),
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100"
    });

    const student5 = this.createStudent({
      studentId: "STU10049",
      firstName: "Olivia",
      lastName: "Martin",
      gender: "F",
      dateOfBirth: new Date("2006-06-30"),
      email: "olivia.m@example.com",
      phone: "+1 234-567-8905",
      address: "505 Student Lane, Springfield",
      guardianName: "Robert Martin",
      guardianPhone: "+1 234-567-8950",
      gradeLevel: "11",
      section: "A",
      enrollmentDate: new Date("2021-09-01"),
      avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100"
    });

    // Sample classes
    const class1 = this.createClass({
      className: "Mathematics 101",
      classCode: "MATH101",
      gradeLevel: "10",
      section: "A",
      description: "Basic algebra and geometry concepts",
      teacherId: 1, // Robert Fox
      schedule: "Mon, Wed, Fri 9:00-10:00",
      roomNumber: "101",
      academicYear: "2023-2024"
    });

    const class2 = this.createClass({
      className: "English Literature",
      classCode: "ENG201",
      gradeLevel: "11",
      section: "B",
      description: "Study of classic literature works",
      teacherId: 2, // Esther Howard
      schedule: "Tue, Thu 10:00-11:30",
      roomNumber: "202",
      academicYear: "2023-2024"
    });

    const class3 = this.createClass({
      className: "Biology",
      classCode: "BIO101",
      gradeLevel: "9",
      section: "C",
      description: "Introduction to biological concepts",
      teacherId: 3, // Cameron Smith
      schedule: "Mon, Wed 1:00-2:30",
      roomNumber: "305",
      academicYear: "2023-2024"
    });

    // Sample class enrollments
    this.createClassEnrollment({
      classId: 1, // Math 101
      studentId: 1, // Sarah Johnson
      enrollmentDate: new Date("2023-09-01")
    });

    this.createClassEnrollment({
      classId: 1, // Math 101
      studentId: 3, // Emma Wilson
      enrollmentDate: new Date("2023-09-01")
    });

    this.createClassEnrollment({
      classId: 2, // English Literature
      studentId: 2, // Michael Brown
      enrollmentDate: new Date("2023-09-01")
    });

    this.createClassEnrollment({
      classId: 2, // English Literature
      studentId: 5, // Olivia Martin
      enrollmentDate: new Date("2023-09-01")
    });

    this.createClassEnrollment({
      classId: 3, // Biology
      studentId: 4, // James Taylor
      enrollmentDate: new Date("2023-09-01")
    });

    // Sample attendance records
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    this.createAttendance({
      classId: 1, // Math 101
      studentId: 1, // Sarah Johnson
      date: today,
      status: "present",
      notes: ""
    });

    this.createAttendance({
      classId: 1, // Math 101
      studentId: 3, // Emma Wilson
      date: today,
      status: "present",
      notes: ""
    });

    this.createAttendance({
      classId: 2, // English Literature
      studentId: 2, // Michael Brown
      date: today,
      status: "late",
      notes: "Arrived 10 minutes late"
    });

    this.createAttendance({
      classId: 2, // English Literature
      studentId: 5, // Olivia Martin
      date: today,
      status: "present",
      notes: ""
    });

    this.createAttendance({
      classId: 3, // Biology
      studentId: 4, // James Taylor
      date: today,
      status: "absent",
      notes: "No notification received"
    });

    // Yesterday's attendance
    this.createAttendance({
      classId: 1, // Math 101
      studentId: 1, // Sarah Johnson
      date: yesterday,
      status: "present",
      notes: ""
    });

    this.createAttendance({
      classId: 1, // Math 101
      studentId: 3, // Emma Wilson
      date: yesterday,
      status: "present",
      notes: ""
    });

    // Sample grades
    this.createGrade({
      classId: 1, // Math 101
      studentId: 1, // Sarah Johnson
      assignmentName: "Algebra Quiz 1",
      assignmentType: "quiz",
      maxScore: 20,
      score: 19,
      gradedDate: new Date("2023-09-15"),
      comments: "Excellent work!"
    });

    this.createGrade({
      classId: 1, // Math 101
      studentId: 3, // Emma Wilson
      assignmentName: "Algebra Quiz 1",
      assignmentType: "quiz",
      maxScore: 20,
      score: 18,
      gradedDate: new Date("2023-09-15"),
      comments: "Great job!"
    });

    this.createGrade({
      classId: 2, // English Literature
      studentId: 2, // Michael Brown
      assignmentName: "Essay on Shakespeare",
      assignmentType: "homework",
      maxScore: 50,
      score: 45,
      gradedDate: new Date("2023-09-20"),
      comments: "Well written, good analysis."
    });

    this.createGrade({
      classId: 2, // English Literature
      studentId: 5, // Olivia Martin
      assignmentName: "Essay on Shakespeare",
      assignmentType: "homework",
      maxScore: 50,
      score: 48,
      gradedDate: new Date("2023-09-20"),
      comments: "Outstanding work, very insightful."
    });

    this.createGrade({
      classId: 3, // Biology
      studentId: 4, // James Taylor
      assignmentName: "Cell Structure Test",
      assignmentType: "exam",
      maxScore: 100,
      score: 72,
      gradedDate: new Date("2023-09-25"),
      comments: "Need improvement in understanding organelles."
    });

    // Sample events
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    this.createEvent({
      title: "Final Exams - Grade 10",
      description: "End of semester examinations for all Grade 10 students",
      startDate: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 2),
      endDate: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 2),
      startTime: "08:00",
      endTime: "12:00",
      allDay: false,
      location: "Examination Hall",
      type: "exam"
    });

    this.createEvent({
      title: "Parent-Teacher Meeting",
      description: "Semester review with parents",
      startDate: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 5),
      endDate: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 5),
      startTime: "14:00",
      endTime: "17:00",
      allDay: false,
      location: "School Auditorium",
      type: "meeting"
    });

    this.createEvent({
      title: "School Sports Day",
      description: "Annual athletics competition",
      startDate: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 10),
      endDate: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 10),
      startTime: "09:00",
      endTime: "16:00",
      allDay: true,
      location: "School Sports Ground",
      type: "activity"
    });

    this.createEvent({
      title: "Annual Science Fair",
      description: "Showcase of student science projects",
      startDate: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 15),
      endDate: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 15),
      startTime: "10:00",
      endTime: "15:00",
      allDay: false,
      location: "School Hall",
      type: "activity"
    });

    // Sample activities
    this.createActivity({
      userId: 1,
      action: "Added Student",
      details: "Added Sarah Johnson to Grade 10-A"
    });

    this.createActivity({
      userId: 1,
      action: "Updated Grade",
      details: "Updated Algebra Quiz 1 grades for Math 101"
    });

    this.createActivity({
      userId: 1,
      action: "Marked Attendance",
      details: "Marked attendance for English Literature class"
    });

    this.createActivity({
      userId: 1,
      action: "Added Class",
      details: "Added Mathematics 101 for Grade 10-A"
    });

    this.createActivity({
      userId: 1,
      action: "Updated Teacher",
      details: "Updated contact information for Cameron Smith"
    });
  }
}

export const storage = new MemStorage();
