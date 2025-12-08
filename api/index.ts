import type { VercelRequest, VercelResponse } from "@vercel/node";

// Auth handlers
import loginHandler from "../lib/api-handlers/auth/login";
import logoutHandler from "../lib/api-handlers/auth/logout";
import userHandler from "../lib/api-handlers/auth/user";
import profileHandler from "../lib/api-handlers/auth/profile";
import refreshHandler from "../lib/api-handlers/auth/refresh";
import requestOtpHandler from "../lib/api-handlers/auth/request-otp";
import verifyOtpHandler from "../lib/api-handlers/auth/verify-otp";
import forgotPasswordHandler from "../lib/api-handlers/auth/forgot-password";
import resetPasswordHandler from "../lib/api-handlers/auth/reset-password";
import changePasswordHandler from "../lib/api-handlers/auth/change-password";

// Resource handlers
import studentsHandler from "../lib/api-handlers/students/index";
import studentByIdHandler from "../lib/api-handlers/students/[id]";
import teachersHandler from "../lib/api-handlers/teachers/index";
import teacherByIdHandler from "../lib/api-handlers/teachers/[id]";
import batchesHandler from "../lib/api-handlers/batches/index";
import batchByIdHandler from "../lib/api-handlers/batches/[id]";
import batchStudentsHandler from "../lib/api-handlers/batch-students/index";
import batchStudentByIdHandler from "../lib/api-handlers/batch-students/[id]";
import batchTeachersHandler from "../lib/api-handlers/batch-teachers/index";
import batchTeacherByIdHandler from "../lib/api-handlers/batch-teachers/[id]";
import subjectsHandler from "../lib/api-handlers/subjects/index";
import subjectByIdHandler from "../lib/api-handlers/subjects/[id]";
import attendanceHandler from "../lib/api-handlers/attendance/index";
import attendanceByIdHandler from "../lib/api-handlers/attendance/[id]";
import attendanceBulkHandler from "../lib/api-handlers/attendance/bulk";
import homeworkHandler from "../lib/api-handlers/homework/index";
import homeworkByIdHandler from "../lib/api-handlers/homework/[id]";
import homeworkSubmissionsHandler from "../lib/api-handlers/homework-submissions/index";
import homeworkSubmissionByIdHandler from "../lib/api-handlers/homework-submissions/[id]";
import testsHandler from "../lib/api-handlers/tests/index";
import testByIdHandler from "../lib/api-handlers/tests/[id]";
import testResultsHandler from "../lib/api-handlers/test-results/index";
import testResultByIdHandler from "../lib/api-handlers/test-results/[id]";
import testResultsBulkHandler from "../lib/api-handlers/test-results/bulk";
import feeStructuresHandler from "../lib/api-handlers/fee-structures/index";
import feeStructureByIdHandler from "../lib/api-handlers/fee-structures/[id]";
import feePaymentsHandler from "../lib/api-handlers/fee-payments/index";
import libraryBooksHandler from "../lib/api-handlers/library-books/index";
import libraryBookByIdHandler from "../lib/api-handlers/library-books/[id]";
import bookIssuesHandler from "../lib/api-handlers/book-issues/index";
import bookIssueByIdHandler from "../lib/api-handlers/book-issues/[id]";
import studyMaterialsHandler from "../lib/api-handlers/study-materials/index";
import studyMaterialByIdHandler from "../lib/api-handlers/study-materials/[id]";
import complaintsHandler from "../lib/api-handlers/complaints/index";
import complaintByIdHandler from "../lib/api-handlers/complaints/[id]";
import complaintResponsesHandler from "../lib/api-handlers/complaint-responses/index";
import certificatesHandler from "../lib/api-handlers/certificates/index";
import logbookHandler from "../lib/api-handlers/logbook/index";
import logbookByIdHandler from "../lib/api-handlers/logbook/[id]";
import lostFoundHandler from "../lib/api-handlers/lost-found/index";
import lostFoundByIdHandler from "../lib/api-handlers/lost-found/[id]";
import assetsHandler from "../lib/api-handlers/assets/index";
import assetByIdHandler from "../lib/api-handlers/assets/[id]";
import dashboardStatsHandler from "../lib/api-handlers/dashboard/stats";

type Handler = (req: VercelRequest, res: VercelResponse) => Promise<void | VercelResponse>;

interface Route {
  pattern: RegExp;
  handler: Handler;
  paramName?: string;
}

