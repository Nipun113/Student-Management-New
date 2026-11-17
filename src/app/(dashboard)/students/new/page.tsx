import React from 'react';
import Link from 'next/link';
import { StudentForm } from '@/components/students/StudentForm';
import { ArrowLeft } from 'lucide-react';

export default function NewStudentPage() {
  return (
    <div className="space-y-7">
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
          Add New Student
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Create a new student profile and assign initial course enrollments.
        </p>
      </div>

      <StudentForm mode="create" />
    </div>
  );
}