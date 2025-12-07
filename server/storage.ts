import {
  users,
  students,
  teachers,
  subjects,
  batches,
  batchTeachers,
  batchStudents,
  attendance,
  homework,
  homeworkSubmissions,
  feeStructures,
  feePayments,
  tests,
  testResults,
  studyMaterials,
  complaints,
  complaintResponses,
  logbookEntries,
  assets,
  libraryBooks,
  bookIssues,
  lostAndFound,
  certificates,
  otpCodes,
  passwordResetTokens,
  registrationCounters,
  type User,
  type UpsertUser,
  type Student,
  type InsertStudent,
  type Teacher,
  type InsertTeacher,
  type Subject,
  type InsertSubject,
  type Batch,
  type InsertBatch,
  type BatchTeacher,
  type InsertBatchTeacher,
  type BatchStudent,
  type InsertBatchStudent,
  type Attendance,
  type InsertAttendance,
  type Homework,
  type InsertHomework,
  type HomeworkSubmission,
  type InsertHomeworkSubmission,
  type FeeStructure,
  type InsertFeeStructure,
  type FeePayment,
  type InsertFeePayment,
  type Test,
  type InsertTest,
  type TestResult,
  type InsertTestResult,
  type StudyMaterial,
  type InsertStudyMaterial,
  type Complaint,
  type InsertComplaint,
  type ComplaintResponse,
  type InsertComplaintResponse,
  type LogbookEntry,
  type InsertLogbookEntry,
  type Asset,
  type InsertAsset,
  type LibraryBook,
  type InsertLibraryBook,
  type BookIssue,
  type InsertBookIssue,
  type LostAndFound,
  type InsertLostAndFound,
  type Certificate,
  type InsertCertificate,
  type OtpCode,
  type InsertOtpCode,
  type PasswordResetToken,
  type InsertPasswordResetToken,
  type RegistrationCounter,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, lt } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(id: string, role: "admin" | "teacher" | "parent" | "student"): Promise<User | undefined>;

  // Students
  getStudents(): Promise<Student[]>;
  getStudent(id: string): Promise<Student | undefined>;
  getStudentsByParent(parentId: string): Promise<Student[]>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student | undefined>;
  deleteStudent(id: string): Promise<void>;

  // Teachers
  getTeachers(): Promise<Teacher[]>;
  getTeacher(id: string): Promise<Teacher | undefined>;
  getTeacherByUserId(userId: string): Promise<Teacher | undefined>;
  createTeacher(teacher: InsertTeacher): Promise<Teacher>;
  updateTeacher(id: string, teacher: Partial<InsertTeacher>): Promise<Teacher | undefined>;
  deleteTeacher(id: string): Promise<void>;

  // Subjects
  getSubjects(): Promise<Subject[]>;
  getSubject(id: string): Promise<Subject | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  updateSubject(id: string, subject: Partial<InsertSubject>): Promise<Subject | undefined>;
  deleteSubject(id: string): Promise<void>;

  // Batches
  getBatches(): Promise<Batch[]>;
  getBatch(id: string): Promise<Batch | undefined>;
  createBatch(batch: InsertBatch): Promise<Batch>;
  updateBatch(id: string, batch: Partial<InsertBatch>): Promise<Batch | undefined>;
  deleteBatch(id: string): Promise<void>;

  // Batch Teachers
  getBatchTeachers(batchId: string): Promise<BatchTeacher[]>;
  getBatchesByTeacher(teacherId: string): Promise<BatchTeacher[]>;
  assignTeacherToBatch(assignment: InsertBatchTeacher): Promise<BatchTeacher>;
  removeTeacherFromBatch(id: string): Promise<void>;

  // Batch Students
  getBatchStudents(batchId: string): Promise<BatchStudent[]>;
  getStudentBatches(studentId: string): Promise<BatchStudent[]>;
  enrollStudentInBatch(enrollment: InsertBatchStudent): Promise<BatchStudent>;
  removeStudentFromBatch(id: string): Promise<void>;

  // Attendance
  getAttendance(filters: { batchId?: string; studentId?: string; date?: string }): Promise<Attendance[]>;
  createAttendance(record: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: string, record: Partial<InsertAttendance>): Promise<Attendance | undefined>;
  bulkCreateAttendance(records: InsertAttendance[]): Promise<Attendance[]>;

  // Homework
  getHomework(filters?: { batchId?: string; teacherId?: string }): Promise<Homework[]>;
  getHomeworkById(id: string): Promise<Homework | undefined>;
  createHomework(hw: InsertHomework): Promise<Homework>;
  updateHomework(id: string, hw: Partial<InsertHomework>): Promise<Homework | undefined>;
  deleteHomework(id: string): Promise<void>;

  // Homework Submissions
  getHomeworkSubmissions(homeworkId: string): Promise<HomeworkSubmission[]>;
  getStudentSubmissions(studentId: string): Promise<HomeworkSubmission[]>;
  createHomeworkSubmission(submission: InsertHomeworkSubmission): Promise<HomeworkSubmission>;
  updateHomeworkSubmission(id: string, submission: Partial<InsertHomeworkSubmission>): Promise<HomeworkSubmission | undefined>;

  // Fee Structures
  getFeeStructures(studentId?: string): Promise<FeeStructure[]>;
  createFeeStructure(feeStructure: InsertFeeStructure): Promise<FeeStructure>;
  updateFeeStructure(id: string, feeStructure: Partial<InsertFeeStructure>): Promise<FeeStructure | undefined>;

  // Fee Payments
  getFeePayments(filters?: { studentId?: string; feeStructureId?: string }): Promise<FeePayment[]>;
  createFeePayment(payment: InsertFeePayment): Promise<FeePayment>;

  // Tests
  getTests(filters?: { batchId?: string; teacherId?: string }): Promise<Test[]>;
  getTest(id: string): Promise<Test | undefined>;
  createTest(test: InsertTest): Promise<Test>;
  updateTest(id: string, test: Partial<InsertTest>): Promise<Test | undefined>;
  deleteTest(id: string): Promise<void>;

  // Test Results
  getTestResults(testId: string): Promise<TestResult[]>;
  getStudentResults(studentId: string): Promise<TestResult[]>;
  createTestResult(result: InsertTestResult): Promise<TestResult>;
  updateTestResult(id: string, result: Partial<InsertTestResult>): Promise<TestResult | undefined>;
  bulkCreateTestResults(results: InsertTestResult[]): Promise<TestResult[]>;

  // Study Materials
  getStudyMaterials(filters?: { subjectId?: string; academicCategory?: string }): Promise<StudyMaterial[]>;
  createStudyMaterial(material: InsertStudyMaterial): Promise<StudyMaterial>;
  deleteStudyMaterial(id: string): Promise<void>;

  // Complaints
  getComplaints(filters?: { raisedBy?: string; status?: string }): Promise<Complaint[]>;
  getComplaint(id: string): Promise<Complaint | undefined>;
  createComplaint(complaint: InsertComplaint): Promise<Complaint>;
  updateComplaint(id: string, complaint: Partial<InsertComplaint>): Promise<Complaint | undefined>;

  // Complaint Responses
  getComplaintResponses(complaintId: string): Promise<ComplaintResponse[]>;
  createComplaintResponse(response: InsertComplaintResponse): Promise<ComplaintResponse>;

  // Logbook
  getLogbookEntries(filters?: { batchId?: string; teacherId?: string; date?: string }): Promise<LogbookEntry[]>;
  createLogbookEntry(entry: InsertLogbookEntry): Promise<LogbookEntry>;
  updateLogbookEntry(id: string, entry: Partial<InsertLogbookEntry>): Promise<LogbookEntry | undefined>;

  // Assets
  getAssets(): Promise<Asset[]>;
  getAsset(id: string): Promise<Asset | undefined>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  updateAsset(id: string, asset: Partial<InsertAsset>): Promise<Asset | undefined>;
  deleteAsset(id: string): Promise<void>;

  // Library Books
  getLibraryBooks(): Promise<LibraryBook[]>;
  getLibraryBook(id: string): Promise<LibraryBook | undefined>;
  createLibraryBook(book: InsertLibraryBook): Promise<LibraryBook>;
  updateLibraryBook(id: string, book: Partial<InsertLibraryBook>): Promise<LibraryBook | undefined>;
  deleteLibraryBook(id: string): Promise<void>;

  // Book Issues
  getBookIssues(filters?: { bookId?: string; studentId?: string; status?: string }): Promise<BookIssue[]>;
  createBookIssue(issue: InsertBookIssue): Promise<BookIssue>;
  updateBookIssue(id: string, issue: Partial<InsertBookIssue>): Promise<BookIssue | undefined>;

  // Lost and Found
  getLostAndFoundItems(status?: string): Promise<LostAndFound[]>;
  createLostAndFoundItem(item: InsertLostAndFound): Promise<LostAndFound>;
  updateLostAndFoundItem(id: string, item: Partial<InsertLostAndFound>): Promise<LostAndFound | undefined>;

  // Certificates
  getCertificates(studentId?: string): Promise<Certificate[]>;
  createCertificate(cert: InsertCertificate): Promise<Certificate>;

  // Dashboard Stats
  getDashboardStats(): Promise<{
    totalStudents: number;
    totalTeachers: number;
    totalBatches: number;
    pendingFees: number;
    todayAttendance: number;
    pendingComplaints: number;
  }>;

  // Authentication
  getUserByRegistrationNumber(registrationNumber: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUserPassword(userId: string, passwordHash: string): Promise<void>;
  updateUserProfile(userId: string, data: { username?: string; profileImageUrl?: string }): Promise<User | undefined>;
  generateRegistrationNumber(type: 'student' | 'teacher'): Promise<string>;
  
  // OTP Codes
  createOtpCode(otp: InsertOtpCode): Promise<OtpCode>;
  getValidOtpCode(registrationNumber: string, code: string): Promise<OtpCode | undefined>;
  markOtpAsUsed(id: string): Promise<void>;
  cleanupExpiredOtps(): Promise<void>;
  
  // Password Reset Tokens
  createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken>;
  getValidPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markPasswordResetTokenAsUsed(id: string): Promise<void>;
  cleanupExpiredTokens(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserRole(id: string, role: "admin" | "teacher" | "parent" | "student"): Promise<User | undefined> {
    const [user] = await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, id)).returning();
    return user;
  }

  // Students
  async getStudents(): Promise<Student[]> {
    return db.select().from(students).orderBy(desc(students.createdAt));
  }

  async getStudent(id: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student;
  }

  async getStudentsByParent(parentId: string): Promise<Student[]> {
    return db.select().from(students).where(eq(students.parentId, parentId));
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const [created] = await db.insert(students).values(student).returning();
    return created;
  }

  async updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student | undefined> {
    const [updated] = await db.update(students).set({ ...student, updatedAt: new Date() }).where(eq(students.id, id)).returning();
    return updated;
  }

  async deleteStudent(id: string): Promise<void> {
    await db.delete(students).where(eq(students.id, id));
  }

  // Teachers
  async getTeachers(): Promise<Teacher[]> {
    return db.select().from(teachers).orderBy(desc(teachers.createdAt));
  }

  async getTeacher(id: string): Promise<Teacher | undefined> {
    const [teacher] = await db.select().from(teachers).where(eq(teachers.id, id));
    return teacher;
  }

  async getTeacherByUserId(userId: string): Promise<Teacher | undefined> {
    const [teacher] = await db.select().from(teachers).where(eq(teachers.userId, userId));
    return teacher;
  }

  async createTeacher(teacher: InsertTeacher): Promise<Teacher> {
    const [created] = await db.insert(teachers).values(teacher).returning();
    return created;
  }

  async updateTeacher(id: string, teacher: Partial<InsertTeacher>): Promise<Teacher | undefined> {
    const [updated] = await db.update(teachers).set({ ...teacher, updatedAt: new Date() }).where(eq(teachers.id, id)).returning();
    return updated;
  }

  async deleteTeacher(id: string): Promise<void> {
    await db.delete(teachers).where(eq(teachers.id, id));
  }

  // Subjects
  async getSubjects(): Promise<Subject[]> {
    return db.select().from(subjects).orderBy(subjects.name);
  }

  async getSubject(id: string): Promise<Subject | undefined> {
    const [subject] = await db.select().from(subjects).where(eq(subjects.id, id));
    return subject;
  }

  async createSubject(subject: InsertSubject): Promise<Subject> {
    const [created] = await db.insert(subjects).values(subject).returning();
    return created;
  }

  async updateSubject(id: string, subject: Partial<InsertSubject>): Promise<Subject | undefined> {
    const [updated] = await db.update(subjects).set(subject).where(eq(subjects.id, id)).returning();
    return updated;
  }

  async deleteSubject(id: string): Promise<void> {
    await db.delete(subjects).where(eq(subjects.id, id));
  }

  // Batches
  async getBatches(): Promise<Batch[]> {
    return db.select().from(batches).orderBy(batches.name);
  }

  async getBatch(id: string): Promise<Batch | undefined> {
    const [batch] = await db.select().from(batches).where(eq(batches.id, id));
    return batch;
  }

  async createBatch(batch: InsertBatch): Promise<Batch> {
    const [created] = await db.insert(batches).values(batch).returning();
    return created;
  }

  async updateBatch(id: string, batch: Partial<InsertBatch>): Promise<Batch | undefined> {
    const [updated] = await db.update(batches).set({ ...batch, updatedAt: new Date() }).where(eq(batches.id, id)).returning();
    return updated;
  }

  async deleteBatch(id: string): Promise<void> {
    await db.delete(batches).where(eq(batches.id, id));
  }

  // Batch Teachers
  async getBatchTeachers(batchId: string): Promise<BatchTeacher[]> {
    return db.select().from(batchTeachers).where(eq(batchTeachers.batchId, batchId));
  }

  async getBatchesByTeacher(teacherId: string): Promise<BatchTeacher[]> {
    return db.select().from(batchTeachers).where(eq(batchTeachers.teacherId, teacherId));
  }

  async assignTeacherToBatch(assignment: InsertBatchTeacher): Promise<BatchTeacher> {
    const [created] = await db.insert(batchTeachers).values(assignment).returning();
    return created;
  }

  async removeTeacherFromBatch(id: string): Promise<void> {
    await db.delete(batchTeachers).where(eq(batchTeachers.id, id));
  }

  // Batch Students
  async getBatchStudents(batchId: string): Promise<BatchStudent[]> {
    return db.select().from(batchStudents).where(eq(batchStudents.batchId, batchId));
  }

  async getStudentBatches(studentId: string): Promise<BatchStudent[]> {
    return db.select().from(batchStudents).where(eq(batchStudents.studentId, studentId));
  }

  async enrollStudentInBatch(enrollment: InsertBatchStudent): Promise<BatchStudent> {
    const [created] = await db.insert(batchStudents).values(enrollment).returning();
    return created;
  }

  async removeStudentFromBatch(id: string): Promise<void> {
    await db.delete(batchStudents).where(eq(batchStudents.id, id));
  }

  // Attendance
  async getAttendance(filters: { batchId?: string; studentId?: string; date?: string }): Promise<Attendance[]> {
    let query = db.select().from(attendance);
    const conditions = [];
    if (filters.batchId) conditions.push(eq(attendance.batchId, filters.batchId));
    if (filters.studentId) conditions.push(eq(attendance.studentId, filters.studentId));
    if (filters.date) conditions.push(eq(attendance.date, filters.date));
    if (conditions.length > 0) {
      return db.select().from(attendance).where(and(...conditions)).orderBy(desc(attendance.date));
    }
    return db.select().from(attendance).orderBy(desc(attendance.date));
  }

  async createAttendance(record: InsertAttendance): Promise<Attendance> {
    const [created] = await db.insert(attendance).values(record).returning();
    return created;
  }

  async updateAttendance(id: string, record: Partial<InsertAttendance>): Promise<Attendance | undefined> {
    const [updated] = await db.update(attendance).set(record).where(eq(attendance.id, id)).returning();
    return updated;
  }

  async bulkCreateAttendance(records: InsertAttendance[]): Promise<Attendance[]> {
    if (records.length === 0) return [];
    return db.insert(attendance).values(records).returning();
  }

  // Homework
  async getHomework(filters?: { batchId?: string; teacherId?: string }): Promise<Homework[]> {
    const conditions = [];
    if (filters?.batchId) conditions.push(eq(homework.batchId, filters.batchId));
    if (filters?.teacherId) conditions.push(eq(homework.teacherId, filters.teacherId));
    if (conditions.length > 0) {
      return db.select().from(homework).where(and(...conditions)).orderBy(desc(homework.createdAt));
    }
    return db.select().from(homework).orderBy(desc(homework.createdAt));
  }

  async getHomeworkById(id: string): Promise<Homework | undefined> {
    const [hw] = await db.select().from(homework).where(eq(homework.id, id));
    return hw;
  }

  async createHomework(hw: InsertHomework): Promise<Homework> {
    const [created] = await db.insert(homework).values(hw).returning();
    return created;
  }

  async updateHomework(id: string, hw: Partial<InsertHomework>): Promise<Homework | undefined> {
    const [updated] = await db.update(homework).set({ ...hw, updatedAt: new Date() }).where(eq(homework.id, id)).returning();
    return updated;
  }

  async deleteHomework(id: string): Promise<void> {
    await db.delete(homework).where(eq(homework.id, id));
  }

  // Homework Submissions
  async getHomeworkSubmissions(homeworkId: string): Promise<HomeworkSubmission[]> {
    return db.select().from(homeworkSubmissions).where(eq(homeworkSubmissions.homeworkId, homeworkId));
  }

  async getStudentSubmissions(studentId: string): Promise<HomeworkSubmission[]> {
    return db.select().from(homeworkSubmissions).where(eq(homeworkSubmissions.studentId, studentId));
  }

  async createHomeworkSubmission(submission: InsertHomeworkSubmission): Promise<HomeworkSubmission> {
    const [created] = await db.insert(homeworkSubmissions).values(submission).returning();
    return created;
  }

  async updateHomeworkSubmission(id: string, submission: Partial<InsertHomeworkSubmission>): Promise<HomeworkSubmission | undefined> {
    const [updated] = await db.update(homeworkSubmissions).set(submission).where(eq(homeworkSubmissions.id, id)).returning();
    return updated;
  }

  // Fee Structures
  async getFeeStructures(studentId?: string): Promise<FeeStructure[]> {
    if (studentId) {
      return db.select().from(feeStructures).where(eq(feeStructures.studentId, studentId));
    }
    return db.select().from(feeStructures);
  }

  async createFeeStructure(feeStructure: InsertFeeStructure): Promise<FeeStructure> {
    const [created] = await db.insert(feeStructures).values(feeStructure).returning();
    return created;
  }

  async updateFeeStructure(id: string, feeStructure: Partial<InsertFeeStructure>): Promise<FeeStructure | undefined> {
    const [updated] = await db.update(feeStructures).set(feeStructure).where(eq(feeStructures.id, id)).returning();
    return updated;
  }

  // Fee Payments
  async getFeePayments(filters?: { studentId?: string; feeStructureId?: string }): Promise<FeePayment[]> {
    const conditions = [];
    if (filters?.studentId) conditions.push(eq(feePayments.studentId, filters.studentId));
    if (filters?.feeStructureId) conditions.push(eq(feePayments.feeStructureId, filters.feeStructureId));
    if (conditions.length > 0) {
      return db.select().from(feePayments).where(and(...conditions)).orderBy(desc(feePayments.paymentDate));
    }
    return db.select().from(feePayments).orderBy(desc(feePayments.paymentDate));
  }

  async createFeePayment(payment: InsertFeePayment): Promise<FeePayment> {
    const [created] = await db.insert(feePayments).values(payment).returning();
    return created;
  }

  // Tests
  async getTests(filters?: { batchId?: string; teacherId?: string }): Promise<Test[]> {
    const conditions = [];
    if (filters?.batchId) conditions.push(eq(tests.batchId, filters.batchId));
    if (filters?.teacherId) conditions.push(eq(tests.teacherId, filters.teacherId));
    if (conditions.length > 0) {
      return db.select().from(tests).where(and(...conditions)).orderBy(desc(tests.testDate));
    }
    return db.select().from(tests).orderBy(desc(tests.testDate));
  }

  async getTest(id: string): Promise<Test | undefined> {
    const [test] = await db.select().from(tests).where(eq(tests.id, id));
    return test;
  }

  async createTest(test: InsertTest): Promise<Test> {
    const [created] = await db.insert(tests).values(test).returning();
    return created;
  }

  async updateTest(id: string, test: Partial<InsertTest>): Promise<Test | undefined> {
    const [updated] = await db.update(tests).set({ ...test, updatedAt: new Date() }).where(eq(tests.id, id)).returning();
    return updated;
  }

  async deleteTest(id: string): Promise<void> {
    await db.delete(tests).where(eq(tests.id, id));
  }

  // Test Results
  async getTestResults(testId: string): Promise<TestResult[]> {
    return db.select().from(testResults).where(eq(testResults.testId, testId));
  }

  async getStudentResults(studentId: string): Promise<TestResult[]> {
    return db.select().from(testResults).where(eq(testResults.studentId, studentId)).orderBy(desc(testResults.createdAt));
  }

  async createTestResult(result: InsertTestResult): Promise<TestResult> {
    const [created] = await db.insert(testResults).values(result).returning();
    return created;
  }

  async updateTestResult(id: string, result: Partial<InsertTestResult>): Promise<TestResult | undefined> {
    const [updated] = await db.update(testResults).set(result).where(eq(testResults.id, id)).returning();
    return updated;
  }

  async bulkCreateTestResults(results: InsertTestResult[]): Promise<TestResult[]> {
    if (results.length === 0) return [];
    return db.insert(testResults).values(results).returning();
  }

  // Study Materials
  async getStudyMaterials(filters?: { subjectId?: string; academicCategory?: string }): Promise<StudyMaterial[]> {
    const conditions = [];
    if (filters?.subjectId) conditions.push(eq(studyMaterials.subjectId, filters.subjectId));
    if (filters?.academicCategory) conditions.push(eq(studyMaterials.academicCategory, filters.academicCategory as any));
    if (conditions.length > 0) {
      return db.select().from(studyMaterials).where(and(...conditions)).orderBy(desc(studyMaterials.createdAt));
    }
    return db.select().from(studyMaterials).orderBy(desc(studyMaterials.createdAt));
  }

  async createStudyMaterial(material: InsertStudyMaterial): Promise<StudyMaterial> {
    const [created] = await db.insert(studyMaterials).values(material).returning();
    return created;
  }

  async deleteStudyMaterial(id: string): Promise<void> {
    await db.delete(studyMaterials).where(eq(studyMaterials.id, id));
  }

  // Complaints
  async getComplaints(filters?: { raisedBy?: string; status?: string }): Promise<Complaint[]> {
    const conditions = [];
    if (filters?.raisedBy) conditions.push(eq(complaints.raisedBy, filters.raisedBy));
    if (filters?.status) conditions.push(eq(complaints.status, filters.status as any));
    if (conditions.length > 0) {
      return db.select().from(complaints).where(and(...conditions)).orderBy(desc(complaints.createdAt));
    }
    return db.select().from(complaints).orderBy(desc(complaints.createdAt));
  }

  async getComplaint(id: string): Promise<Complaint | undefined> {
    const [complaint] = await db.select().from(complaints).where(eq(complaints.id, id));
    return complaint;
  }

  async createComplaint(complaint: InsertComplaint): Promise<Complaint> {
    const [created] = await db.insert(complaints).values(complaint).returning();
    return created;
  }

  async updateComplaint(id: string, complaint: Partial<InsertComplaint>): Promise<Complaint | undefined> {
    const [updated] = await db.update(complaints).set({ ...complaint, updatedAt: new Date() }).where(eq(complaints.id, id)).returning();
    return updated;
  }

  // Complaint Responses
  async getComplaintResponses(complaintId: string): Promise<ComplaintResponse[]> {
    return db.select().from(complaintResponses).where(eq(complaintResponses.complaintId, complaintId)).orderBy(complaintResponses.createdAt);
  }

  async createComplaintResponse(response: InsertComplaintResponse): Promise<ComplaintResponse> {
    const [created] = await db.insert(complaintResponses).values(response).returning();
    return created;
  }

  // Logbook
  async getLogbookEntries(filters?: { batchId?: string; teacherId?: string; date?: string }): Promise<LogbookEntry[]> {
    const conditions = [];
    if (filters?.batchId) conditions.push(eq(logbookEntries.batchId, filters.batchId));
    if (filters?.teacherId) conditions.push(eq(logbookEntries.teacherId, filters.teacherId));
    if (filters?.date) conditions.push(eq(logbookEntries.date, filters.date));
    if (conditions.length > 0) {
      return db.select().from(logbookEntries).where(and(...conditions)).orderBy(desc(logbookEntries.date));
    }
    return db.select().from(logbookEntries).orderBy(desc(logbookEntries.date));
  }

  async createLogbookEntry(entry: InsertLogbookEntry): Promise<LogbookEntry> {
    const [created] = await db.insert(logbookEntries).values(entry).returning();
    return created;
  }

  async updateLogbookEntry(id: string, entry: Partial<InsertLogbookEntry>): Promise<LogbookEntry | undefined> {
    const [updated] = await db.update(logbookEntries).set(entry).where(eq(logbookEntries.id, id)).returning();
    return updated;
  }

  // Assets
  async getAssets(): Promise<Asset[]> {
    return db.select().from(assets).orderBy(assets.name);
  }

  async getAsset(id: string): Promise<Asset | undefined> {
    const [asset] = await db.select().from(assets).where(eq(assets.id, id));
    return asset;
  }

  async createAsset(asset: InsertAsset): Promise<Asset> {
    const [created] = await db.insert(assets).values(asset).returning();
    return created;
  }

  async updateAsset(id: string, asset: Partial<InsertAsset>): Promise<Asset | undefined> {
    const [updated] = await db.update(assets).set({ ...asset, updatedAt: new Date() }).where(eq(assets.id, id)).returning();
    return updated;
  }

  async deleteAsset(id: string): Promise<void> {
    await db.delete(assets).where(eq(assets.id, id));
  }

  // Library Books
  async getLibraryBooks(): Promise<LibraryBook[]> {
    return db.select().from(libraryBooks).orderBy(libraryBooks.title);
  }

  async getLibraryBook(id: string): Promise<LibraryBook | undefined> {
    const [book] = await db.select().from(libraryBooks).where(eq(libraryBooks.id, id));
    return book;
  }

  async createLibraryBook(book: InsertLibraryBook): Promise<LibraryBook> {
    const [created] = await db.insert(libraryBooks).values(book).returning();
    return created;
  }

  async updateLibraryBook(id: string, book: Partial<InsertLibraryBook>): Promise<LibraryBook | undefined> {
    const [updated] = await db.update(libraryBooks).set(book).where(eq(libraryBooks.id, id)).returning();
    return updated;
  }

  async deleteLibraryBook(id: string): Promise<void> {
    await db.delete(libraryBooks).where(eq(libraryBooks.id, id));
  }

  // Book Issues
  async getBookIssues(filters?: { bookId?: string; studentId?: string; status?: string }): Promise<BookIssue[]> {
    const conditions = [];
    if (filters?.bookId) conditions.push(eq(bookIssues.bookId, filters.bookId));
    if (filters?.studentId) conditions.push(eq(bookIssues.studentId, filters.studentId));
    if (filters?.status) conditions.push(eq(bookIssues.status, filters.status));
    if (conditions.length > 0) {
      return db.select().from(bookIssues).where(and(...conditions)).orderBy(desc(bookIssues.issueDate));
    }
    return db.select().from(bookIssues).orderBy(desc(bookIssues.issueDate));
  }

  async createBookIssue(issue: InsertBookIssue): Promise<BookIssue> {
    const [created] = await db.insert(bookIssues).values(issue).returning();
    return created;
  }

  async updateBookIssue(id: string, issue: Partial<InsertBookIssue>): Promise<BookIssue | undefined> {
    const [updated] = await db.update(bookIssues).set(issue).where(eq(bookIssues.id, id)).returning();
    return updated;
  }

  // Lost and Found
  async getLostAndFoundItems(status?: string): Promise<LostAndFound[]> {
    if (status) {
      return db.select().from(lostAndFound).where(eq(lostAndFound.status, status as any)).orderBy(desc(lostAndFound.reportedDate));
    }
    return db.select().from(lostAndFound).orderBy(desc(lostAndFound.reportedDate));
  }

  async createLostAndFoundItem(item: InsertLostAndFound): Promise<LostAndFound> {
    const [created] = await db.insert(lostAndFound).values(item).returning();
    return created;
  }

  async updateLostAndFoundItem(id: string, item: Partial<InsertLostAndFound>): Promise<LostAndFound | undefined> {
    const [updated] = await db.update(lostAndFound).set(item).where(eq(lostAndFound.id, id)).returning();
    return updated;
  }

  // Certificates
  async getCertificates(studentId?: string): Promise<Certificate[]> {
    if (studentId) {
      return db.select().from(certificates).where(eq(certificates.studentId, studentId)).orderBy(desc(certificates.issueDate));
    }
    return db.select().from(certificates).orderBy(desc(certificates.issueDate));
  }

  async createCertificate(cert: InsertCertificate): Promise<Certificate> {
    const [created] = await db.insert(certificates).values(cert).returning();
    return created;
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<{
    totalStudents: number;
    totalTeachers: number;
    totalBatches: number;
    pendingFees: number;
    todayAttendance: number;
    pendingComplaints: number;
  }> {
    const today = new Date().toISOString().split("T")[0];

    const [studentCount] = await db.select({ count: sql<number>`count(*)` }).from(students).where(eq(students.isActive, true));
    const [teacherCount] = await db.select({ count: sql<number>`count(*)` }).from(teachers).where(eq(teachers.isActive, true));
    const [batchCount] = await db.select({ count: sql<number>`count(*)` }).from(batches).where(eq(batches.isActive, true));
    const [complaintCount] = await db.select({ count: sql<number>`count(*)` }).from(complaints).where(eq(complaints.status, "open"));
    const [attendanceCount] = await db.select({ count: sql<number>`count(*)` }).from(attendance).where(and(eq(attendance.date, today), eq(attendance.status, "present")));

    return {
      totalStudents: Number(studentCount?.count || 0),
      totalTeachers: Number(teacherCount?.count || 0),
      totalBatches: Number(batchCount?.count || 0),
      pendingFees: 0,
      todayAttendance: Number(attendanceCount?.count || 0),
      pendingComplaints: Number(complaintCount?.count || 0),
    };
  }

  // Authentication Methods
  async getUserByRegistrationNumber(registrationNumber: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.registrationNumber, registrationNumber));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async updateUserPassword(userId: string, passwordHash: string): Promise<void> {
    await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, userId));
  }

  async updateUserProfile(userId: string, data: { username?: string; profileImageUrl?: string }): Promise<User | undefined> {
    const [updated] = await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, userId)).returning();
    return updated;
  }

  async generateRegistrationNumber(type: 'student' | 'teacher'): Promise<string> {
    const [counter] = await db.select().from(registrationCounters).where(eq(registrationCounters.counterType, type));
    
    if (!counter) {
      const startNumber = type === 'student' ? 10000 : 1000;
      await db.insert(registrationCounters).values({
        id: type,
        counterType: type,
        lastNumber: startNumber + 1,
      });
      return (startNumber + 1).toString();
    }

    const newNumber = counter.lastNumber + 1;
    await db.update(registrationCounters).set({ lastNumber: newNumber }).where(eq(registrationCounters.counterType, type));
    
    return newNumber.toString();
  }

  // OTP Codes
  async createOtpCode(otp: InsertOtpCode): Promise<OtpCode> {
    const [created] = await db.insert(otpCodes).values(otp).returning();
    return created;
  }

  async getValidOtpCode(registrationNumber: string, code: string): Promise<OtpCode | undefined> {
    const now = new Date();
    const [otp] = await db.select().from(otpCodes).where(
      and(
        eq(otpCodes.registrationNumber, registrationNumber),
        eq(otpCodes.code, code),
        eq(otpCodes.isUsed, false)
      )
    );
    
    if (otp && new Date(otp.expiresAt) > now) {
      return otp;
    }
    return undefined;
  }

  async markOtpAsUsed(id: string): Promise<void> {
    await db.update(otpCodes).set({ isUsed: true }).where(eq(otpCodes.id, id));
  }

  async cleanupExpiredOtps(): Promise<void> {
    const now = new Date();
    await db.delete(otpCodes).where(lt(otpCodes.expiresAt, now));
  }

  // Password Reset Tokens
  async createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken> {
    const [created] = await db.insert(passwordResetTokens).values(token).returning();
    return created;
  }

  async getValidPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const now = new Date();
    const [resetToken] = await db.select().from(passwordResetTokens).where(
      and(
        eq(passwordResetTokens.token, token),
        eq(passwordResetTokens.isUsed, false)
      )
    );
    
    if (resetToken && new Date(resetToken.expiresAt) > now) {
      return resetToken;
    }
    return undefined;
  }

  async markPasswordResetTokenAsUsed(id: string): Promise<void> {
    await db.update(passwordResetTokens).set({ isUsed: true }).where(eq(passwordResetTokens.id, id));
  }

  async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();
    await db.delete(passwordResetTokens).where(lt(passwordResetTokens.expiresAt, now));
  }
}

export const storage = new DatabaseStorage();
