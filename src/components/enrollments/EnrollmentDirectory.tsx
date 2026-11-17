'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Loader2,
  Search,
  Users,
} from 'lucide-react';
import { PaginatedEnrollmentsDTO, EnrollmentDTO } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';

const pageSize = 10;

export function EnrollmentDirectory() {
  const [enrollments, setEnrollments] = useState<EnrollmentDTO[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: pageSize,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
      });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (status) params.set('status', status);

      const response = await fetch(`/api/enrollments?${params.toString()}`);
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error?.message || 'Failed to load enrollments.');
      }

      const data: PaginatedEnrollmentsDTO = json.data;
      setEnrollments(data.enrollments);
      setPagination(data.pagination);
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to load enrollment records.'
      );
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data loading is intentionally triggered from the effect lifecycle.
    fetchEnrollments();
  }, [fetchEnrollments]);

  const startIndex =
    pagination.total === 0 ? 0 : (pagination.page - 1) * pageSize + 1;
  const endIndex = Math.min(pagination.total, pagination.page * pageSize);

  return (
    <div className="space-y-7">
      <header>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-indigo-300">
          Student Hub / Records
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Enrollments
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Track student registrations across the course catalog.
        </p>
      </header>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-surface/90 shadow-lg shadow-black/10">
        <div className="flex flex-col gap-3 border-b border-slate-800 bg-slate-900/35 p-4 sm:flex-row sm:p-5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search students or courses..."
              aria-label="Search enrollments by student or course"
              className="w-full rounded-xl border border-slate-700 bg-control py-3 pl-10 pr-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10"
            />
          </div>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            aria-label="Filter enrollments by status"
            className="rounded-xl border border-slate-700 bg-control px-4 py-3 text-sm text-slate-300 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10"
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="WITHDRAWN">Withdrawn</option>
          </select>
        </div>

        <div className="flex items-center justify-between gap-3 px-5 pb-4 pt-5 sm:px-6">
          <div>
            <h2 className="text-base font-bold text-slate-100">
              Enrollment records
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Manage enrollment status from the student profile.
            </p>
          </div>
          <span className="rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1.5 text-xs font-semibold text-slate-300">
            {pagination.total} {pagination.total === 1 ? 'record' : 'records'}
          </span>
        </div>

        {error ? (
          <div
            role="alert"
            className="mx-5 mb-5 flex items-center gap-3 rounded-xl border border-rose-900/70 bg-rose-950/40 p-5 text-rose-200 sm:mx-6"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-300" />
            <p className="text-sm">{error}</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-300" />
            <p className="text-sm">Loading enrollment records...</p>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="mx-5 mb-5 rounded-2xl border border-dashed border-slate-700 py-12 text-center sm:mx-6">
            <BookOpen className="mx-auto mb-3 h-9 w-9 text-slate-600" />
            <h3 className="text-sm font-semibold text-slate-200">
              No enrollments found
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-400">
              Try changing your search or status filter, or add an enrollment
              from a student profile.
            </p>
            <Link
              href="/students"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-400"
            >
              <Users className="h-4 w-4" />
              View students
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-y border-slate-800 bg-slate-900/50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3.5 font-semibold sm:px-6">Student</th>
                    <th className="px-4 py-3.5 font-semibold">Course</th>
                    <th className="px-4 py-3.5 font-semibold">Enrolled</th>
                    <th className="px-4 py-3.5 font-semibold">Status</th>
                    <th className="px-5 py-3.5 text-right font-semibold sm:px-6">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-sm">
                  {enrollments.map((enrollment) => (
                    <tr
                      key={enrollment.id}
                      className="transition hover:bg-slate-800/40"
                    >
                      <td className="px-5 py-4 sm:px-6">
                        <Link
                          href={`/students/${enrollment.studentId}`}
                          className="flex items-center gap-3 font-semibold text-slate-200 transition hover:text-indigo-300"
                        >
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-indigo-400/10 text-xs font-bold text-indigo-300 ring-1 ring-inset ring-indigo-400/15">
                            {enrollment.studentName
                              .split(/\s+/)
                              .slice(0, 2)
                              .map((part) => part[0])
                              .join('')
                              .toUpperCase()}
                          </span>
                          <span>
                            {enrollment.studentName}
                            <span className="mt-0.5 block text-[11px] font-medium text-slate-500">
                              {enrollment.studentEmail}
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          href="/courses"
                          className="font-semibold text-slate-200 transition hover:text-indigo-300"
                        >
                          {enrollment.courseCode}
                          <span className="mt-0.5 block max-w-56 truncate text-xs font-normal text-slate-500">
                            {enrollment.courseName}
                          </span>
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-400">
                        {new Date(enrollment.enrolledAt).toLocaleDateString(
                          'en-US',
                          { year: 'numeric', month: 'short', day: 'numeric' }
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={enrollment.status} />
                      </td>
                      <td className="px-5 py-4 text-right sm:px-6">
                        <Link
                          href={`/students/${enrollment.studentId}/edit`}
                          className="text-xs font-semibold text-indigo-300 transition hover:text-indigo-200"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-800 px-5 py-4 text-xs text-slate-400 sm:flex-row sm:px-6">
              <span>
                Showing {startIndex}-{endIndex} of {pagination.total}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={pagination.page <= 1}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-semibold text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPage((current) =>
                      Math.min(pagination.totalPages, current + 1)
                    )
                  }
                  disabled={pagination.page >= pagination.totalPages}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-semibold text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
