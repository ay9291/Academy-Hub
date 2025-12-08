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
} from "../../shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, lt } from "drizzle-orm";

export const storage = {
  // Users
  async getUser(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  },

  async getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  },

  async getUserByRegistrationNumber(registrationNumber: string) {
    const [user] = await db.select().from(users).where(eq(users.registrationNumber, registrationNumber));
    return user;
  },

  async upsertUser(userData: any) {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          role: userData.role,
          registrationNumber: userData.registrationNumber,
          passwordHash: userData.passwordHash,
          phone: userData.phone,
        },
      })
      .returning();
    return user;
  },

  async updateUserPassword(userId: string, passwordHash: string) {
    await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
  },

  async updateUserProfile(userId: string, data: { firstName?: string; lastName?: string; profileImageUrl?: string }) {
    const [user] = await db.update(users).set(data).where(eq(users.id, userId)).returning();
    return user;
  },

  async updateUserRole(id: string, role: "admin" | "teacher" | "parent" | "student") {
    const [user] = await db.update(users).set({ role }).where(eq(users.id, id)).returning();
    return user;
  },

  // OTP Codes
  async createOtpCode(data: { registrationNumber: string; code: string; expiresAt: Date }) {
    const [otp] = await db.insert(otpCodes).values({
      registrationNumber: data.registrationNumber,
      code: data.code,
      expiresAt: data.expiresAt,
      used: false,
    }).returning();
    return otp;
  },

  async getValidOtpCode(registrationNumber: string, code: string) {
    const [otp] = await db
      .select()
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.registrationNumber, registrationNumber),
          eq(otpCodes.code, code),
          eq(otpCodes.used, false)
        )
      );
    if (otp && new Date(otp.expiresAt) > new Date()) {
      return otp;
    }
    return null;
  },

  async markOtpAsUsed(id: string) {
    await db.update(otpCodes).set({ used: true }).where(eq(otpCodes.id, id));
  },

  // Password Reset Tokens
  async createPasswordResetToken(data: { userId: string; token: string; expiresAt: Date }) {
    const [token] = await db.insert(passwordResetTokens).values({
      userId: data.userId,
      token: data.token,
      expiresAt: data.expiresAt,
      used: false,
    }).returning();
    return token;
  },

  async getValidPasswordResetToken(token: string) {
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(and(eq(passwordResetTokens.token, token), eq(passwordResetTokens.used, false)));
    if (resetToken && new Date(resetToken.expiresAt) > new Date()) {
      return resetToken;
    }
    return null;
  },

  async markPasswordResetTokenAsUsed(id: string) {
    await db.update(passwordResetTokens).set({ used: true }).where(eq(passwordResetTokens.id, id));
  },

  // Registration Numbers
  async generateRegistrationNumber(role: "student" | "teacher") {
    const prefix = role === "student" ? "STU" : "TEA";
    const year = new Date().getFullYear().toString().slice(-2);

    const [counter] = await db
      .insert(registrationCounters)
      .values({ prefix: `${prefix}${year}`, lastNumber: 1 })
      .onConflictDoUpdate({
        target: registrationCounters.prefix,
        set: { lastNumber: sql`${registrationCounters.lastNumber} + 1` },
      })
      .returning();

    return `${prefix}${year}${counter.lastNumber.toString().padStart(4, "0")}`;
  },

  // Students
  async getStudents() {
    return db.select().from(students).orderBy(desc(students.id));
  },

  async getStudent(id: string) {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student;
  },

  async getStudentsByParent(parentId: string) {
    return db.select().from(students).where(eq(students.parentUserId, parentId));
  },

  async createStudent(data: any) {
    const [student] = await db.insert(students).values(data).returning();
    return student;
  },

  async updateStudent(id: string, data: any) {
    const [student] = await db.update(students).set(data).where(eq(students.id, id)).returning();
    return student;
  },

  async deleteStudent(id: string) {
    await db.delete(students).where(eq(students.id, id));
  },

  // Teachers
  async getTeachers() {
    return db.select().from(teachers).orderBy(desc(teachers.id));
  },

  async getTeacher(id: string) {
    const [teacher] = await db.select().from(teachers).where(eq(teachers.id, id));
    return teacher;
  },

  async getTeacherByUserId(userId: string) {
    const [teacher] = await db.select().from(teachers).where(eq(teachers.userId, userId));
    return teacher;
  },

  async createTeacher(data: any) {
    const [teacher] = await db.insert(teachers).values(data).returning();
    return teacher;
  },

  async updateTeacher(id: string, data: any) {
    const [teacher] = await db.update(teachers).set(data).where(eq(teachers.id, id)).returning();
    return teacher;
  },

  async deleteTeacher(id: string) {
    await db.delete(teachers).where(eq(teachers.id, id));
  },

  // Subjects
  async getSubjects() {
    return db.select().from(subjects).orderBy(subjects.name);
  },

  async getSubject(id: string) {
    const [subject] = await db.select().from(subjects).where(eq(subjects.id, id));
    return subject;
  },

  async createSubject(data: any) {
    const [subject] = await db.insert(subjects).values(data).returning();
    return subject;
  },

  async updateSubject(id: string, data: any) {
    const [subject] = await db.update(subjects).set(data).where(eq(subjects.id, id)).returning();
    return subject;
  },

  async deleteSubject(id: string) {
    await db.delete(subjects).where(eq(subjects.id, id));
  },

  // Batches
  async getBatches() {
    return db.select().from(batches).orderBy(batches.name);
  },

  async getBatch(id: string) {
    const [batch] = await db.select().from(batches).where(eq(batches.id, id));
    return batch;
  },

  async createBatch(data: any) {
    const [batch] = await db.insert(batches).values(data).returning();
    return batch;
  },

  async updateBatch(id: string, data: any) {
    const [batch] = await db.update(batches).set(data).where(eq(batches.id, id)).returning();
    return batch;
  },

  async deleteBatch(id: string) {
    await db.delete(batches).where(eq(batches.id, id));
  },

  // Batch Teachers
  async getBatchTeachers(batchId: string) {
    return db.select().from(batchTeachers).where(eq(batchTeachers.batchId, batchId));
  },

  async getBatchesByTeacher(teacherId: string) {
    return db.select().from(batchTeachers).where(eq(batchTeachers.teacherId, teacherId));
  },

  async assignTeacherToBatch(data: any) {
    const [assignment] = await db.insert(batchTeachers).values(data).returning();
    return assignment;
  },

  async removeTeacherFromBatch(id: string) {
    await db.delete(batchTeachers).where(eq(batchTeachers.id, id));
  },

  // Batch Students
  async getBatchStudents(batchId: string) {
    return db.select().from(batchStudents).where(eq(batchStudents.batchId, batchId));
  },

  async getStudentBatches(studentId: string) {
    return db.select().from(batchStudents).where(eq(batchStudents.studentId, studentId));
  },

  async enrollStudentInBatch(data: any) {
    const [enrollment] = await db.insert(batchStudents).values(data).returning();
    return enrollment;
  },

  async removeStudentFromBatch(id: string) {
    await db.delete(batchStudents).where(eq(batchStudents.id, id));
  },

  // Attendance
  async getAttendance(filters: { batchId?: string; studentId?: string; date?: string }) {
    let query = db.select().from(attendance);
    const conditions = [];
    if (filters.batchId) conditions.push(eq(attendance.batchId, filters.batchId));
    if (filters.studentId) conditions.push(eq(attendance.studentId, filters.studentId));
    if (filters.date) conditions.push(eq(attendance.date, filters.date));
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    return query.orderBy(desc(attendance.date));
  },

  async createAttendance(data: any) {
    const [record] = await db.insert(attendance).values(data).returning();
    return record;
  },

  async updateAttendance(id: string, data: any) {
    const [record] = await db.update(attendance).set(data).where(eq(attendance.id, id)).returning();
    return record;
  },

  async bulkCreateAttendance(records: any[]) {
    return db.insert(attendance).values(records).returning();
  },

  // Homework
  async getHomework(filters?: { batchId?: string; teacherId?: string }) {
    let query = db.select().from(homework);
    const conditions = [];
    if (filters?.batchId) conditions.push(eq(homework.batchId, filters.batchId));
    if (filters?.teacherId) conditions.push(eq(homework.assignedBy, filters.teacherId));
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    return query.orderBy(desc(homework.dueDate));
  },

  async getHomeworkById(id: string) {
    const [hw] = await db.select().from(homework).where(eq(homework.id, id));
    return hw;
  },

  async createHomework(data: any) {
    const [hw] = await db.insert(homework).values(data).returning();
    return hw;
  },

  async updateHomework(id: string, data: any) {
    const [hw] = await db.update(homework).set(data).where(eq(homework.id, id)).returning();
    return hw;
  },

  async deleteHomework(id: string) {
    await db.delete(homework).where(eq(homework.id, id));
  },

  // Homework Submissions
  async getHomeworkSubmissions(homeworkId: string) {
    return db.select().from(homeworkSubmissions).where(eq(homeworkSubmissions.homeworkId, homeworkId));
  },

  async getStudentSubmissions(studentId: string) {
    return db.select().from(homeworkSubmissions).where(eq(homeworkSubmissions.studentId, studentId));
  },

  async createHomeworkSubmission(data: any) {
    const [submission] = await db.insert(homeworkSubmissions).values(data).returning();
    return submission;
  },

  async updateHomeworkSubmission(id: string, data: any) {
    const [submission] = await db.update(homeworkSubmissions).set(data).where(eq(homeworkSubmissions.id, id)).returning();
    return submission;
  },

  // Fee Structures
  async getFeeStructures(studentId?: string) {
    if (studentId) {
      return db.select().from(feeStructures).where(eq(feeStructures.studentId, studentId));
    }
    return db.select().from(feeStructures);
  },

  async createFeeStructure(data: any) {
    const [feeStructure] = await db.insert(feeStructures).values(data).returning();
    return feeStructure;
  },

  async updateFeeStructure(id: string, data: any) {
    const [feeStructure] = await db.update(feeStructures).set(data).where(eq(feeStructures.id, id)).returning();
    return feeStructure;
  },

  // Fee Payments
  async getFeePayments(filters?: { studentId?: string; feeStructureId?: string }) {
    let query = db.select().from(feePayments);
    const conditions = [];
    if (filters?.studentId) conditions.push(eq(feePayments.studentId, filters.studentId));
    if (filters?.feeStructureId) conditions.push(eq(feePayments.feeStructureId, filters.feeStructureId));
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    return query.orderBy(desc(feePayments.paymentDate));
  },

  async createFeePayment(data: any) {
    const [payment] = await db.insert(feePayments).values(data).returning();
    return payment;
  },

  // Tests
  async getTests(filters?: { batchId?: string; teacherId?: string }) {
    let query = db.select().from(tests);
    const conditions = [];
    if (filters?.batchId) conditions.push(eq(tests.batchId, filters.batchId));
    if (filters?.teacherId) conditions.push(eq(tests.createdBy, filters.teacherId));
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    return query.orderBy(desc(tests.testDate));
  },

  async getTest(id: string) {
    const [test] = await db.select().from(tests).where(eq(tests.id, id));
    return test;
  },

  async createTest(data: any) {
    const [test] = await db.insert(tests).values(data).returning();
    return test;
  },

  async updateTest(id: string, data: any) {
    const [test] = await db.update(tests).set(data).where(eq(tests.id, id)).returning();
    return test;
  },

  async deleteTest(id: string) {
    await db.delete(tests).where(eq(tests.id, id));
  },

  // Test Results
  async getTestResults(testId: string) {
    return db.select().from(testResults).where(eq(testResults.testId, testId));
  },

  async getStudentResults(studentId: string) {
    return db.select().from(testResults).where(eq(testResults.studentId, studentId));
  },

  async createTestResult(data: any) {
    const [result] = await db.insert(testResults).values(data).returning();
    return result;
  },

  async updateTestResult(id: string, data: any) {
    const [result] = await db.update(testResults).set(data).where(eq(testResults.id, id)).returning();
    return result;
  },

  async bulkCreateTestResults(results: any[]) {
    return db.insert(testResults).values(results).returning();
  },

  // Study Materials
  async getStudyMaterials(filters?: { subjectId?: string; academicCategory?: string }) {
    let query = db.select().from(studyMaterials);
    const conditions = [];
    if (filters?.subjectId) conditions.push(eq(studyMaterials.subjectId, filters.subjectId));
    if (filters?.academicCategory) conditions.push(eq(studyMaterials.academicCategory, filters.academicCategory));
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    return query.orderBy(desc(studyMaterials.uploadedAt));
  },

  async createStudyMaterial(data: any) {
    const [material] = await db.insert(studyMaterials).values(data).returning();
    return material;
  },

  async deleteStudyMaterial(id: string) {
    await db.delete(studyMaterials).where(eq(studyMaterials.id, id));
  },

  // Complaints
  async getComplaints(filters?: { raisedBy?: string; status?: string }) {
    let query = db.select().from(complaints);
    const conditions = [];
    if (filters?.raisedBy) conditions.push(eq(complaints.raisedBy, filters.raisedBy));
    if (filters?.status) conditions.push(eq(complaints.status, filters.status));
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    return query.orderBy(desc(complaints.createdAt));
  },

  async getComplaint(id: string) {
    const [complaint] = await db.select().from(complaints).where(eq(complaints.id, id));
    return complaint;
  },

  async createComplaint(data: any) {
    const [complaint] = await db.insert(complaints).values(data).returning();
    return complaint;
  },

  async updateComplaint(id: string, data: any) {
    const [complaint] = await db.update(complaints).set(data).where(eq(complaints.id, id)).returning();
    return complaint;
  },

  // Complaint Responses
  async getComplaintResponses(complaintId: string) {
    return db.select().from(complaintResponses).where(eq(complaintResponses.complaintId, complaintId));
  },

  async createComplaintResponse(data: any) {
    const [response] = await db.insert(complaintResponses).values(data).returning();
    return response;
  },

  // Logbook
  async getLogbookEntries(filters?: { batchId?: string; teacherId?: string; date?: string }) {
    let query = db.select().from(logbookEntries);
    const conditions = [];
    if (filters?.batchId) conditions.push(eq(logbookEntries.batchId, filters.batchId));
    if (filters?.teacherId) conditions.push(eq(logbookEntries.teacherId, filters.teacherId));
    if (filters?.date) conditions.push(eq(logbookEntries.date, filters.date));
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    return query.orderBy(desc(logbookEntries.date));
  },

  async createLogbookEntry(data: any) {
    const [entry] = await db.insert(logbookEntries).values(data).returning();
    return entry;
  },

  async updateLogbookEntry(id: string, data: any) {
    const [entry] = await db.update(logbookEntries).set(data).where(eq(logbookEntries.id, id)).returning();
    return entry;
  },

  // Assets
  async getAssets() {
    return db.select().from(assets).orderBy(assets.name);
  },

  async getAsset(id: string) {
    const [asset] = await db.select().from(assets).where(eq(assets.id, id));
    return asset;
  },

  async createAsset(data: any) {
    const [asset] = await db.insert(assets).values(data).returning();
    return asset;
  },

  async updateAsset(id: string, data: any) {
    const [asset] = await db.update(assets).set(data).where(eq(assets.id, id)).returning();
    return asset;
  },

  async deleteAsset(id: string) {
    await db.delete(assets).where(eq(assets.id, id));
  },

  // Library Books
  async getLibraryBooks() {
    return db.select().from(libraryBooks).orderBy(libraryBooks.title);
  },

  async getLibraryBook(id: string) {
    const [book] = await db.select().from(libraryBooks).where(eq(libraryBooks.id, id));
    return book;
  },

  async createLibraryBook(data: any) {
    const [book] = await db.insert(libraryBooks).values(data).returning();
    return book;
  },

  async updateLibraryBook(id: string, data: any) {
    const [book] = await db.update(libraryBooks).set(data).where(eq(libraryBooks.id, id)).returning();
    return book;
  },

  async deleteLibraryBook(id: string) {
    await db.delete(libraryBooks).where(eq(libraryBooks.id, id));
  },

  // Book Issues
  async getBookIssues(filters?: { bookId?: string; studentId?: string; status?: string }) {
    let query = db.select().from(bookIssues);
    const conditions = [];
    if (filters?.bookId) conditions.push(eq(bookIssues.bookId, filters.bookId));
    if (filters?.studentId) conditions.push(eq(bookIssues.studentId, filters.studentId));
    if (filters?.status) conditions.push(eq(bookIssues.status, filters.status));
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    return query.orderBy(desc(bookIssues.issueDate));
  },

  async createBookIssue(data: any) {
    const [issue] = await db.insert(bookIssues).values(data).returning();
    return issue;
  },

  async updateBookIssue(id: string, data: any) {
    const [issue] = await db.update(bookIssues).set(data).where(eq(bookIssues.id, id)).returning();
    return issue;
  },

  // Lost and Found
  async getLostAndFoundItems(status?: string) {
    let query = db.select().from(lostAndFound);
    if (status) {
      query = query.where(eq(lostAndFound.status, status)) as any;
    }
    return query.orderBy(desc(lostAndFound.reportedAt));
  },

  async createLostAndFoundItem(data: any) {
    const [item] = await db.insert(lostAndFound).values(data).returning();
    return item;
  },

  async updateLostAndFoundItem(id: string, data: any) {
    const [item] = await db.update(lostAndFound).set(data).where(eq(lostAndFound.id, id)).returning();
    return item;
  },

  // Certificates
  async getCertificates(studentId?: string) {
    if (studentId) {
      return db.select().from(certificates).where(eq(certificates.studentId, studentId));
    }
    return db.select().from(certificates).orderBy(desc(certificates.issuedAt));
  },

  async createCertificate(data: any) {
    const [cert] = await db.insert(certificates).values(data).returning();
    return cert;
  },

  // Dashboard Stats
  async getDashboardStats() {
    const [studentCount] = await db.select({ count: sql<number>`count(*)` }).from(students);
    const [teacherCount] = await db.select({ count: sql<number>`count(*)` }).from(teachers);
    const [batchCount] = await db.select({ count: sql<number>`count(*)` }).from(batches);
    const [subjectCount] = await db.select({ count: sql<number>`count(*)` }).from(subjects);

    return {
      totalStudents: Number(studentCount?.count || 0),
      totalTeachers: Number(teacherCount?.count || 0),
      totalBatches: Number(batchCount?.count || 0),
      totalSubjects: Number(subjectCount?.count || 0),
    };
  },
};
