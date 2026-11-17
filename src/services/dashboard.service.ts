import { prisma } from '@/lib/prisma';
import { DashboardStatsDTO } from '@/types';
import { formatStudentRecord } from './student.service';

export async function getDashboardStats(): Promise<DashboardStatsDTO> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalStudents,
    activeCourses,
    activeEnrollments,
    newThisMonth,
    recentStudentRows,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.course.count({ where: { is_active: true } }),
    prisma.enrollment.count({ where: { status: 'ACTIVE' } }),
    prisma.student.count({
      where: {
        created_at: { gte: startOfMonth },
      },
    }),
    prisma.student.findMany({
      take: 5,
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
    totalStudents,
    activeCourses,
    activeEnrollments,
    newThisMonth,
    recentStudents: recentStudentRows.map(formatStudentRecord),
  };
}