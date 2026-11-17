import { prisma } from '@/lib/prisma';
import { Prisma, EnrollmentStatus } from '@prisma/client';
import {
  AppError,
  PaginatedEnrollmentsDTO,
  PaginatedStudentsDTO,
  StudentDTO,
} from '@/types';
import {
  CreateStudentInput,
  EnrollmentQuery,
  UpdateStudentInput,
} from '@/lib/validators/student.validators';

type StudentWithEnrollments = Prisma.StudentGetPayload<{
  include: {
    enrollments: {
      include: {
        course: true;
      };
    };
  };
}>;

export function formatStudentRecord(row: StudentWithEnrollments): StudentDTO {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    enrollments: row.enrollments.map((enr) => ({
      id: enr.id,
      courseId: enr.course_id,
      courseCode: enr.course.code,
      courseName: enr.course.name,
      status: enr.status,
      enrolledAt: enr.enrolled_at.toISOString(),
    })),
  };
}

/**
 * List & search students with pagination (FR-02, FR-03)
 * Uses Prisma parameterized queries to prevent SQL injection.
 */
export async function listStudents(params: {
  search: string;
  courseId?: number;
  page: number;
  limit: number;
}): Promise<PaginatedStudentsDTO> {
  const { search, courseId, page, limit } = params;
  const skip = (page - 1) * limit;

  const whereClause: Prisma.StudentWhereInput = {
    ...(search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } },
          ],
        }
      : {}),
    ...(courseId
      ? {
          enrollments: {
            some: { course_id: courseId },
          },
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.student.count({ where: whereClause }),
    prisma.student.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        enrollments: {
          include: { course: true },
          orderBy: { enrolled_at: 'asc' },
        },
      },
    }),
  ]);

  return {
    students: rows.map(formatStudentRecord),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function listEnrollments(
  params: EnrollmentQuery
): Promise<PaginatedEnrollmentsDTO> {
  const { search, status, page, limit } = params;
  const where: Prisma.EnrollmentWhereInput = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { student: { is: { name: { contains: search } } } },
            { student: { is: { email: { contains: search } } } },
            { course: { is: { code: { contains: search } } } },
            { course: { is: { name: { contains: search } } } },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.enrollment.count({ where }),
    prisma.enrollment.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { enrolled_at: 'desc' },
      include: {
        student: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, code: true, name: true } },
      },
    }),
  ]);

  return {
    enrollments: rows.map((enrollment) => ({
      id: enrollment.id,
      studentId: enrollment.student.id,
      studentName: enrollment.student.name,
      studentEmail: enrollment.student.email,
      courseId: enrollment.course.id,
      courseCode: enrollment.course.code,
      courseName: enrollment.course.name,
      status: enrollment.status,
      enrolledAt: enrollment.enrolled_at.toISOString(),
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

/**
 * Get a single student by ID (FR-05, TC-07)
 */
export async function getStudentById(id: number): Promise<StudentDTO> {
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      enrollments: {
        include: { course: true },
        orderBy: { enrolled_at: 'asc' },
      },
    },
  });

  if (!student) {
    throw new AppError(404, 'NOT_FOUND', `Student with ID ${id} was not found.`);
  }

  return formatStudentRecord(student);
}

/**
 * Create a new student and initial enrollments inside a single Prisma transaction (FR-04, NFR-05)
 */
export async function createStudent(input: CreateStudentInput): Promise<StudentDTO> {
  // 1. Check duplicate email (A-03, TC-03)
  const existingEmail = await prisma.student.findUnique({
    where: { email: input.email },
  });

  if (existingEmail) {
    throw new AppError(
      409,
      'VALIDATION_ERROR',
      'Please correct the highlighted fields.',
      { email: 'A student with this email already exists.' }
    );
  }

  // 2. Validate that all selected courses exist and are active (FR-08, TC-14)
  const validCourses = await prisma.course.findMany({
    where: {
      id: { in: input.courseIds },
      is_active: true,
    },
  });

  if (validCourses.length !== input.courseIds.length) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      'One or more selected courses are invalid or inactive.',
      { courseIds: 'Only active catalog courses can be selected for enrollment.' }
    );
  }

  // 3. Execute atomic creation in a Prisma Transaction (Section 3.1 Business Rule)
  const createdStudent = await prisma.$transaction(async (tx) => {
    return tx.student.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        enrollments: {
          create: input.courseIds.map((courseId) => ({
            course_id: courseId,
            status: EnrollmentStatus.ACTIVE,
          })),
        },
      },
      include: {
        enrollments: {
          include: { course: true },
          orderBy: { enrolled_at: 'asc' },
        },
      },
    });
  });

  return formatStudentRecord(createdStudent);
}

