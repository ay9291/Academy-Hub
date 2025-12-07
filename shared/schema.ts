import { sql, relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  date,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["admin", "teacher", "parent", "student"]);
export const academicCategoryEnum = pgEnum("academic_category", ["class_11", "class_12", "jee", "neet"]);
export const attendanceStatusEnum = pgEnum("attendance_status", ["present", "absent", "late"]);
export const feeStatusEnum = pgEnum("fee_status", ["paid", "pending", "overdue", "partial"]);
export const homeworkStatusEnum = pgEnum("homework_status", ["pending", "completed", "late"]);
export const complaintStatusEnum = pgEnum("complaint_status", ["open", "in_progress", "resolved", "closed"]);
export const testTypeEnum = pgEnum("test_type", ["unit", "weekly", "monthly", "mock", "practice"]);
export const studentTagEnum = pgEnum("student_tag", ["top_performer", "needs_mentoring", "at_risk", "average", "improving"]);
export const assetStatusEnum = pgEnum("asset_status", ["available", "in_use", "maintenance", "retired"]);
export const bookStatusEnum = pgEnum("book_status", ["available", "issued", "lost", "damaged"]);
export const lostFoundStatusEnum = pgEnum("lost_found_status", ["lost", "found", "claimed", "unclaimed"]);

