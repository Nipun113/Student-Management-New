'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export function CourseForm() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setFieldErrors({});
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          name,
          description: description || null,
          isActive,
        }),
      });
      const json = await response.json();

      if (!response.ok) {
        if (json.error?.fields) setFieldErrors(json.error.fields);
        setError(json.error?.message || 'Unable to create the course.');
        return;
      }

      setSuccess(true);
      router.push('/courses');
      router.refresh();
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'A network error occurred while creating the course.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClassName =
    'w-full rounded-xl border border-slate-700 bg-control px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10';

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl overflow-hidden rounded-2xl border border-slate-800 bg-surface/90 shadow-lg shadow-black/10"
    >
      <div className="border-b border-slate-800 bg-slate-900/35 px-5 py-5 sm:px-8">
        <h2 className="text-sm font-bold text-slate-100">Course details</h2>
        <p className="mt-1 text-xs text-slate-500">
          Add a course to the catalog and choose whether it is open for enrollment.
        </p>
      </div>

      <div className="space-y-6 p-5 sm:p-8">
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-rose-900/70 bg-rose-950/40 p-4 text-sm text-rose-200"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" />
            <div className="min-w-0">
              <p>{error}</p>
              {Object.entries(fieldErrors).map(([field, message]) => (
                <p key={field} className="mt-1 text-rose-300">
                  {message}
                </p>
              ))}
            </div>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="flex items-center gap-3 rounded-xl border border-emerald-900/70 bg-emerald-950/40 p-4 text-sm text-emerald-200"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            Course created successfully.
          </div>
        )}

        <div>
          <label
            htmlFor="course-code"
            className="mb-2 block text-sm font-semibold text-slate-300"
          >
            Course code <span className="text-rose-400">*</span>
          </label>
          <input
            id="course-code"
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              setFieldErrors((current) => ({ ...current, code: '' }));
            }}
            placeholder="e.g. HNDIT"
            maxLength={20}
            required
            aria-invalid={Boolean(fieldErrors.code)}
            aria-describedby={fieldErrors.code ? 'course-code-error' : undefined}
            className={inputClassName}
          />
          {fieldErrors.code && (
            <p id="course-code-error" className="mt-1.5 text-xs text-rose-300">
              {fieldErrors.code}
            </p>
          )}
          <p className="mt-1.5 text-xs text-slate-500">
            Unique identifier; letters, numbers, and hyphens are accepted.
          </p>
        </div>

        <div>
          <label
            htmlFor="course-name"
            className="mb-2 block text-sm font-semibold text-slate-300"
          >
            Course name <span className="text-rose-400">*</span>
          </label>
          <input
            id="course-name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setFieldErrors((current) => ({ ...current, name: '' }));
            }}
            placeholder="e.g. Higher National Diploma in Information Technology"
            maxLength={150}
            required
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? 'course-name-error' : undefined}
            className={inputClassName}
          />
          {fieldErrors.name && (
            <p id="course-name-error" className="mt-1.5 text-xs text-rose-300">
              {fieldErrors.name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="course-description"
            className="mb-2 block text-sm font-semibold text-slate-300"
          >
            Description <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <textarea
            id="course-description"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setFieldErrors((current) => ({ ...current, description: '' }));
            }}
            placeholder="Briefly describe the program..."
            rows={4}
            maxLength={5000}
            className={inputClassName}
          />
          {fieldErrors.description && (
            <p className="mt-1.5 text-xs text-rose-300">
              {fieldErrors.description}
            </p>
          )}
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-slate-900 text-indigo-400 focus:ring-indigo-500"
          />
          <span>
            <span className="block text-sm font-semibold text-slate-200">
              Available for enrollment
            </span>
            <span className="mt-1 block text-xs text-slate-500">
              Inactive courses stay in the catalog but cannot be newly assigned.
            </span>
          </span>
        </label>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-6 sm:flex-row sm:justify-end">
          <Link
            href="/courses"
            className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-center text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-950 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Add course
          </button>
        </div>
      </div>
    </form>
  );
}
