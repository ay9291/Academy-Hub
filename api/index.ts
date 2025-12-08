import type { VercelRequest, VercelResponse } from "@vercel/node";

// Auth handlers
import loginHandler from "./auth/login";
import logoutHandler from "./auth/logout";
import userHandler from "./auth/user";
import profileHandler from "./auth/profile";
import refreshHandler from "./auth/refresh";
import requestOtpHandler from "./auth/request-otp";
import verifyOtpHandler from "./auth/verify-otp";
import forgotPasswordHandler from "./auth/forgot-password";
import resetPasswordHandler from "./auth/reset-password";
import changePasswordHandler from "./auth/change-password";

// Resource handlers
import studentsHandler from "./students/index";
import studentByIdHandler from "./students/[id]";
import teachersHandler from "./teachers/index";
import teacherByIdHandler from "./teachers/[id]";
import batchesHandler from "./batches/index";
import batchByIdHandler from "./batches/[id]";
import batchStudentsHandler from "./batch-students/index";
import batchStudentByIdHandler from "./batch-students/[id]";
import batchTeachersHandler from "./batch-teachers/index";
import batchTeacherByIdHandler from "./batch-teachers/[id]";
import subjectsHandler from "./subjects/index";
import subjectByIdHandler from "./subjects/[id]";
import attendanceHandler from "./attendance/index";
import attendanceByIdHandler from "./attendance/[id]";
import attendanceBulkHandler from "./attendance/bulk";
import homeworkHandler from "./homework/index";
import homeworkByIdHandler from "./homework/[id]";
import homeworkSubmissionsHandler from "./homework-submissions/index";
import homeworkSubmissionByIdHandler from "./homework-submissions/[id]";
import testsHandler from "./tests/index";
import testByIdHandler from "./tests/[id]";
import testResultsHandler from "./test-results/index";
import testResultByIdHandler from "./test-results/[id]";
import testResultsBulkHandler from "./test-results/bulk";
import feeStructuresHandler from "./fee-structures/index";
import feeStructureByIdHandler from "./fee-structures/[id]";
import feePaymentsHandler from "./fee-payments/index";
import libraryBooksHandler from "./library-books/index";
import libraryBookByIdHandler from "./library-books/[id]";
import bookIssuesHandler from "./book-issues/index";
import bookIssueByIdHandler from "./book-issues/[id]";
import studyMaterialsHandler from "./study-materials/index";
import studyMaterialByIdHandler from "./study-materials/[id]";
import complaintsHandler from "./complaints/index";
import complaintByIdHandler from "./complaints/[id]";
import complaintResponsesHandler from "./complaint-responses/index";
import certificatesHandler from "./certificates/index";
import logbookHandler from "./logbook/index";
import logbookByIdHandler from "./logbook/[id]";
import lostFoundHandler from "./lost-found/index";
import lostFoundByIdHandler from "./lost-found/[id]";
import assetsHandler from "./assets/index";
import assetByIdHandler from "./assets/[id]";
import dashboardStatsHandler from "./dashboard/stats";

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
