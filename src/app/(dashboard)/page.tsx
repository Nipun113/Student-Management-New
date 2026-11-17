import React from 'react';
import Link from 'next/link';
import { getDashboardStats } from '@/services/dashboard.service';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Plus, Users, BookOpen, CheckSquare, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let stats = null;
  let dbError = null;

  try {
    stats = await getDashboardStats();
  } catch {
    dbError =
      'Unable to load dashboard statistics. Please verify your MySQL database connection.';
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-indigo-300">
            Student Hub / Overview
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Welcome back. Here is your student overview.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-300 shadow-sm sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Administrator
        </div>
      </div>

      {dbError ? (
        <div
          role="alert"
          className="rounded-2xl border border-rose-900/70 bg-rose-950/40 p-6 text-rose-200"
        >
          <h2 className="font-semibold text-base">Database Connection Issue</h2>
          <p className="text-sm mt-1">{dbError}</p>
        </div>
      ) : (
        stats && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
              <div className="rounded-2xl border border-slate-800 bg-surface/90 p-5 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-slate-700 hover:shadow-xl">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-400">
                  <span>Total Students</span>
                  <Users className="h-10 w-10 rounded-xl bg-indigo-400/10 p-2.5 text-indigo-300" />
                </div>
                <p className="mt-5 text-3xl font-bold tracking-tight text-white">
                  {stats.totalStudents}
                </p>
                <p className="mt-2 text-xs text-slate-500">Registered learners</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-surface/90 p-5 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-slate-700 hover:shadow-xl">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-400">
                  <span>Active Courses</span>
                  <BookOpen className="h-10 w-10 rounded-xl bg-sky-400/10 p-2.5 text-sky-300" />
                </div>
                <p className="mt-5 text-3xl font-bold tracking-tight text-white">
                  {String(stats.activeCourses).padStart(2, '0')}
                </p>
                <p className="mt-2 text-xs text-slate-500">Available in catalog</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-surface/90 p-5 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-slate-700 hover:shadow-xl">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-400">
                  <span>Active Enrollments</span>
                  <CheckSquare className="h-10 w-10 rounded-xl bg-emerald-400/10 p-2.5 text-emerald-300" />
                </div>
                <p className="mt-5 text-3xl font-bold tracking-tight text-white">
                  {stats.activeEnrollments}
                </p>
                <p className="mt-2 text-xs text-slate-500">Current enrollments</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-surface/90 p-5 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-slate-700 hover:shadow-xl">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-400">
                  <span>New This Month</span>
                  <Calendar className="h-10 w-10 rounded-xl bg-amber-400/10 p-2.5 text-amber-300" />
                </div>
                <p className="mt-5 text-3xl font-bold tracking-tight text-white">
                  {stats.newThisMonth}
                </p>
                <p className="mt-2 text-xs text-slate-500">Recently added</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
              <section className="overflow-hidden rounded-2xl border border-slate-800 bg-surface/90 shadow-lg shadow-black/10 xl:col-span-2">
                <div className="flex items-center justify-between border-b border-slate-800 px-5 py-5 sm:px-6">
                  <div>
                    <h2 className="text-base font-bold text-slate-100">
                    Recently Added Students
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                    Latest records created in the system
                    </p>
                  </div>
                  <Link href="/students" className="text-xs font-semibold text-indigo-300 transition hover:text-indigo-200">
                    View all
                  </Link>
                </div>

                {stats.recentStudents.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-sm text-slate-400">
                      No student records found yet.
                    </p>
                    <Link
                      href="/students/new"
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-950 transition hover:bg-indigo-400"
                    >
                      <Plus className="w-4 h-4" />
                      Add First Student
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          <th className="px-5 py-3.5 font-semibold sm:px-6">Name</th>
                          <th className="px-4 py-3.5 font-semibold">Email</th>
                          <th className="px-4 py-3.5 font-semibold">Course(s)</th>
                          <th className="px-5 py-3.5 font-semibold sm:px-6">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 text-sm">
                        {stats.recentStudents.map((student) => {
                          const courseList =
                            student.enrollments
                              .map((e) => e.courseCode)
                              .join(', ') || 'None';
                          const primaryStatus =
                            student.enrollments[0]?.status || 'ACTIVE';

                          return (
                            <tr key={student.id} className="transition hover:bg-slate-800/40">
                              <td className="px-5 py-4 sm:px-6">
                                <Link href={`/students/${student.id}`} className="flex items-center gap-3 font-semibold text-slate-200 transition hover:text-indigo-300">
                                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-indigo-400/10 text-xs font-bold text-indigo-300 ring-1 ring-inset ring-indigo-400/15">
                                    {student.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}
                                  </span>
                                  {student.name}
                                </Link>
                              </td>
                              <td className="px-4 py-4 text-slate-400">
                                {student.email}
                              </td>
                              <td className="px-4 py-4 text-slate-400">
                                {courseList}
                              </td>
                              <td className="px-5 py-4 sm:px-6">
                                <StatusBadge status={primaryStatus} />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-surface/90 p-5 shadow-lg shadow-black/10 sm:p-6">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-indigo-300">Shortcuts</p>
                  <h2 className="mb-5 text-lg font-bold tracking-tight text-slate-100">
                    Quick Actions
                  </h2>
                  <div className="space-y-3">
                    <Link
                      href="/students/new"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-950 transition hover:bg-indigo-400"
                    >
                      <Plus className="w-4 h-4" />
                      Add Student
                    </Link>
                    <Link
                      href="/students"
                      className="flex w-full items-center justify-center rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800"
                    >
                      View Students
                    </Link>
                    <Link
                      href="/students"
                      className="flex w-full items-center justify-center rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800"
                    >
                      Manage Enrollments
                    </Link>
                  </div>
                </div>

                <div className="mt-8 border-t border-slate-800 pt-4 text-xs leading-relaxed text-slate-500">
                  All student writes are protected by Prisma transactions and
                  server-side validation.
                </div>
              </section>
            </div>
          </>
        )
      )}
    </div>
  );
}