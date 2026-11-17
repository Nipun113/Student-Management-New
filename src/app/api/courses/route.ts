import { NextRequest, NextResponse } from 'next/server';
import { createCourseSchema } from '@/lib/validators/course.validators';
import { createCourse, getCourses } from '@/services/course.service';
import { handleApiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeParam = searchParams.get('active');
    const onlyActive = activeParam === null ? true : activeParam === 'true';

    const courses = await getCourses(onlyActive);
    return NextResponse.json({ data: courses }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = createCourseSchema.parse(body);
    const course = await createCourse(input);
    return NextResponse.json({ data: course }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}