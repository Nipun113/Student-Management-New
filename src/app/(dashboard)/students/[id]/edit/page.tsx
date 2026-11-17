import React from 'react';
import Link from 'next/link';
import { getStudentById } from '@/services/student.service';
import { StudentForm } from '@/components/students/StudentForm';
import { ArrowLeft, UserX } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);

  let student = null;
  if (Number.isInteger(numericId) && numericId > 0) {
    try {
      student = await getStudentById(numericId);
    } catch {
      student = null;
    }
  }

  if (!student) {
    return (
      <div className="mx-auto my-8 max-w-xl rounded-2xl border border-slate-800 bg-surface p-10 text-center shadow-lg shadow-black/10">
        <UserX className="mx-auto mb-3 h-12 w-12 text-slate-600" />
        <h1 className="text-xl font-bold text-slate-100">Student Not Found</h1>
        <p className="mt-2 text-sm text-slate-400">
          Cannot edit student record (ID: {id}) because it does not exist.
        </p>
        <Link
          href="/students"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Student Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div>
        <Link
          href={`/students/${student.id}`}
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-indigo-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Student Profile
        </Link>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-indigo-300">Student Hub / Directory</p>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Edit Student: {student.name}
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Update profile details, enrolled courses, or enrollment status.
        </p>
      </div>

      <StudentForm mode="edit" initialStudent={student} />
    </div>
  );
}