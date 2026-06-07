import Phase9ModulePage from '@/components/admin/Phase9ModulePage';

export default function BrandsPage() {
  return (
    <Phase9ModulePage
      title="Multi-Brand System"
      description="Manage VELRUMA, VELRUMA KIDS, VELRUMA SPORTS and future brand segments."
      endpoint="/api/brands"
      defaults={{ segment: 'core', isDefault: false, isActive: true }}
      fields={[
        { key: 'name', label: 'Brand Name', required: true },
        { key: 'slug', label: 'Slug', required: true },
        { key: 'segment', label: 'Segment', type: 'select', options: ['core', 'kids', 'sports', 'premium', 'other'] },
        { key: 'logo', label: 'Logo URL' },
        { key: 'primaryColor', label: 'Primary Color' },
        { key: 'supportEmail', label: 'Support Email' },
        { key: 'isDefault', label: 'Default Brand', type: 'checkbox' },
      ]}
      columns={[
        { key: 'name', label: 'Brand' },
        { key: 'slug', label: 'Slug' },
        { key: 'segment', label: 'Segment', type: 'status' },
        { key: 'isDefault', label: 'Default', type: 'boolean' },
      ]}
    />
  );
}
