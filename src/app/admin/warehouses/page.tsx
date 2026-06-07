import Phase9ModulePage from '@/components/admin/Phase9ModulePage';

export default function WarehousesPage() {
  return (
    <Phase9ModulePage
      title="Warehouses"
      description="Manage multiple warehouses, managers, stock capacity and active locations."
      endpoint="/api/warehouses"
      defaults={{ capacity: 0, isDefault: false, isActive: true }}
      fields={[
        { key: 'name', label: 'Warehouse Name', required: true },
        { key: 'code', label: 'Code', required: true },
        { key: 'manager', label: 'Manager' },
        { key: 'phone', label: 'Phone' },
        { key: 'city', label: 'City' },
        { key: 'state', label: 'State' },
        { key: 'capacity', label: 'Capacity', type: 'number' },
        { key: 'isDefault', label: 'Default Warehouse', type: 'checkbox' },
      ]}
      columns={[
        { key: 'name', label: 'Warehouse' },
        { key: 'code', label: 'Code' },
        { key: 'manager', label: 'Manager' },
        { key: 'city', label: 'City' },
        { key: 'capacity', label: 'Capacity' },
      ]}
    />
  );
}
