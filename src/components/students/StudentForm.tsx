'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CourseOptionDTO,
  EnrollmentStatusType,
  StudentDTO,
} from '@/types';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface StudentFormProps {
  mode: 'create' | 'edit';
  initialStudent?: StudentDTO;
}

export function StudentForm({ mode, initialStudent }: StudentFormProps) {
  const router = useRouter();

  const [name, setName] = useState(initialStudent?.name ?? '');
  const [email, setEmail] = useState(initialStudent?.email ?? '');
  const [phone, setPhone] = useState(initialStudent?.phone ?? '');
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>(
    initialStudent?.enrollments.map((e) => e.courseId) ?? []
  );
  const [enrollmentStatuses, setEnrollmentStatuses] = useState<
    Record<number, EnrollmentStatusType>
  >(() => {
    const initialMap: Record<number, EnrollmentStatusType> = {};
    initialStudent?.enrollments.forEach((e) => {
      initialMap[e.courseId] = e.status;
    });
    return initialMap;
  });

  const [courses, setCourses] = useState<CourseOptionDTO[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchActiveCourses() {
      try {
        const res = await fetch('/api/courses?active=true');
        const json = await res.json();
        if (res.ok && json.data) {
          setCourses(json.data);
        } else {
          setGeneralError('Unable to load active courses.');
        }
      } catch {
        setGeneralError('Network error while loading courses.');
      } finally {
        setLoadingCourses(false);
      }
    }
    fetchActiveCourses();
  }, []);

  const toggleCourse = (courseId: number) => {
    setSelectedCourseIds((prev) => {
      if (prev.includes(courseId)) {
        return prev.filter((id) => id !== courseId);
      } else {
        setEnrollmentStatuses((statusMap) => ({
          ...statusMap,
          [courseId]: statusMap[courseId] || 'ACTIVE',
        }));
        return [...prev, courseId];
      }
    });
    setFieldErrors((prev) => ({ ...prev, courseIds: '' }));
  };

  const handleStatusChange = (
    courseId: number,
    status: EnrollmentStatusType
  ) => {
    setEnrollmentStatuses((prev) => ({
      ...prev,
      [courseId]: status,
    }));
  };

  const validateClientSide = (): boolean => {
    const errors: Record<string, string> = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (trimmedName.length < 2) {
      errors.name = 'Name must be at least 2 characters long.';
    } else if (trimmedName.length > 150) {
      errors.name = 'Name cannot exceed 150 characters.';
    }

    if (!trimmedEmail) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (trimmedPhone && !/^[0-9+\-\s()]{1,20}$/.test(trimmedPhone)) {
      errors.phone =
        'Phone can only contain digits, spaces, +, -, () and max 20 chars.';
    }

    if (selectedCourseIds.length === 0) {
      errors.courseIds = 'Please select at least one active course.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setGeneralError(null);
    setSuccessMessage(null);

    if (!validateClientSide()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint =
        mode === 'create'
          ? '/api/students'
          : `/api/students/${initialStudent?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || null,
        courseIds: selectedCourseIds,
        ...(mode === 'edit' ? { enrollmentStatuses } : {}),
      };

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.error?.fields) {
          setFieldErrors(json.error.fields);
        }
        setGeneralError(
          json.error?.message || 'Please check the form for errors.'
        );
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage(
        mode === 'create'
          ? 'Student record created successfully! Redirecting...'
          : 'Student record updated successfully! Redirecting...'
      );

      setTimeout(() => {
        router.push('/students');
        router.refresh();
      }, 900);
    } catch {
      setGeneralError(
        'A network error occurred while saving the student record.'
      );
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="max-w-3xl overflow-hidden rounded-2xl border border-slate-800 bg-surface/90 shadow-lg shadow-black/10"
    >
      <div className="border-b border-slate-800 bg-slate-900/35 px-5 py-5 sm:px-8">
        <p className="text-sm font-bold text-slate-100">Student information</p>
        <p className="mt-1 text-xs text-slate-500">Enter the student&apos;s profile details and course enrollment.</p>
      </div>
      <div className="p-5 sm:p-8">
      {generalError && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-xl border border-rose-900/70 bg-rose-950/40 p-4 text-sm text-rose-200"
        >
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Validation or Submission Error</p>
            <p className="mt-0.5">{generalError}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-900/70 bg-emerald-950/40 p-4 text-sm text-emerald-200"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="font-medium">{successMessage}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Full Name */}
        <div>
          <label
            htmlFor="student-name"
            className="mb-2 block text-sm font-semibold text-slate-300"
          >
            Full Name <span className="text-red-600">*</span>
          </label>
          <input
            id="student-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setFieldErrors((prev) => ({ ...prev, name: '' }));
            }}
            placeholder="e.g., Amaya Perera"
            className={`w-full rounded-xl border bg-control px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:ring-4 ${
              fieldErrors.name
                ? 'border-rose-500 focus:ring-rose-500/10'
                : 'border-slate-700 focus:border-indigo-400 focus:ring-indigo-400/10'
            }`}
          />
          {fieldErrors.name && (
            <p className="mt-1.5 text-xs font-medium text-red-600">
              {fieldErrors.name}
            </p>
          )}
        </div>

        {/* Email Address */}
        <div>
          <label
            htmlFor="student-email"
            className="mb-2 block text-sm font-semibold text-slate-300"
          >
            Email Address <span className="text-red-600">*</span>
          </label>
          <input
            id="student-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFieldErrors((prev) => ({ ...prev, email: '' }));
            }}
            placeholder="e.g., amaya@example.com"
            className={`w-full rounded-xl border bg-control px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:ring-4 ${
              fieldErrors.email
                ? 'border-rose-500 focus:ring-rose-500/10'
                : 'border-slate-700 focus:border-indigo-400 focus:ring-indigo-400/10'
            }`}
          />
          {fieldErrors.email && (
            <p className="mt-1.5 text-xs font-medium text-red-600">
              {fieldErrors.email}
            </p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label
            htmlFor="student-phone"
            className="mb-2 block text-sm font-semibold text-slate-300"
          >
            Phone Number{' '}
            <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            id="student-phone"
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setFieldErrors((prev) => ({ ...prev, phone: '' }));
            }}
            placeholder="e.g., 077 123 4567"
            className={`w-full rounded-xl border bg-control px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:ring-4 ${
              fieldErrors.phone
                ? 'border-rose-500 focus:ring-rose-500/10'
                : 'border-slate-700 focus:border-indigo-400 focus:ring-indigo-400/10'
            }`}
          />
          {fieldErrors.phone && (
            <p className="mt-1.5 text-xs font-medium text-red-600">
              {fieldErrors.phone}
            </p>
          )}
        </div>

        {/* Active Courses Multi-Select */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <label className="block text-sm font-semibold text-slate-300">
              Course Enrollments <span className="text-red-600">*</span>
            </label>
            <span className="rounded-full bg-indigo-400/10 px-2.5 py-1 text-xs font-semibold text-indigo-300">
              {selectedCourseIds.length} selected
            </span>
          </div>

          {loadingCourses ? (
            <div className="flex items-center gap-2 py-4 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-300" />
              Loading available active courses...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {courses.map((course) => {
                const isSelected = selectedCourseIds.includes(course.id);
                const currentStatus =
                  enrollmentStatuses[course.id] || 'ACTIVE';

                return (
                  <div
                    key={course.id}
                    className={`flex flex-col justify-between gap-3 rounded-xl border p-4 transition sm:flex-row sm:items-center ${
                      isSelected
                        ? 'border-indigo-400/50 bg-indigo-400/10 shadow-sm shadow-indigo-950/30'
                        : 'border-slate-700 bg-control hover:border-slate-600 hover:bg-slate-900/80'
                    }`}
                  >
                    <label className="flex items-start gap-3 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCourse(course.id)}
                        className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-indigo-400 focus:ring-indigo-500"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-100">
                            {course.code}
                          </span>
                          <span className="text-sm text-slate-300">
                            — {course.name}
                          </span>
                        </div>
                        {course.description && (
                          <p className="mt-0.5 text-xs text-slate-500">
                            {course.description}
                          </p>
                        )}
                      </div>
                    </label>

                    {mode === 'edit' && isSelected && (
                      <div className="mt-3 sm:mt-0 sm:ml-4 flex items-center gap-2">
                        <label
                          htmlFor={`status-${course.id}`}
                          className="text-xs font-medium text-slate-400"
                        >
                          Status:
                        </label>
                        <select
                          id={`status-${course.id}`}
                          value={currentStatus}
                          onChange={(e) =>
                            handleStatusChange(
                              course.id,
                              e.target.value as EnrollmentStatusType
                            )
                          }
                          className="rounded-lg border border-slate-700 bg-control px-2.5 py-1.5 text-xs font-medium text-slate-200 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/10"
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="WITHDRAWN">WITHDRAWN</option>
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {fieldErrors.courseIds && (
            <p className="mt-2 text-xs font-medium text-red-600">
              {fieldErrors.courseIds}
            </p>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-800 pt-6">
        <Link
          href="/students"
          className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting || loadingCourses}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-950 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {mode === 'create' ? 'Save Student' : 'Update Student'}
        </button>
      </div>
      </div>
    </form>
  );
}