// Session storage table
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table with custom authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  registrationNumber: varchar("registration_number").unique(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  username: varchar("username"),
  passwordHash: varchar("password_hash"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default("parent").notNull(),
  phone: varchar("phone"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// OTP table for authentication
export const otpCodes = pgTable("otp_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  registrationNumber: varchar("registration_number").notNull(),
  code: varchar("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Password reset tokens table
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  token: varchar("token").unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Registration number counter table for auto-generation
export const registrationCounters = pgTable("registration_counters", {
  id: varchar("id").primaryKey(),
  counterType: varchar("counter_type").unique().notNull(),
  lastNumber: integer("last_number").default(0).notNull(),
});

// Students table
export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  enrollmentNumber: varchar("enrollment_number").unique().notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  dateOfBirth: date("date_of_birth"),
  gender: varchar("gender"),
  address: text("address"),
  phone: varchar("phone"),
  email: varchar("email"),
  academicCategory: academicCategoryEnum("academic_category").notNull(),
  parentId: varchar("parent_id").references(() => users.id),
  parentName: varchar("parent_name"),
  parentPhone: varchar("parent_phone"),
  parentEmail: varchar("parent_email"),
  profileImageUrl: varchar("profile_image_url"),
  tag: studentTagEnum("tag").default("average"),
  isActive: boolean("is_active").default(true).notNull(),
  joinDate: date("join_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Teachers table
export const teachers = pgTable("teachers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  employeeId: varchar("employee_id").unique().notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email"),
  phone: varchar("phone"),
  subjects: text("subjects").array(),
  qualification: varchar("qualification"),
  experience: integer("experience"),
  profileImageUrl: varchar("profile_image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  joinDate: date("join_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Subjects table
export const subjects = pgTable("subjects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  code: varchar("code").unique().notNull(),
  description: text("description"),
  academicCategory: academicCategoryEnum("academic_category").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Batches table
export const batches = pgTable("batches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  academicCategory: academicCategoryEnum("academic_category").notNull(),
  room: varchar("room"),
  capacity: integer("capacity").default(30),
  startTime: varchar("start_time"),
  endTime: varchar("end_time"),
  days: text("days").array(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Batch-Teacher assignments
export const batchTeachers = pgTable("batch_teachers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  batchId: varchar("batch_id").references(() => batches.id).notNull(),
  teacherId: varchar("teacher_id").references(() => teachers.id).notNull(),
  subjectId: varchar("subject_id").references(() => subjects.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Batch-Student assignments
export const batchStudents = pgTable("batch_students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  batchId: varchar("batch_id").references(() => batches.id).notNull(),
  studentId: varchar("student_id").references(() => students.id).notNull(),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
});

// Attendance table
export const attendance = pgTable("attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => students.id).notNull(),
  batchId: varchar("batch_id").references(() => batches.id).notNull(),
  subjectId: varchar("subject_id").references(() => subjects.id),
  date: date("date").notNull(),
  status: attendanceStatusEnum("status").notNull(),
  reason: text("reason"),
  markedBy: varchar("marked_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Homework table
export const homework = pgTable("homework", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  batchId: varchar("batch_id").references(() => batches.id).notNull(),
  subjectId: varchar("subject_id").references(() => subjects.id).notNull(),
  teacherId: varchar("teacher_id").references(() => teachers.id).notNull(),
  dueDate: date("due_date").notNull(),
  isMandatory: boolean("is_mandatory").default(true),
  attachments: text("attachments").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Homework submissions
export const homeworkSubmissions = pgTable("homework_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  homeworkId: varchar("homework_id").references(() => homework.id).notNull(),
  studentId: varchar("student_id").references(() => students.id).notNull(),
  status: homeworkStatusEnum("status").default("pending").notNull(),
  submittedAt: timestamp("submitted_at"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Fee structure table
export const feeStructures = pgTable("fee_structures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => students.id).notNull(),
  academicYear: varchar("academic_year").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: date("due_date").notNull(),
  installments: integer("installments").default(1),
  penaltyPercentage: decimal("penalty_percentage", { precision: 5, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Fee payments table
export const feePayments = pgTable("fee_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  feeStructureId: varchar("fee_structure_id").references(() => feeStructures.id).notNull(),
  studentId: varchar("student_id").references(() => students.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: date("payment_date").notNull(),
  paymentMethod: varchar("payment_method"),
  receiptNumber: varchar("receipt_number").unique(),
  remarks: text("remarks"),
  recordedBy: varchar("recorded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tests table
export const tests = pgTable("tests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  batchId: varchar("batch_id").references(() => batches.id).notNull(),
  subjectId: varchar("subject_id").references(() => subjects.id).notNull(),
  teacherId: varchar("teacher_id").references(() => teachers.id),
  testType: testTypeEnum("test_type").notNull(),
  testDate: date("test_date").notNull(),
  totalMarks: integer("total_marks").notNull(),
  passingMarks: integer("passing_marks"),
  negativeMarking: boolean("negative_marking").default(false),
  negativeMarkValue: decimal("negative_mark_value", { precision: 3, scale: 2 }),
  duration: integer("duration"),
  attachments: text("attachments").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Test results table
export const testResults = pgTable("test_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  testId: varchar("test_id").references(() => tests.id).notNull(),
  studentId: varchar("student_id").references(() => students.id).notNull(),
  marksObtained: decimal("marks_obtained", { precision: 6, scale: 2 }).notNull(),
  rank: integer("rank"),
  percentage: decimal("percentage", { precision: 5, scale: 2 }),
  correctedSheetUrl: varchar("corrected_sheet_url"),
  remarks: text("remarks"),
  enteredBy: varchar("entered_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Study materials table
export const studyMaterials = pgTable("study_materials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  subjectId: varchar("subject_id").references(() => subjects.id).notNull(),
  academicCategory: academicCategoryEnum("academic_category").notNull(),
  materialType: varchar("material_type").notNull(),
  fileUrl: varchar("file_url"),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Complaints table
export const complaints = pgTable("complaints", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category"),
  raisedBy: varchar("raised_by").references(() => users.id).notNull(),
  studentId: varchar("student_id").references(() => students.id),
  status: complaintStatusEnum("status").default("open").notNull(),
  assignedTo: varchar("assigned_to").references(() => users.id),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Complaint responses
export const complaintResponses = pgTable("complaint_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  complaintId: varchar("complaint_id").references(() => complaints.id).notNull(),
  respondedBy: varchar("responded_by").references(() => users.id).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Logbook entries
export const logbookEntries = pgTable("logbook_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  batchId: varchar("batch_id").references(() => batches.id).notNull(),
  subjectId: varchar("subject_id").references(() => subjects.id).notNull(),
  teacherId: varchar("teacher_id").references(() => teachers.id).notNull(),
  date: date("date").notNull(),
  topicsTaught: text("topics_taught").notNull(),
  homeworkAssigned: text("homework_assigned"),
  testUpdates: text("test_updates"),
  remarks: text("remarks"),
  lectureStatus: varchar("lecture_status").default("completed"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Assets table
export const assets = pgTable("assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  category: varchar("category").notNull(),
  assetCode: varchar("asset_code").unique().notNull(),
  location: varchar("location"),
  status: assetStatusEnum("status").default("available").notNull(),
  purchaseDate: date("purchase_date"),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }),
  condition: varchar("condition"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Library books table
export const libraryBooks = pgTable("library_books", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  author: varchar("author"),
  isbn: varchar("isbn").unique(),
  category: varchar("category"),
  location: varchar("location"),
  status: bookStatusEnum("status").default("available").notNull(),
  totalCopies: integer("total_copies").default(1),
  availableCopies: integer("available_copies").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// Book issues table
export const bookIssues = pgTable("book_issues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookId: varchar("book_id").references(() => libraryBooks.id).notNull(),
  studentId: varchar("student_id").references(() => students.id).notNull(),
  issueDate: date("issue_date").notNull(),
  dueDate: date("due_date").notNull(),
  returnDate: date("return_date"),
  fine: decimal("fine", { precision: 8, scale: 2 }),
  status: varchar("status").default("issued"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Lost and found table
export const lostAndFound = pgTable("lost_and_found", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemName: varchar("item_name").notNull(),
  description: text("description"),
  location: varchar("location"),
  reportedBy: varchar("reported_by").references(() => users.id),
  status: lostFoundStatusEnum("status").notNull(),
  reportedDate: date("reported_date").defaultNow(),
  claimedBy: varchar("claimed_by"),
  claimedDate: date("claimed_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Certificates table
export const certificates = pgTable("certificates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => students.id).notNull(),
  certificateType: varchar("certificate_type").notNull(),
  issueDate: date("issue_date").defaultNow(),
  certificateNumber: varchar("certificate_number").unique().notNull(),
  fileUrl: varchar("file_url"),
  generatedBy: varchar("generated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  students: many(students, { relationName: "parentStudents" }),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  parent: one(users, { fields: [students.parentId], references: [users.id], relationName: "parentStudents" }),
  batchStudents: many(batchStudents),
  attendance: many(attendance),
  homeworkSubmissions: many(homeworkSubmissions),
  testResults: many(testResults),
  feeStructures: many(feeStructures),
  feePayments: many(feePayments),
}));

export const teachersRelations = relations(teachers, ({ one, many }) => ({
  user: one(users, { fields: [teachers.userId], references: [users.id] }),
  batchTeachers: many(batchTeachers),
  homework: many(homework),
  tests: many(tests),
  logbookEntries: many(logbookEntries),
}));

export const batchesRelations = relations(batches, ({ many }) => ({
  batchTeachers: many(batchTeachers),
  batchStudents: many(batchStudents),
  attendance: many(attendance),
  homework: many(homework),
  tests: many(tests),
  logbookEntries: many(logbookEntries),
}));

export const subjectsRelations = relations(subjects, ({ many }) => ({
  batchTeachers: many(batchTeachers),
  attendance: many(attendance),
  homework: many(homework),
  tests: many(tests),
  studyMaterials: many(studyMaterials),
  logbookEntries: many(logbookEntries),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertStudentSchema = createInsertSchema(students).omit({ id: true, createdAt: true, updatedAt: true, enrollmentNumber: true });
export const insertTeacherSchema = createInsertSchema(teachers).omit({ id: true, createdAt: true, updatedAt: true, employeeId: true });
export const insertOtpCodeSchema = createInsertSchema(otpCodes).omit({ id: true, createdAt: true });
export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({ id: true, createdAt: true });
export const insertSubjectSchema = createInsertSchema(subjects).omit({ id: true, createdAt: true });
export const insertBatchSchema = createInsertSchema(batches).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAttendanceSchema = createInsertSchema(attendance).omit({ id: true, createdAt: true });
export const insertHomeworkSchema = createInsertSchema(homework).omit({ id: true, createdAt: true, updatedAt: true });
export const insertHomeworkSubmissionSchema = createInsertSchema(homeworkSubmissions).omit({ id: true, createdAt: true });
export const insertFeeStructureSchema = createInsertSchema(feeStructures).omit({ id: true, createdAt: true });
export const insertFeePaymentSchema = createInsertSchema(feePayments).omit({ id: true, createdAt: true });
export const insertTestSchema = createInsertSchema(tests).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTestResultSchema = createInsertSchema(testResults).omit({ id: true, createdAt: true });
export const insertStudyMaterialSchema = createInsertSchema(studyMaterials).omit({ id: true, createdAt: true });
export const insertComplaintSchema = createInsertSchema(complaints).omit({ id: true, createdAt: true, updatedAt: true });
export const insertComplaintResponseSchema = createInsertSchema(complaintResponses).omit({ id: true, createdAt: true });
export const insertLogbookEntrySchema = createInsertSchema(logbookEntries).omit({ id: true, createdAt: true });
export const insertAssetSchema = createInsertSchema(assets).omit({ id: true, createdAt: true, updatedAt: true });
export const insertLibraryBookSchema = createInsertSchema(libraryBooks).omit({ id: true, createdAt: true });
export const insertBookIssueSchema = createInsertSchema(bookIssues).omit({ id: true, createdAt: true });
export const insertLostAndFoundSchema = createInsertSchema(lostAndFound).omit({ id: true, createdAt: true });
export const insertCertificateSchema = createInsertSchema(certificates).omit({ id: true, createdAt: true });
export const insertBatchTeacherSchema = createInsertSchema(batchTeachers).omit({ id: true, createdAt: true });
export const insertBatchStudentSchema = createInsertSchema(batchStudents).omit({ id: true, enrolledAt: true });

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;
export type Teacher = typeof teachers.$inferSelect;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type Subject = typeof subjects.$inferSelect;
export type InsertBatch = z.infer<typeof insertBatchSchema>;
export type Batch = typeof batches.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Attendance = typeof attendance.$inferSelect;
export type InsertHomework = z.infer<typeof insertHomeworkSchema>;
export type Homework = typeof homework.$inferSelect;
export type InsertHomeworkSubmission = z.infer<typeof insertHomeworkSubmissionSchema>;
export type HomeworkSubmission = typeof homeworkSubmissions.$inferSelect;
export type InsertFeeStructure = z.infer<typeof insertFeeStructureSchema>;
export type FeeStructure = typeof feeStructures.$inferSelect;
export type InsertFeePayment = z.infer<typeof insertFeePaymentSchema>;
export type FeePayment = typeof feePayments.$inferSelect;
export type InsertTest = z.infer<typeof insertTestSchema>;
export type Test = typeof tests.$inferSelect;
export type InsertTestResult = z.infer<typeof insertTestResultSchema>;
export type TestResult = typeof testResults.$inferSelect;
export type InsertStudyMaterial = z.infer<typeof insertStudyMaterialSchema>;
export type StudyMaterial = typeof studyMaterials.$inferSelect;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
export type Complaint = typeof complaints.$inferSelect;
export type InsertComplaintResponse = z.infer<typeof insertComplaintResponseSchema>;
export type ComplaintResponse = typeof complaintResponses.$inferSelect;
export type InsertLogbookEntry = z.infer<typeof insertLogbookEntrySchema>;
export type LogbookEntry = typeof logbookEntries.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type Asset = typeof assets.$inferSelect;
export type InsertLibraryBook = z.infer<typeof insertLibraryBookSchema>;
export type LibraryBook = typeof libraryBooks.$inferSelect;
export type InsertBookIssue = z.infer<typeof insertBookIssueSchema>;
export type BookIssue = typeof bookIssues.$inferSelect;
export type InsertLostAndFound = z.infer<typeof insertLostAndFoundSchema>;
export type LostAndFound = typeof lostAndFound.$inferSelect;
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type Certificate = typeof certificates.$inferSelect;
export type InsertBatchTeacher = z.infer<typeof insertBatchTeacherSchema>;
export type BatchTeacher = typeof batchTeachers.$inferSelect;
export type InsertBatchStudent = z.infer<typeof insertBatchStudentSchema>;
export type BatchStudent = typeof batchStudents.$inferSelect;
export type InsertOtpCode = z.infer<typeof insertOtpCodeSchema>;
export type OtpCode = typeof otpCodes.$inferSelect;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type RegistrationCounter = typeof registrationCounters.$inferSelect;
