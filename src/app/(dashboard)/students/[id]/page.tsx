import React from 'react';
import Link from 'next/link';
import { getStudentById } from '@/services/student.service';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ArrowLeft, Edit, Mail, Phone, Calendar, UserX } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StudentDetailPage({
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

  // TC-07: Unknown ID Not-Found State
  if (!student) {
    return (
      <div className="mx-auto my-8 max-w-xl rounded-2xl border border-slate-800 bg-surface p-10 text-center shadow-lg shadow-black/10">
        <UserX className="mx-auto mb-3 h-12 w-12 text-slate-600" />
        <h1 className="text-xl font-bold text-slate-100">Student Not Found</h1>
        <p className="mt-2 text-sm text-slate-400">
          The requested student record (ID: {id}) does not exist or may have
          been removed.
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
    <div className="max-w-5xl space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/students"
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-indigo-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Student Directory
          </Link>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-indigo-300">Student Hub / Directory</p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {student.name}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Student ID: #{student.id}
          </p>
        </div>

        <Link
          href={`/students/${student.id}/edit`}
          className="inline-flex items-center gap-2 self-start rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-950 transition hover:bg-indigo-400 sm:self-auto"
        >
          <Edit className="w-4 h-4" />
          Edit Student
        </Link>
      </div>

      {/* Contact & Metadata Card */}
      <section className="grid grid-cols-1 gap-5 rounded-2xl border border-slate-800 bg-surface/90 p-5 shadow-lg shadow-black/10 sm:grid-cols-3 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-indigo-400/10 p-2.5 text-indigo-300"><Mail className="h-4 w-4" /></div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Email Address
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-200">
              {student.email}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-sky-400/10 p-2.5 text-sky-300"><Phone className="h-4 w-4" /></div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Phone Number
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-200">
              {student.phone || 'Not provided'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-amber-400/10 p-2.5 text-amber-300"><Calendar className="h-4 w-4" /></div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Created Date
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-200">
              {new Date(student.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </section>

      {/* Enrolled Courses Table */}
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-surface/90 shadow-lg shadow-black/10">
        <h2 className="border-b border-slate-800 px-5 py-5 text-base font-bold text-slate-100 sm:px-6">
          Course Enrollments ({student.enrollments.length})
        </h2>

        {student.enrollments.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-400 sm:px-6">
            This student is not currently enrolled in any courses.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3.5 font-semibold sm:px-6">Course Code</th>
                  <th className="px-4 py-3.5 font-semibold">Course Name</th>
                  <th className="px-4 py-3.5 font-semibold">Enrolled Date</th>
                  <th className="px-5 py-3.5 font-semibold sm:px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-sm">
                {student.enrollments.map((enr) => (
                  <tr key={enr.id} className="transition hover:bg-slate-800/40">
                    <td className="px-5 py-4 font-semibold text-slate-100 sm:px-6">
                      {enr.courseCode}
                    </td>
                    <td className="px-4 py-4 text-slate-300">
                      {enr.courseName}
                    </td>
                    <td className="px-4 py-4 text-slate-400">
                      {new Date(enr.enrolledAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-4 sm:px-6">
                      <StatusBadge status={enr.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}