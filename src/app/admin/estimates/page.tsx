import BusinessDocumentPage from '@/components/admin/BusinessDocumentPage';

export default function EstimatesPage() {
  return <BusinessDocumentPage title="Estimates" description="Create and track customer estimates." endpoint="/api/estimates" />;
}