/**
 * Update student profile and synchronize enrollments in a transaction (FR-06, TC-08)
 */
export async function updateStudent(
  id: number,
  input: UpdateStudentInput
): Promise<StudentDTO> {
  const existingStudent = await prisma.student.findUnique({
    where: { id },
    include: { enrollments: true },
  });

  if (!existingStudent) {
    throw new AppError(404, 'NOT_FOUND', `Student with ID ${id} was not found.`);
  }

  // 1. Check if email is taken by a DIFFERENT student
  if (input.email !== existingStudent.email) {
    const emailConflict = await prisma.student.findUnique({
      where: { email: input.email },
    });
    if (emailConflict && emailConflict.id !== id) {
      throw new AppError(
        409,
        'VALIDATION_ERROR',
        'Please correct the highlighted fields.',
        { email: 'A student with this email already exists.' }
      );
    }
  }

  // 2. Determine which courses are newly added vs already enrolled
  const existingCourseIds = existingStudent.enrollments.map((e) => e.course_id);
  const newlyAddedCourseIds = input.courseIds.filter(
    (cid) => !existingCourseIds.includes(cid)
  );

  // Verify any newly added courses are active (FR-08, TC-14)
  if (newlyAddedCourseIds.length > 0) {
    const validNewCourses = await prisma.course.findMany({
      where: {
        id: { in: newlyAddedCourseIds },
        is_active: true,
      },
    });

    if (validNewCourses.length !== newlyAddedCourseIds.length) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        'One or more newly selected courses are inactive or do not exist.',
        { courseIds: 'Inactive courses cannot be newly assigned.' }
      );
    }
  }

  // 3. Perform transactional update of Student + Enrollments
  const updatedStudent = await prisma.$transaction(async (tx) => {
    // Remove enrollments that were deselected
    await tx.enrollment.deleteMany({
      where: {
        student_id: id,
        course_id: { notIn: input.courseIds },
      },
    });

    // Update statuses for existing enrollments if provided
    for (const enr of existingStudent.enrollments) {
      if (input.courseIds.includes(enr.course_id)) {
        const requestedStatus =
          input.enrollmentStatuses?.[String(enr.course_id)];
        if (requestedStatus && requestedStatus !== enr.status) {
          await tx.enrollment.update({
            where: { id: enr.id },
            data: { status: requestedStatus as EnrollmentStatus },
          });
        }
      }
    }

    // Create newly added enrollments
    if (newlyAddedCourseIds.length > 0) {
      await tx.enrollment.createMany({
        data: newlyAddedCourseIds.map((courseId) => ({
          student_id: id,
          course_id: courseId,
          status:
            (input.enrollmentStatuses?.[String(courseId)] as EnrollmentStatus) ||
            EnrollmentStatus.ACTIVE,
        })),
      });
    }

    // Update core student details and return hydrated student
    return tx.student.update({
      where: { id },
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
      },
      include: {
        enrollments: {
          include: { course: true },
          orderBy: { enrolled_at: 'asc' },
        },
      },
    });
  });

  return formatStudentRecord(updatedStudent);
}

/**
 * Delete a student and cascade-delete their enrollments (FR-07, TC-09)
 */
export async function deleteStudent(id: number): Promise<void> {
  const existing = await prisma.student.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', `Student with ID ${id} was not found.`);
  }

  await prisma.student.delete({
    where: { id },
  });
}