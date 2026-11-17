import { NextRequest, NextResponse } from 'next/server';
import {
  createStudentSchema,
  studentQuerySchema,
} from '@/lib/validators/student.validators';
import { createStudent, listStudents } from '@/services/student.service';
import { handleApiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = studentQuerySchema.parse({
      search: searchParams.get('search') ?? undefined,
      courseId: searchParams.get('courseId') ?? undefined,
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    });

    const result = await listStudents(query);
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedInput = createStudentSchema.parse(body);
    const created = await createStudent(validatedInput);

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}