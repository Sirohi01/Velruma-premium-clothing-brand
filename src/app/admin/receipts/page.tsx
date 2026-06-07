import BusinessDocumentPage from '@/components/admin/BusinessDocumentPage';

export default function ReceiptsPage() {
  return <BusinessDocumentPage title="Receipts" description="Create and track payment receipts." endpoint="/api/receipts" />;
}
