import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CourseForm } from '@/components/courses/CourseForm';

export default function NewCoursePage() {
  return (
    <div className="space-y-7">
      <header>
        <Link
          href="/courses"
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-indigo-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Course Catalog
        </Link>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-indigo-300">
          Student Hub / Catalog
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Add Course
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Create a course record for the student catalog.
        </p>
      </header>

      <CourseForm />
    </div>
  );
}
