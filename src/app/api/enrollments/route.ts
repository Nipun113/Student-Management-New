import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-response';
import { enrollmentQuerySchema } from '@/lib/validators/student.validators';
import { listEnrollments } from '@/services/student.service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = enrollmentQuerySchema.parse({
      search: searchParams.get('search') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    });

    const result = await listEnrollments(query);
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
