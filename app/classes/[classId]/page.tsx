import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { CURRICULUM } from '@/data/curriculum';
import { getExperimentsByClass } from '@/lib/experiments';
import type { ClassId } from '@/types/experiment';
import ClassClientView from './ClassClientView';

interface PageProps {
  params: Promise<{ classId: string }>;
}

export function generateStaticParams() {
  return [
    { classId: '9' },
    { classId: '10' },
    { classId: '11' },
    { classId: '12' },
  ];
}

export default async function ClassPage({ params }: PageProps) {
  const resolvedParams = await params;
  const classNum = parseInt(resolvedParams.classId, 10) as ClassId;

  if (![9, 10, 11, 12].includes(classNum)) {
    notFound();
  }

  const curriculum = CURRICULUM[classNum];
  const experiments = getExperimentsByClass(classNum);

  return (
    <Suspense fallback={<div className="text-sm text-slate-400">Loading practicals...</div>}>
      <ClassClientView curriculum={curriculum} experiments={experiments} />
    </Suspense>
  );
}
