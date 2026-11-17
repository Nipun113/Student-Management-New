import { BookOpen, GraduationCap, Plus } from 'lucide-react';
import Link from 'next/link';
import { getCourses } from '@/services/course.service';

export const dynamic = 'force-dynamic';

export default async function CoursesPage() {
  let courses = null;
  let error = false;

  try {
    courses = await getCourses(false);
  } catch {
    error = true;
  }

  const activeCourses = courses?.filter((course) => course.is_active).length ?? 0;
  const archivedCourses = (courses?.length ?? 0) - activeCourses;

  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-indigo-300">
            Student Hub / Catalog
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Courses
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Browse available programs and course details.
          </p>
        </div>
        <Link
          href="/courses/new"
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-950 transition hover:bg-indigo-400 sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Course
        </Link>
      </header>

      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-rose-900/70 bg-rose-950/40 p-6 text-sm text-rose-200"
        >
          Unable to load the course catalog. Please verify your database connection.
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Total courses', value: courses?.length ?? 0, icon: BookOpen },
              { label: 'Available', value: activeCourses, icon: GraduationCap },
              { label: 'Archived', value: archivedCourses, icon: BookOpen },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-surface/90 p-5 shadow-lg shadow-black/10"
                >
                  <div className="rounded-xl bg-indigo-400/10 p-3 text-indigo-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400">{item.label}</p>
                    <p className="mt-1 text-2xl font-bold tracking-tight text-white">
                      {item.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-800 bg-surface/90 shadow-lg shadow-black/10">
            <div className="border-b border-slate-800 px-5 py-5 sm:px-6">
              <h2 className="text-base font-bold text-slate-100">Course catalog</h2>
              <p className="mt-1 text-xs text-slate-500">
                {courses?.length ?? 0} programs in the catalog
              </p>
            </div>

            {courses?.length ? (
              <div className="grid gap-px bg-slate-800/70 sm:grid-cols-2">
                {courses.map((course) => (
                  <article
                    key={course.id}
                    className="flex min-h-40 gap-4 bg-surface p-5 transition hover:bg-slate-900/80 sm:p-6"
                  >
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-400/10 text-indigo-300 ring-1 ring-inset ring-indigo-400/10">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-slate-800 px-2 py-1 text-[10px] font-bold tracking-wide text-slate-300">
                          {course.code}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${
                            course.is_active
                              ? 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/20'
                              : 'bg-slate-700/40 text-slate-400 ring-slate-500/20'
                          }`}
                        >
                          {course.is_active ? 'Active' : 'Archived'}
                        </span>
                      </div>
                      <h3 className="font-semibold leading-6 text-slate-100">
                        {course.name}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {course.description || 'No description available for this course.'}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="px-6 py-14 text-center">
                <BookOpen className="mx-auto h-9 w-9 text-slate-600" />
                <h3 className="mt-3 text-sm font-semibold text-slate-200">
                  No courses found
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  The course catalog is empty.
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
