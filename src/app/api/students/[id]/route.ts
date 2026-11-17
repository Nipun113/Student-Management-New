import { NextRequest, NextResponse } from 'next/server';
import {
  deleteStudent,
  getStudentById,
  updateStudent,
} from '@/services/student.service';
import { updateStudentSchema } from '@/lib/validators/student.validators';
import { handleApiError } from '@/lib/api-response';
import { AppError } from '@/types';

export const dynamic = 'force-dynamic';

function parseIdParam(idStr: string): number {
  const id = Number(idStr);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, 'INVALID_ID', 'Student ID must be a positive integer.');
  }
  return id;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const studentId = parseIdParam(id);
    const student = await getStudentById(studentId);

    return NextResponse.json({ data: student }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const studentId = parseIdParam(id);
    const body = await request.json();
    const validatedInput = updateStudentSchema.parse(body);

    const updated = await updateStudent(studentId, validatedInput);
    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const studentId = parseIdParam(id);
    await deleteStudent(studentId);

    return NextResponse.json(
      { data: { message: 'Student deleted successfully.' } },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}