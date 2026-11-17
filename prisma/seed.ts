import { PrismaClient, EnrollmentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Seed Courses (Active and 1 Inactive for testing TC-14)
  const coursesData = [
    {
      code: 'HNDIT',
      name: 'Higher National Diploma in Information Technology',
      description: 'Comprehensive software engineering, database design, and networking program.',
      is_active: true,
    },
    {
      code: 'HNDA',
      name: 'Higher National Diploma in Accountancy',
      description: 'Financial accounting, auditing, taxation, and corporate finance.',
      is_active: true,
    },
    {
      code: 'HNDE',
      name: 'Higher National Diploma in Engineering',
      description: 'Core civil, electrical, and mechanical engineering principles.',
      is_active: true,
    },
    {
      code: 'HNDM',
      name: 'Higher National Diploma in Management',
      description: 'Business administration, organizational behavior, and marketing.',
      is_active: true,
    },
    {
      code: 'HNDTHM',
      name: 'Higher National Diploma in Tourism & Hospitality',
      description: 'Hospitality operations, event management, and sustainable tourism.',
      is_active: true,
    },
    {
      code: 'LEGACY-01',
      name: 'Legacy Diploma in Desktop Publishing (Archived)',
      description: 'Archived course used to verify that inactive courses cannot be newly assigned.',
      is_active: false,
    },
  ];

  const courseMap: Record<string, number> = {};

  for (const course of coursesData) {
    const upserted = await prisma.course.upsert({
      where: { code: course.code },
      update: {
        name: course.name,
        description: course.description,
        is_active: course.is_active,
      },
      create: course,
    });
    courseMap[course.code] = upserted.id;
  }

  console.log(`✅ Seeded ${Object.keys(courseMap).length} courses.`);

  // 2. Seed Fictional Sample Students (matching Wireframes in Figures 2 & 3)
  const sampleStudents = [
    {
      name: 'Amaya Perera',
      email: 'amaya@example.com',
      phone: '077 123 4567',
      enrollments: [{ code: 'HNDIT', status: EnrollmentStatus.ACTIVE }],
    },
    {
      name: 'Kavindu Silva',
      email: 'kavindu@example.com',
      phone: '071 234 5678',
      enrollments: [{ code: 'HNDA', status: EnrollmentStatus.ACTIVE }],
    },
    {
      name: 'Tharushi Fernando',
      email: 'tharushi@example.com',
      phone: '076 345 6789',
      enrollments: [
        { code: 'HNDIT', status: EnrollmentStatus.ACTIVE },
        { code: 'HNDE', status: EnrollmentStatus.ACTIVE },
      ],
    },
    {
      name: 'Ravindu Jayasuriya',
      email: 'ravindu@example.com',
      phone: '075 456 7890',
      enrollments: [{ code: 'HNDA', status: EnrollmentStatus.COMPLETED }],
    },
    {
      name: 'Nethmi Wijesinghe',
      email: 'nethmi@example.com',
      phone: '078 567 8901',
      enrollments: [{ code: 'HNDIT', status: EnrollmentStatus.ACTIVE }],
    },
  ];

  for (const s of sampleStudents) {
    const existing = await prisma.student.findUnique({
      where: { email: s.email },
    });

    if (!existing) {
      await prisma.student.create({
        data: {
          name: s.name,
          email: s.email,
          phone: s.phone,
          enrollments: {
            create: s.enrollments.map((e) => ({
              course_id: courseMap[e.code],
              status: e.status,
            })),
          },
        },
      });
    }
  }

  console.log('✅ Seeded sample students and enrollments.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });