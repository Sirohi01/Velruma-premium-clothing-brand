import Phase9ModulePage from '@/components/admin/Phase9ModulePage';

export default function StockTransfersPage() {
  return (
    <Phase9ModulePage
      title="Stock Transfers"
      description="Move inventory between warehouses with status and audit trail."
      endpoint="/api/stock-transfers"
      defaults={{ status: 'draft', quantity: 0, isActive: true }}
      fields={[
        { key: 'transferNumber', label: 'Transfer Number', required: true },
        { key: 'fromWarehouse', label: 'From Warehouse' },
        { key: 'toWarehouse', label: 'To Warehouse' },
        { key: 'product', label: 'Product' },
        { key: 'variant', label: 'Variant' },
        { key: 'quantity', label: 'Quantity', type: 'number' },
        { key: 'status', label: 'Status', type: 'select', options: ['draft', 'in_transit', 'received', 'cancelled'] },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ]}
      columns={[
        { key: 'transferNumber', label: 'Transfer' },
        { key: 'fromWarehouse', label: 'From' },
        { key: 'toWarehouse', label: 'To' },
        { key: 'quantity', label: 'Qty' },
        { key: 'status', label: 'Status', type: 'status' },
      ]}
    />
  );
}
