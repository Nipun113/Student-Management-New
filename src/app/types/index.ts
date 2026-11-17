export type EnrollmentStatusType = 'ACTIVE' | 'COMPLETED' | 'WITHDRAWN';

export interface CourseOptionDTO {
  id: number;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

export interface StudentEnrollmentDTO {
  id: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  status: EnrollmentStatusType;
  enrolledAt: string;
}

export interface EnrollmentDTO {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  courseId: number;
  courseCode: string;
  courseName: string;
  status: EnrollmentStatusType;
  enrolledAt: string;
}

export interface PaginatedEnrollmentsDTO {
  enrollments: EnrollmentDTO[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface StudentDTO {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  enrollments: StudentEnrollmentDTO[];
}

export interface PaginatedStudentsDTO {
  students: StudentDTO[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DashboardStatsDTO {
  totalStudents: number;
  activeCourses: number;
  activeEnrollments: number;
  newThisMonth: number;
  recentStudents: StudentDTO[];
}

export interface ApiErrorPayload {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public fields?: Record<string, string>;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    fields?: Record<string, string>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.fields = fields;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}