const routes: Route[] = [
  // Auth routes (must come first - most specific)
  { pattern: /^\/api\/auth\/login$/, handler: loginHandler },
  { pattern: /^\/api\/auth\/logout$/, handler: logoutHandler },
  { pattern: /^\/api\/auth\/user$/, handler: userHandler },
  { pattern: /^\/api\/auth\/profile$/, handler: profileHandler },
  { pattern: /^\/api\/auth\/refresh$/, handler: refreshHandler },
  { pattern: /^\/api\/auth\/request-otp$/, handler: requestOtpHandler },
  { pattern: /^\/api\/auth\/verify-otp$/, handler: verifyOtpHandler },
  { pattern: /^\/api\/auth\/forgot-password$/, handler: forgotPasswordHandler },
  { pattern: /^\/api\/auth\/reset-password$/, handler: resetPasswordHandler },
  { pattern: /^\/api\/auth\/change-password$/, handler: changePasswordHandler },
  
  // Dashboard
  { pattern: /^\/api\/dashboard\/stats$/, handler: dashboardStatsHandler },
  
  // Bulk operations (must come before parameterized routes)
  { pattern: /^\/api\/attendance\/bulk$/, handler: attendanceBulkHandler },
  { pattern: /^\/api\/test-results\/bulk$/, handler: testResultsBulkHandler },
  
  // Students
  { pattern: /^\/api\/students$/, handler: studentsHandler },
  { pattern: /^\/api\/students\/([^/]+)$/, handler: studentByIdHandler, paramName: "id" },
  
  // Teachers
  { pattern: /^\/api\/teachers$/, handler: teachersHandler },
  { pattern: /^\/api\/teachers\/([^/]+)$/, handler: teacherByIdHandler, paramName: "id" },
  
  // Batches
  { pattern: /^\/api\/batches$/, handler: batchesHandler },
  { pattern: /^\/api\/batches\/([^/]+)$/, handler: batchByIdHandler, paramName: "id" },
  
  // Batch students
  { pattern: /^\/api\/batch-students$/, handler: batchStudentsHandler },
  { pattern: /^\/api\/batch-students\/([^/]+)$/, handler: batchStudentByIdHandler, paramName: "id" },
  
  // Batch teachers
  { pattern: /^\/api\/batch-teachers$/, handler: batchTeachersHandler },
  { pattern: /^\/api\/batch-teachers\/([^/]+)$/, handler: batchTeacherByIdHandler, paramName: "id" },
  
  // Subjects
  { pattern: /^\/api\/subjects$/, handler: subjectsHandler },
  { pattern: /^\/api\/subjects\/([^/]+)$/, handler: subjectByIdHandler, paramName: "id" },
  
  // Attendance
  { pattern: /^\/api\/attendance$/, handler: attendanceHandler },
  { pattern: /^\/api\/attendance\/([^/]+)$/, handler: attendanceByIdHandler, paramName: "id" },
  
  // Homework
  { pattern: /^\/api\/homework$/, handler: homeworkHandler },
  { pattern: /^\/api\/homework\/([^/]+)$/, handler: homeworkByIdHandler, paramName: "id" },
  
  // Homework submissions
  { pattern: /^\/api\/homework-submissions$/, handler: homeworkSubmissionsHandler },
  { pattern: /^\/api\/homework-submissions\/([^/]+)$/, handler: homeworkSubmissionByIdHandler, paramName: "id" },
  
  // Tests
  { pattern: /^\/api\/tests$/, handler: testsHandler },
  { pattern: /^\/api\/tests\/([^/]+)$/, handler: testByIdHandler, paramName: "id" },
  
  // Test results
  { pattern: /^\/api\/test-results$/, handler: testResultsHandler },
  { pattern: /^\/api\/test-results\/([^/]+)$/, handler: testResultByIdHandler, paramName: "id" },
  
  // Fee structures
  { pattern: /^\/api\/fee-structures$/, handler: feeStructuresHandler },
  { pattern: /^\/api\/fee-structures\/([^/]+)$/, handler: feeStructureByIdHandler, paramName: "id" },
  
  // Fee payments
  { pattern: /^\/api\/fee-payments$/, handler: feePaymentsHandler },
  
  // Library books
  { pattern: /^\/api\/library-books$/, handler: libraryBooksHandler },
  { pattern: /^\/api\/library-books\/([^/]+)$/, handler: libraryBookByIdHandler, paramName: "id" },
  
  // Book issues
  { pattern: /^\/api\/book-issues$/, handler: bookIssuesHandler },
  { pattern: /^\/api\/book-issues\/([^/]+)$/, handler: bookIssueByIdHandler, paramName: "id" },
  
  // Study materials
  { pattern: /^\/api\/study-materials$/, handler: studyMaterialsHandler },
  { pattern: /^\/api\/study-materials\/([^/]+)$/, handler: studyMaterialByIdHandler, paramName: "id" },
  
  // Complaints
  { pattern: /^\/api\/complaints$/, handler: complaintsHandler },
  { pattern: /^\/api\/complaints\/([^/]+)$/, handler: complaintByIdHandler, paramName: "id" },
  
  // Complaint responses
  { pattern: /^\/api\/complaint-responses$/, handler: complaintResponsesHandler },
  
  // Certificates
  { pattern: /^\/api\/certificates$/, handler: certificatesHandler },
  
  // Logbook
  { pattern: /^\/api\/logbook$/, handler: logbookHandler },
  { pattern: /^\/api\/logbook\/([^/]+)$/, handler: logbookByIdHandler, paramName: "id" },
  
  // Lost & Found
  { pattern: /^\/api\/lost-found$/, handler: lostFoundHandler },
  { pattern: /^\/api\/lost-found\/([^/]+)$/, handler: lostFoundByIdHandler, paramName: "id" },
  
  // Assets
  { pattern: /^\/api\/assets$/, handler: assetsHandler },
  { pattern: /^\/api\/assets\/([^/]+)$/, handler: assetByIdHandler, paramName: "id" },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = req.url || "";
  const pathname = url.split("?")[0];
  
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  
  for (const route of routes) {
    const match = pathname.match(route.pattern);
    if (match) {
      // Add dynamic parameter to query if exists
      if (route.paramName && match[1]) {
        req.query = { ...req.query, [route.paramName]: match[1] };
      }
      return route.handler(req, res);
    }
  }
  
  return res.status(404).json({ message: "Not found" });
}
