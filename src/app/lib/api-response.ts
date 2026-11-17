import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '@/types';

export function handleApiError(error: unknown) {
  // 1. Handle Zod Validation Errors (400 Bad Request)
  if (error instanceof ZodError) {
    const fields: Record<string, string> = {};
    for (const issue of error.issues) {
      const pathKey = issue.path.join('.') || 'form';
      if (!fields[pathKey]) {
        fields[pathKey] = issue.message;
      }
    }
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please correct the highlighted fields.',
          fields,
        },
      },
      { status: 400 }
    );
  }

  // 2. Handle Known Application Business Errors (400, 404, 409)
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error.fields ? { fields: error.fields } : {}),
        },
      },
      { status: error.statusCode }
    );
  }

  // 3. Handle Prisma Unique Constraint Violations (P2002 -> 409 Conflict)
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          error: {
            code: 'CONFLICT',
            message: 'Please correct the highlighted fields.',
            fields: {
              email: 'A student with this email already exists.',
            },
          },
        },
        { status: 409 }
      );
    }
  }

  // 4. Log unexpected errors server-side without leaking stack traces or credentials (NFR-07, TC-13)
  console.error('[SERVER_ERROR]:', error);

  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message:
          'An unexpected server error occurred while processing your request. Please try again later.',
      },
    },
    { status: 500 }
  );
}