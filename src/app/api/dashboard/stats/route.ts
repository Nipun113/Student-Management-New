import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/services/dashboard.service';
import { handleApiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = await getDashboardStats();
    return NextResponse.json({ data: stats }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}