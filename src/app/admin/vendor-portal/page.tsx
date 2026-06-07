import Phase9ModulePage from '@/components/admin/Phase9ModulePage';

export default function VendorPortalPage() {
  return (
    <Phase9ModulePage
      title="Vendor Portal"
      description="Supplier portal access for PO visibility, delivery updates and document uploads."
      endpoint="/api/vendor-portal"
      defaults={{ accessStatus: 'invited', allowedActions: ['view_po'], isActive: true }}
      fields={[
        { key: 'supplierName', label: 'Supplier Name', required: true },
        { key: 'supplierCode', label: 'Supplier Code' },
        { key: 'contactName', label: 'Contact Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'accessStatus', label: 'Access Status', type: 'select', options: ['invited', 'active', 'suspended'] },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ]}
      columns={[
        { key: 'supplierName', label: 'Supplier' },
        { key: 'supplierCode', label: 'Code' },
        { key: 'contactName', label: 'Contact' },
        { key: 'accessStatus', label: 'Access', type: 'status' },
      ]}
    />
  );
}
