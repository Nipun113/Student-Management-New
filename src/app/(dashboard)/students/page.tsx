'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  CourseOptionDTO,
  PaginatedStudentsDTO,
  StudentDTO,
} from '@/types';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import {
  Plus,
  Search,
  Loader2,
  AlertCircle,
  UserPlus,
} from 'lucide-react';

export default function StudentDirectoryPage() {
  const [students, setStudents] = useState<StudentDTO[]>([]);
  const [courses, setCourses] = useState<CourseOptionDTO[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [page, setPage] = useState(1);
  const limit = 5;

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Delete confirmation modal state
  const [studentToDelete, setStudentToDelete] = useState<StudentDTO | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Load courses for filter dropdown
  useEffect(() => {
    fetch('/api/courses?active=true')
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setCourses(json.data);
      })
      .catch(() => {});
  }, []);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (selectedCourseId) params.set('courseId', selectedCourseId);

      const res = await fetch(`/api/students?${params.toString()}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error?.message || 'Failed to load student records.');
      }

      const data: PaginatedStudentsDTO = json.data;
      setStudents(data.students);
      setPagination(data.pagination);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Unable to fetch student directory.'
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, selectedCourseId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data loading is intentionally triggered from the effect lifecycle.
    fetchStudents();
  }, [fetchStudents]);

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/students/${studentToDelete.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Failed to delete student.');
      }
      setToast(`Deleted "${studentToDelete.name}" successfully.`);
      setStudentToDelete(null);
      fetchStudents();
      setTimeout(() => setToast(null), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not delete student.');
    } finally {
      setIsDeleting(false);
    }
  };

  const startIdx =
    pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const endIdx = Math.min(
    pagination.total,
    pagination.page * pagination.limit
  );

  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-indigo-300">
            Student Hub / Directory
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Students
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Manage student records and course enrollments.
          </p>
        </div>
        <Link
          href="/students/new"
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-950 transition hover:bg-indigo-400 sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Student
        </Link>
      </div>

      {toast && (
        <div
          role="status"
          className="rounded-xl border border-emerald-900/70 bg-emerald-950/40 p-4 text-sm font-medium text-emerald-200"
        >
          {toast}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-surface/90 shadow-lg shadow-black/10">
        <div className="flex flex-col gap-3 border-b border-slate-800 bg-slate-900/35 p-4 sm:flex-row sm:p-5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or phone..."
              aria-label="Search students by name, email, or phone"
              className="w-full rounded-xl border border-slate-700 bg-control py-3 pl-10 pr-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10"
            />
          </div>

          <select
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by course"
            className="rounded-xl border border-slate-700 bg-control px-4 py-3 text-sm text-slate-300 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10"
          >
            <option value="">All courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between gap-3 px-5 pb-4 pt-5 sm:px-6">
          <div>
            <h2 className="text-base font-bold text-slate-100">Student Directory</h2>
            <p className="mt-1 text-xs text-slate-500">
              Browse and manage student profiles
            </p>
          </div>
          <span className="rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1.5 text-xs font-semibold text-slate-300">
            {pagination.total} {pagination.total === 1 ? 'record' : 'records'}
          </span>
        </div>

        {error ? (
          <div className="mx-5 mb-5 flex items-center gap-3 rounded-xl border border-rose-900/70 bg-rose-950/40 p-5 text-rose-200 sm:mx-6">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-300" />
            <p className="text-sm">Loading student records...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="mx-5 mb-5 rounded-2xl border border-dashed border-slate-700 py-12 text-center sm:mx-6">
            <UserPlus className="mx-auto mb-3 h-9 w-9 text-slate-600" />
            <h3 className="text-sm font-semibold text-slate-200">
              No student records found
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-400">
              {debouncedSearch || selectedCourseId
                ? 'No students matched your search criteria. Try clearing your filters.'
                : 'Get started by adding your first student record to the system.'}
            </p>
            <div className="mt-4">
              <Link
                href="/students/new"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-400"
              >
                <Plus className="w-4 h-4" />
                Add New Student
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-y border-slate-800 bg-slate-900/50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3.5 font-semibold sm:px-6">Student</th>
                    <th className="px-4 py-3.5 font-semibold">Email</th>
                    <th className="px-4 py-3.5 font-semibold">Phone</th>
                    <th className="px-4 py-3.5 font-semibold">Courses</th>
                    <th className="px-5 py-3.5 text-right font-semibold sm:px-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-sm">
                  {students.map((student) => {
                    const courseCodes =
                      student.enrollments
                        .map((e) => e.courseCode)
                        .join(', ') || '—';

                    return (
                      <tr key={student.id} className="transition hover:bg-slate-800/40">
                        <td className="px-5 py-4 sm:px-6">
                          <Link href={`/students/${student.id}`} className="flex items-center gap-3 font-semibold text-slate-200 transition hover:text-indigo-300">
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-indigo-400/10 text-xs font-bold text-indigo-300 ring-1 ring-inset ring-indigo-400/15">
                              {student.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}
                            </span>
                            <span>
                              {student.name}
                              <span className="mt-0.5 block text-[11px] font-medium text-slate-500">ID #{student.id}</span>
                            </span>
                          </Link>
                        </td>
                        <td className="px-4 py-4 text-slate-400">
                          {student.email}
                        </td>
                        <td className="px-4 py-4 text-slate-400">
                          {student.phone || '—'}
                        </td>
                        <td className="px-4 py-4 text-slate-400">
                          <span className="inline-flex max-w-[180px] truncate rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">{courseCodes}</span>
                        </td>
                        <td className="space-x-3 whitespace-nowrap px-5 py-4 text-right text-xs font-semibold sm:px-6">
                          <Link
                            href={`/students/${student.id}`}
                            className="text-indigo-300 transition hover:text-indigo-200"
                          >
                            View
                          </Link>
                          <Link
                            href={`/students/${student.id}/edit`}
                            className="text-slate-400 transition hover:text-indigo-300"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => setStudentToDelete(student)}
                            className="cursor-pointer text-rose-400 transition hover:text-rose-300"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-800 px-5 py-4 text-xs text-slate-400 sm:flex-row sm:px-6">
              <span>
                Showing {startIdx}-{endIdx} of {pagination.total}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page <= 1}
                  className="cursor-pointer rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 font-semibold text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={pagination.page >= pagination.totalPages}
                  className="cursor-pointer rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 font-semibold text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      <DeleteConfirmModal
        isOpen={Boolean(studentToDelete)}
        studentName={studentToDelete?.name || ''}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setStudentToDelete(null)}
      />
    </div>
  );
}