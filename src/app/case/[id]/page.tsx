// app/case/[id]/page.tsx - полная версия
import { getCaseById, getNextCaseId, FormattedCase } from '@/lib/database';
import { notFound } from 'next/navigation';
import CaseDetailClient from './CaseDetailClient';

interface CaseDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { id } = await params;
  
  const caseId = parseInt(id);
  
  if (isNaN(caseId)) {
    notFound();
  }

  const formattedCase = await getCaseById(caseId);
  const nextCaseId = await getNextCaseId(caseId);

  if (!formattedCase) {
    notFound();
  }

  return (
    <CaseDetailClient 
      caseData={formattedCase} 
      nextCaseId={nextCaseId}
    />
  );
}