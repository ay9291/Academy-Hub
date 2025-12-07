import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, createUserWithRegistrationNumber } from "./customAuth";
import bcrypt from "bcryptjs";
import {
  insertStudentSchema,
  insertTeacherSchema,
  insertSubjectSchema,
  insertBatchSchema,
  insertBatchTeacherSchema,
  insertBatchStudentSchema,
  insertAttendanceSchema,
  insertHomeworkSchema,
  insertHomeworkSubmissionSchema,
  insertFeeStructureSchema,
  insertFeePaymentSchema,
  insertTestSchema,
  insertTestResultSchema,
  insertStudyMaterialSchema,
  insertComplaintSchema,
  insertComplaintResponseSchema,
  insertLogbookEntrySchema,
  insertAssetSchema,
  insertLibraryBookSchema,
  insertBookIssueSchema,
  insertLostAndFoundSchema,
  insertCertificateSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Students CRUD
  app.get("/api/students", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role === "parent") {
        const students = await storage.getStudentsByParent(user.id);
        return res.json(students);
      }
      const students = await storage.getStudents();
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.get("/api/students/:id", isAuthenticated, async (req, res) => {
    try {
      const student = await storage.getStudent(req.params.id);
      if (!student) return res.status(404).json({ message: "Student not found" });
      res.json(student);
    } catch (error) {
      console.error("Error fetching student:", error);
      res.status(500).json({ message: "Failed to fetch student" });
    }
  });

  app.post("/api/students", isAuthenticated, async (req, res) => {
    try {
      const data = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(data);
      res.status(201).json(student);
    } catch (error) {
      console.error("Error creating student:", error);
      res.status(400).json({ message: "Failed to create student", error });
    }
  });

  app.patch("/api/students/:id", isAuthenticated, async (req, res) => {
    try {
      const student = await storage.updateStudent(req.params.id, req.body);
      if (!student) return res.status(404).json({ message: "Student not found" });
      res.json(student);
    } catch (error) {
      console.error("Error updating student:", error);
      res.status(400).json({ message: "Failed to update student" });
    }
  });

  app.delete("/api/students/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteStudent(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting student:", error);
      res.status(500).json({ message: "Failed to delete student" });
    }
  });

  // Teachers CRUD
  app.get("/api/teachers", isAuthenticated, async (req, res) => {
    try {
      const teachers = await storage.getTeachers();
      res.json(teachers);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      res.status(500).json({ message: "Failed to fetch teachers" });
    }
  });

  app.get("/api/teachers/:id", isAuthenticated, async (req, res) => {
    try {
      const teacher = await storage.getTeacher(req.params.id);
      if (!teacher) return res.status(404).json({ message: "Teacher not found" });
      res.json(teacher);
    } catch (error) {
      console.error("Error fetching teacher:", error);
      res.status(500).json({ message: "Failed to fetch teacher" });
    }
  });

  app.post("/api/teachers", isAuthenticated, async (req, res) => {
    try {
      const data = insertTeacherSchema.parse(req.body);
      const teacher = await storage.createTeacher(data);
      res.status(201).json(teacher);
    } catch (error) {
      console.error("Error creating teacher:", error);
      res.status(400).json({ message: "Failed to create teacher", error });
    }
  });

  app.patch("/api/teachers/:id", isAuthenticated, async (req, res) => {
    try {
      const teacher = await storage.updateTeacher(req.params.id, req.body);
      if (!teacher) return res.status(404).json({ message: "Teacher not found" });
      res.json(teacher);
    } catch (error) {
      console.error("Error updating teacher:", error);
      res.status(400).json({ message: "Failed to update teacher" });
    }
  });

  app.delete("/api/teachers/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteTeacher(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting teacher:", error);
      res.status(500).json({ message: "Failed to delete teacher" });
    }
  });

  // Teacher by user ID (for teacher role)
  app.get("/api/teachers/user/:userId", isAuthenticated, async (req, res) => {
    try {
      const teacher = await storage.getTeacherByUserId(req.params.userId);
      if (!teacher) return res.status(404).json({ message: "Teacher not found" });
      res.json(teacher);
    } catch (error) {
      console.error("Error fetching teacher by user:", error);
      res.status(500).json({ message: "Failed to fetch teacher" });
    }
  });

  // Subjects CRUD
  app.get("/api/subjects", isAuthenticated, async (req, res) => {
    try {
      const subjects = await storage.getSubjects();
      res.json(subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  app.get("/api/subjects/:id", isAuthenticated, async (req, res) => {
    try {
      const subject = await storage.getSubject(req.params.id);
      if (!subject) return res.status(404).json({ message: "Subject not found" });
      res.json(subject);
    } catch (error) {
      console.error("Error fetching subject:", error);
      res.status(500).json({ message: "Failed to fetch subject" });
    }
  });

  app.post("/api/subjects", isAuthenticated, async (req, res) => {
    try {
      const data = insertSubjectSchema.parse(req.body);
      const subject = await storage.createSubject(data);
      res.status(201).json(subject);
    } catch (error) {
      console.error("Error creating subject:", error);
      res.status(400).json({ message: "Failed to create subject", error });
    }
  });

  app.patch("/api/subjects/:id", isAuthenticated, async (req, res) => {
    try {
      const subject = await storage.updateSubject(req.params.id, req.body);
      if (!subject) return res.status(404).json({ message: "Subject not found" });
      res.json(subject);
    } catch (error) {
      console.error("Error updating subject:", error);
      res.status(400).json({ message: "Failed to update subject" });
    }
  });

  app.delete("/api/subjects/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteSubject(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting subject:", error);
      res.status(500).json({ message: "Failed to delete subject" });
    }
  });

  // Batches CRUD
  app.get("/api/batches", isAuthenticated, async (req, res) => {
    try {
      const batches = await storage.getBatches();
      res.json(batches);
    } catch (error) {
      console.error("Error fetching batches:", error);
      res.status(500).json({ message: "Failed to fetch batches" });
    }
  });

  app.get("/api/batches/:id", isAuthenticated, async (req, res) => {
    try {
      const batch = await storage.getBatch(req.params.id);
      if (!batch) return res.status(404).json({ message: "Batch not found" });
      res.json(batch);
    } catch (error) {
      console.error("Error fetching batch:", error);
      res.status(500).json({ message: "Failed to fetch batch" });
    }
  });

  app.post("/api/batches", isAuthenticated, async (req, res) => {
    try {
      const data = insertBatchSchema.parse(req.body);
      const batch = await storage.createBatch(data);
      res.status(201).json(batch);
    } catch (error) {
      console.error("Error creating batch:", error);
      res.status(400).json({ message: "Failed to create batch", error });
    }
  });

  app.patch("/api/batches/:id", isAuthenticated, async (req, res) => {
    try {
      const batch = await storage.updateBatch(req.params.id, req.body);
      if (!batch) return res.status(404).json({ message: "Batch not found" });
      res.json(batch);
    } catch (error) {
      console.error("Error updating batch:", error);
      res.status(400).json({ message: "Failed to update batch" });
    }
  });

  app.delete("/api/batches/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteBatch(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting batch:", error);
      res.status(500).json({ message: "Failed to delete batch" });
    }
  });

  // Batch Teachers
  app.get("/api/batches/:batchId/teachers", isAuthenticated, async (req, res) => {
    try {
      const batchTeachers = await storage.getBatchTeachers(req.params.batchId);
      res.json(batchTeachers);
    } catch (error) {
      console.error("Error fetching batch teachers:", error);
      res.status(500).json({ message: "Failed to fetch batch teachers" });
    }
  });

  app.post("/api/batch-teachers", isAuthenticated, async (req, res) => {
    try {
      const data = insertBatchTeacherSchema.parse(req.body);
      const assignment = await storage.assignTeacherToBatch(data);
      res.status(201).json(assignment);
    } catch (error) {
      console.error("Error assigning teacher to batch:", error);
      res.status(400).json({ message: "Failed to assign teacher to batch" });
    }
  });

  app.delete("/api/batch-teachers/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.removeTeacherFromBatch(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing teacher from batch:", error);
      res.status(500).json({ message: "Failed to remove teacher from batch" });
    }
  });

  // Teacher's batches
  app.get("/api/teachers/:teacherId/batches", isAuthenticated, async (req, res) => {
    try {
      const batches = await storage.getBatchesByTeacher(req.params.teacherId);
      res.json(batches);
    } catch (error) {
      console.error("Error fetching teacher batches:", error);
      res.status(500).json({ message: "Failed to fetch teacher batches" });
    }
  });

  // Batch Students
  app.get("/api/batches/:batchId/students", isAuthenticated, async (req, res) => {
    try {
      const batchStudents = await storage.getBatchStudents(req.params.batchId);
      res.json(batchStudents);
    } catch (error) {
      console.error("Error fetching batch students:", error);
      res.status(500).json({ message: "Failed to fetch batch students" });
    }
  });

  app.post("/api/batch-students", isAuthenticated, async (req, res) => {
    try {
      const data = insertBatchStudentSchema.parse(req.body);
      const enrollment = await storage.enrollStudentInBatch(data);
      res.status(201).json(enrollment);
    } catch (error) {
      console.error("Error enrolling student in batch:", error);
      res.status(400).json({ message: "Failed to enroll student in batch" });
    }
  });

  app.delete("/api/batch-students/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.removeStudentFromBatch(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing student from batch:", error);
      res.status(500).json({ message: "Failed to remove student from batch" });
    }
  });

  // Attendance
  app.get("/api/attendance", isAuthenticated, async (req, res) => {
    try {
      const { batchId, studentId, date } = req.query;
      const attendance = await storage.getAttendance({
        batchId: batchId as string,
        studentId: studentId as string,
        date: date as string,
      });
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.post("/api/attendance", isAuthenticated, async (req: any, res) => {
    try {
      const data = insertAttendanceSchema.parse({
        ...req.body,
        markedBy: req.user.claims.sub,
      });
      const record = await storage.createAttendance(data);
      res.status(201).json(record);
    } catch (error) {
      console.error("Error creating attendance:", error);
      res.status(400).json({ message: "Failed to create attendance" });
    }
  });

  app.post("/api/attendance/bulk", isAuthenticated, async (req: any, res) => {
    try {
      const records = req.body.map((r: any) => ({
        ...r,
        markedBy: req.user.claims.sub,
      }));
      const created = await storage.bulkCreateAttendance(records);
      res.status(201).json(created);
    } catch (error) {
      console.error("Error bulk creating attendance:", error);
      res.status(400).json({ message: "Failed to create attendance records" });
    }
  });

  app.patch("/api/attendance/:id", isAuthenticated, async (req, res) => {
    try {
      const record = await storage.updateAttendance(req.params.id, req.body);
      if (!record) return res.status(404).json({ message: "Attendance record not found" });
      res.json(record);
    } catch (error) {
      console.error("Error updating attendance:", error);
      res.status(400).json({ message: "Failed to update attendance" });
    }
  });

  // Homework
  app.get("/api/homework", isAuthenticated, async (req, res) => {
    try {
      const { batchId, teacherId } = req.query;
      const homework = await storage.getHomework({
        batchId: batchId as string,
        teacherId: teacherId as string,
      });
      res.json(homework);
    } catch (error) {
      console.error("Error fetching homework:", error);
      res.status(500).json({ message: "Failed to fetch homework" });
    }
  });

  app.get("/api/homework/:id", isAuthenticated, async (req, res) => {
    try {
      const homework = await storage.getHomeworkById(req.params.id);
      if (!homework) return res.status(404).json({ message: "Homework not found" });
      res.json(homework);
    } catch (error) {
      console.error("Error fetching homework:", error);
      res.status(500).json({ message: "Failed to fetch homework" });
    }
  });

  app.post("/api/homework", isAuthenticated, async (req, res) => {
    try {
      const data = insertHomeworkSchema.parse(req.body);
      const homework = await storage.createHomework(data);
      res.status(201).json(homework);
    } catch (error) {
      console.error("Error creating homework:", error);
      res.status(400).json({ message: "Failed to create homework" });
    }
  });

  app.patch("/api/homework/:id", isAuthenticated, async (req, res) => {
    try {
      const homework = await storage.updateHomework(req.params.id, req.body);
      if (!homework) return res.status(404).json({ message: "Homework not found" });
      res.json(homework);
    } catch (error) {
      console.error("Error updating homework:", error);
      res.status(400).json({ message: "Failed to update homework" });
    }
  });

  app.delete("/api/homework/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteHomework(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting homework:", error);
      res.status(500).json({ message: "Failed to delete homework" });
    }
  });

  // Homework Submissions
  app.get("/api/homework/:homeworkId/submissions", isAuthenticated, async (req, res) => {
    try {
      const submissions = await storage.getHomeworkSubmissions(req.params.homeworkId);
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching homework submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  app.get("/api/students/:studentId/submissions", isAuthenticated, async (req, res) => {
    try {
      const submissions = await storage.getStudentSubmissions(req.params.studentId);
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching student submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  app.post("/api/homework-submissions", isAuthenticated, async (req, res) => {
    try {
      const data = insertHomeworkSubmissionSchema.parse(req.body);
      const submission = await storage.createHomeworkSubmission(data);
      res.status(201).json(submission);
    } catch (error) {
      console.error("Error creating homework submission:", error);
      res.status(400).json({ message: "Failed to create submission" });
    }
  });

  app.patch("/api/homework-submissions/:id", isAuthenticated, async (req, res) => {
    try {
      const submission = await storage.updateHomeworkSubmission(req.params.id, req.body);
      if (!submission) return res.status(404).json({ message: "Submission not found" });
      res.json(submission);
    } catch (error) {
      console.error("Error updating homework submission:", error);
      res.status(400).json({ message: "Failed to update submission" });
    }
  });

  // Fee Structures
  app.get("/api/fee-structures", isAuthenticated, async (req, res) => {
    try {
      const { studentId } = req.query;
      const feeStructures = await storage.getFeeStructures(studentId as string);
      res.json(feeStructures);
    } catch (error) {
      console.error("Error fetching fee structures:", error);
      res.status(500).json({ message: "Failed to fetch fee structures" });
    }
  });

  app.post("/api/fee-structures", isAuthenticated, async (req, res) => {
    try {
      const data = insertFeeStructureSchema.parse(req.body);
      const feeStructure = await storage.createFeeStructure(data);
      res.status(201).json(feeStructure);
    } catch (error) {
      console.error("Error creating fee structure:", error);
      res.status(400).json({ message: "Failed to create fee structure" });
    }
  });

  app.patch("/api/fee-structures/:id", isAuthenticated, async (req, res) => {
    try {
      const feeStructure = await storage.updateFeeStructure(req.params.id, req.body);
      if (!feeStructure) return res.status(404).json({ message: "Fee structure not found" });
      res.json(feeStructure);
    } catch (error) {
      console.error("Error updating fee structure:", error);
      res.status(400).json({ message: "Failed to update fee structure" });
    }
  });

  // Fee Payments
  app.get("/api/fee-payments", isAuthenticated, async (req, res) => {
    try {
      const { studentId, feeStructureId } = req.query;
      const payments = await storage.getFeePayments({
        studentId: studentId as string,
        feeStructureId: feeStructureId as string,
      });
      res.json(payments);
    } catch (error) {
      console.error("Error fetching fee payments:", error);
      res.status(500).json({ message: "Failed to fetch fee payments" });
    }
  });

  app.post("/api/fee-payments", isAuthenticated, async (req: any, res) => {
    try {
      const data = insertFeePaymentSchema.parse({
        ...req.body,
        recordedBy: req.user.claims.sub,
      });
      const payment = await storage.createFeePayment(data);
      res.status(201).json(payment);
    } catch (error) {
      console.error("Error creating fee payment:", error);
      res.status(400).json({ message: "Failed to create fee payment" });
    }
  });

  // Tests
  app.get("/api/tests", isAuthenticated, async (req, res) => {
    try {
      const { batchId, teacherId } = req.query;
      const tests = await storage.getTests({
        batchId: batchId as string,
        teacherId: teacherId as string,
      });
      res.json(tests);
    } catch (error) {
      console.error("Error fetching tests:", error);
      res.status(500).json({ message: "Failed to fetch tests" });
    }
  });

  app.get("/api/tests/:id", isAuthenticated, async (req, res) => {
    try {
      const test = await storage.getTest(req.params.id);
      if (!test) return res.status(404).json({ message: "Test not found" });
      res.json(test);
    } catch (error) {
      console.error("Error fetching test:", error);
      res.status(500).json({ message: "Failed to fetch test" });
    }
  });

  app.post("/api/tests", isAuthenticated, async (req, res) => {
    try {
      const data = insertTestSchema.parse(req.body);
      const test = await storage.createTest(data);
      res.status(201).json(test);
    } catch (error) {
      console.error("Error creating test:", error);
      res.status(400).json({ message: "Failed to create test" });
    }
  });

  app.patch("/api/tests/:id", isAuthenticated, async (req, res) => {
    try {
      const test = await storage.updateTest(req.params.id, req.body);
      if (!test) return res.status(404).json({ message: "Test not found" });
      res.json(test);
    } catch (error) {
      console.error("Error updating test:", error);
      res.status(400).json({ message: "Failed to update test" });
    }
  });

  app.delete("/api/tests/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteTest(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting test:", error);
      res.status(500).json({ message: "Failed to delete test" });
    }
  });

  // Test Results
  app.get("/api/tests/:testId/results", isAuthenticated, async (req, res) => {
    try {
      const results = await storage.getTestResults(req.params.testId);
      res.json(results);
    } catch (error) {
      console.error("Error fetching test results:", error);
      res.status(500).json({ message: "Failed to fetch test results" });
    }
  });

  app.get("/api/students/:studentId/results", isAuthenticated, async (req, res) => {
    try {
      const results = await storage.getStudentResults(req.params.studentId);
      res.json(results);
    } catch (error) {
      console.error("Error fetching student results:", error);
      res.status(500).json({ message: "Failed to fetch student results" });
    }
  });

  app.post("/api/test-results", isAuthenticated, async (req: any, res) => {
    try {
      const data = insertTestResultSchema.parse({
        ...req.body,
        enteredBy: req.user.claims.sub,
      });
      const result = await storage.createTestResult(data);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating test result:", error);
      res.status(400).json({ message: "Failed to create test result" });
    }
  });

  app.post("/api/test-results/bulk", isAuthenticated, async (req: any, res) => {
    try {
      const results = req.body.map((r: any) => ({
        ...r,
        enteredBy: req.user.claims.sub,
      }));
      const created = await storage.bulkCreateTestResults(results);
      res.status(201).json(created);
    } catch (error) {
      console.error("Error bulk creating test results:", error);
      res.status(400).json({ message: "Failed to create test results" });
    }
  });

  app.patch("/api/test-results/:id", isAuthenticated, async (req, res) => {
    try {
      const result = await storage.updateTestResult(req.params.id, req.body);
      if (!result) return res.status(404).json({ message: "Test result not found" });
      res.json(result);
    } catch (error) {
      console.error("Error updating test result:", error);
      res.status(400).json({ message: "Failed to update test result" });
    }
  });

  // Study Materials
  app.get("/api/study-materials", isAuthenticated, async (req, res) => {
    try {
      const { subjectId, academicCategory } = req.query;
      const materials = await storage.getStudyMaterials({
        subjectId: subjectId as string,
        academicCategory: academicCategory as string,
      });
      res.json(materials);
    } catch (error) {
      console.error("Error fetching study materials:", error);
      res.status(500).json({ message: "Failed to fetch study materials" });
    }
  });

  app.post("/api/study-materials", isAuthenticated, async (req: any, res) => {
    try {
      const data = insertStudyMaterialSchema.parse({
        ...req.body,
        uploadedBy: req.user.claims.sub,
      });
      const material = await storage.createStudyMaterial(data);
      res.status(201).json(material);
    } catch (error) {
      console.error("Error creating study material:", error);
      res.status(400).json({ message: "Failed to create study material" });
    }
  });

  app.delete("/api/study-materials/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteStudyMaterial(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting study material:", error);
      res.status(500).json({ message: "Failed to delete study material" });
    }
  });

  // Complaints
  app.get("/api/complaints", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      const { status } = req.query;
      let filters: { raisedBy?: string; status?: string } = {};
      
      if (user?.role === "parent" || user?.role === "student") {
        filters.raisedBy = user.id;
      }
      if (status) filters.status = status as string;
      
      const complaints = await storage.getComplaints(filters);
      res.json(complaints);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      res.status(500).json({ message: "Failed to fetch complaints" });
    }
  });

  app.get("/api/complaints/:id", isAuthenticated, async (req, res) => {
    try {
      const complaint = await storage.getComplaint(req.params.id);
      if (!complaint) return res.status(404).json({ message: "Complaint not found" });
      res.json(complaint);
    } catch (error) {
      console.error("Error fetching complaint:", error);
      res.status(500).json({ message: "Failed to fetch complaint" });
    }
  });

  app.post("/api/complaints", isAuthenticated, async (req: any, res) => {
    try {
      const data = insertComplaintSchema.parse({
        ...req.body,
        raisedBy: req.user.claims.sub,
      });
      const complaint = await storage.createComplaint(data);
      res.status(201).json(complaint);
    } catch (error) {
      console.error("Error creating complaint:", error);
      res.status(400).json({ message: "Failed to create complaint" });
    }
  });

  app.patch("/api/complaints/:id", isAuthenticated, async (req, res) => {
    try {
      const complaint = await storage.updateComplaint(req.params.id, req.body);
      if (!complaint) return res.status(404).json({ message: "Complaint not found" });
      res.json(complaint);
    } catch (error) {
      console.error("Error updating complaint:", error);
      res.status(400).json({ message: "Failed to update complaint" });
    }
  });

  // Complaint Responses
  app.get("/api/complaints/:complaintId/responses", isAuthenticated, async (req, res) => {
    try {
      const responses = await storage.getComplaintResponses(req.params.complaintId);
      res.json(responses);
    } catch (error) {
      console.error("Error fetching complaint responses:", error);
      res.status(500).json({ message: "Failed to fetch responses" });
    }
  });

  app.post("/api/complaint-responses", isAuthenticated, async (req: any, res) => {
    try {
      const data = insertComplaintResponseSchema.parse({
        ...req.body,
        respondedBy: req.user.claims.sub,
      });
      const response = await storage.createComplaintResponse(data);
      res.status(201).json(response);
    } catch (error) {
      console.error("Error creating complaint response:", error);
      res.status(400).json({ message: "Failed to create response" });
    }
  });

  // Logbook
  app.get("/api/logbook", isAuthenticated, async (req, res) => {
    try {
      const { batchId, teacherId, date } = req.query;
      const entries = await storage.getLogbookEntries({
        batchId: batchId as string,
        teacherId: teacherId as string,
        date: date as string,
      });
      res.json(entries);
    } catch (error) {
      console.error("Error fetching logbook entries:", error);
      res.status(500).json({ message: "Failed to fetch logbook entries" });
    }
  });

  app.post("/api/logbook", isAuthenticated, async (req, res) => {
    try {
      const data = insertLogbookEntrySchema.parse(req.body);
      const entry = await storage.createLogbookEntry(data);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating logbook entry:", error);
      res.status(400).json({ message: "Failed to create logbook entry" });
    }
  });

  app.patch("/api/logbook/:id", isAuthenticated, async (req, res) => {
    try {
      const entry = await storage.updateLogbookEntry(req.params.id, req.body);
      if (!entry) return res.status(404).json({ message: "Logbook entry not found" });
      res.json(entry);
    } catch (error) {
      console.error("Error updating logbook entry:", error);
      res.status(400).json({ message: "Failed to update logbook entry" });
    }
  });

  // Assets
  app.get("/api/assets", isAuthenticated, async (req, res) => {
    try {
      const assets = await storage.getAssets();
      res.json(assets);
    } catch (error) {
      console.error("Error fetching assets:", error);
      res.status(500).json({ message: "Failed to fetch assets" });
    }
  });

  app.get("/api/assets/:id", isAuthenticated, async (req, res) => {
    try {
      const asset = await storage.getAsset(req.params.id);
      if (!asset) return res.status(404).json({ message: "Asset not found" });
      res.json(asset);
    } catch (error) {
      console.error("Error fetching asset:", error);
      res.status(500).json({ message: "Failed to fetch asset" });
    }
  });

  app.post("/api/assets", isAuthenticated, async (req, res) => {
    try {
      const data = insertAssetSchema.parse(req.body);
      const asset = await storage.createAsset(data);
      res.status(201).json(asset);
    } catch (error) {
      console.error("Error creating asset:", error);
      res.status(400).json({ message: "Failed to create asset" });
    }
  });

  app.patch("/api/assets/:id", isAuthenticated, async (req, res) => {
    try {
      const asset = await storage.updateAsset(req.params.id, req.body);
      if (!asset) return res.status(404).json({ message: "Asset not found" });
      res.json(asset);
    } catch (error) {
      console.error("Error updating asset:", error);
      res.status(400).json({ message: "Failed to update asset" });
    }
  });

  app.delete("/api/assets/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteAsset(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting asset:", error);
      res.status(500).json({ message: "Failed to delete asset" });
    }
  });

  // Library Books
  app.get("/api/library-books", isAuthenticated, async (req, res) => {
    try {
      const books = await storage.getLibraryBooks();
      res.json(books);
    } catch (error) {
      console.error("Error fetching library books:", error);
      res.status(500).json({ message: "Failed to fetch library books" });
    }
  });

  app.get("/api/library-books/:id", isAuthenticated, async (req, res) => {
    try {
      const book = await storage.getLibraryBook(req.params.id);
      if (!book) return res.status(404).json({ message: "Book not found" });
      res.json(book);
    } catch (error) {
      console.error("Error fetching library book:", error);
      res.status(500).json({ message: "Failed to fetch book" });
    }
  });

  app.post("/api/library-books", isAuthenticated, async (req, res) => {
    try {
      const data = insertLibraryBookSchema.parse(req.body);
      const book = await storage.createLibraryBook(data);
      res.status(201).json(book);
    } catch (error) {
      console.error("Error creating library book:", error);
      res.status(400).json({ message: "Failed to create book" });
    }
  });

  app.patch("/api/library-books/:id", isAuthenticated, async (req, res) => {
    try {
      const book = await storage.updateLibraryBook(req.params.id, req.body);
      if (!book) return res.status(404).json({ message: "Book not found" });
      res.json(book);
    } catch (error) {
      console.error("Error updating library book:", error);
      res.status(400).json({ message: "Failed to update book" });
    }
  });

  app.delete("/api/library-books/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteLibraryBook(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting library book:", error);
      res.status(500).json({ message: "Failed to delete book" });
    }
  });

  // Book Issues
  app.get("/api/book-issues", isAuthenticated, async (req, res) => {
    try {
      const { bookId, studentId, status } = req.query;
      const issues = await storage.getBookIssues({
        bookId: bookId as string,
        studentId: studentId as string,
        status: status as string,
      });
      res.json(issues);
    } catch (error) {
      console.error("Error fetching book issues:", error);
      res.status(500).json({ message: "Failed to fetch book issues" });
    }
  });

  app.post("/api/book-issues", isAuthenticated, async (req, res) => {
    try {
      const data = insertBookIssueSchema.parse(req.body);
      const issue = await storage.createBookIssue(data);
      res.status(201).json(issue);
    } catch (error) {
      console.error("Error creating book issue:", error);
      res.status(400).json({ message: "Failed to create book issue" });
    }
  });

  app.patch("/api/book-issues/:id", isAuthenticated, async (req, res) => {
    try {
      const issue = await storage.updateBookIssue(req.params.id, req.body);
      if (!issue) return res.status(404).json({ message: "Book issue not found" });
      res.json(issue);
    } catch (error) {
      console.error("Error updating book issue:", error);
      res.status(400).json({ message: "Failed to update book issue" });
    }
  });

  // Lost and Found
  app.get("/api/lost-found", isAuthenticated, async (req, res) => {
    try {
      const { status } = req.query;
      const items = await storage.getLostAndFoundItems(status as string);
      res.json(items);
    } catch (error) {
      console.error("Error fetching lost and found items:", error);
      res.status(500).json({ message: "Failed to fetch items" });
    }
  });

  app.post("/api/lost-found", isAuthenticated, async (req: any, res) => {
    try {
      const data = insertLostAndFoundSchema.parse({
        ...req.body,
        reportedBy: req.user.claims.sub,
      });
      const item = await storage.createLostAndFoundItem(data);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating lost and found item:", error);
      res.status(400).json({ message: "Failed to create item" });
    }
  });

  app.patch("/api/lost-found/:id", isAuthenticated, async (req, res) => {
    try {
      const item = await storage.updateLostAndFoundItem(req.params.id, req.body);
      if (!item) return res.status(404).json({ message: "Item not found" });
      res.json(item);
    } catch (error) {
      console.error("Error updating lost and found item:", error);
      res.status(400).json({ message: "Failed to update item" });
    }
  });

  // Certificates
  app.get("/api/certificates", isAuthenticated, async (req, res) => {
    try {
      const { studentId } = req.query;
      const certificates = await storage.getCertificates(studentId as string);
      res.json(certificates);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      res.status(500).json({ message: "Failed to fetch certificates" });
    }
  });

  app.post("/api/certificates", isAuthenticated, async (req: any, res) => {
    try {
      const data = insertCertificateSchema.parse({
        ...req.body,
        generatedBy: req.user.claims.sub,
      });
      const certificate = await storage.createCertificate(data);
      res.status(201).json(certificate);
    } catch (error) {
      console.error("Error creating certificate:", error);
      res.status(400).json({ message: "Failed to create certificate" });
    }
  });

  // User role update (admin only)
  app.patch("/api/users/:id/role", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (currentUser?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      const { role } = req.body;
      if (!["admin", "teacher", "parent", "student"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      const user = await storage.updateUserRole(req.params.id, role);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(400).json({ message: "Failed to update user role" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
