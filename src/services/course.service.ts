import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { AppError, CourseOptionDTO } from '@/types';
import { CreateCourseInput } from '@/lib/validators/course.validators';

export async function getCourses(onlyActive: boolean = true): Promise<CourseOptionDTO[]> {
  const courses = await prisma.course.findMany({
    where: onlyActive ? { is_active: true } : undefined,
    orderBy: { code: 'asc' },
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      is_active: true,
    },
  });

  return courses;
}

export async function createCourse(
  input: CreateCourseInput
): Promise<CourseOptionDTO> {
  try {
    return await prisma.course.create({
      data: {
        code: input.code,
        name: input.name,
        description: input.description,
        is_active: input.isActive,
      },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        is_active: true,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new AppError(
        409,
        'VALIDATION_ERROR',
        'Please correct the highlighted fields.',
        { code: 'A course with this code already exists.' }
      );
    }

    throw error;
  }
}