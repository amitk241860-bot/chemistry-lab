import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getExperimentById, ALL_EXPERIMENTS } from '@/lib/experiments';
import { NobookWorkbench } from '@/components/laboratory/NobookWorkbench';

interface PageProps {
  params: Promise<{
    experimentId: string;
  }>;
}

export function generateStaticParams() {
  return ALL_EXPERIMENTS.map((exp) => ({
    experimentId: exp.id,
  }));
}

export default async function ExperimentPage({ params }: PageProps) {
  const resolvedParams = await params;
  const experiment = getExperimentById(resolvedParams.experimentId);

  if (!experiment) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-400">Loading Laboratory Workbench...</div>}>
      <NobookWorkbench experiment={experiment} />
    </Suspense>
  );
}
