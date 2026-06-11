import Phase9ModulePage from '@/components/admin/Phase9ModulePage';

export default function BrandsPage() {
  return (
    <Phase9ModulePage
      title="Multi-Brand System"
      description="Manage VELRUMA, VELRUMA KIDS, VELRUMA SPORTS and future brand segments."
      endpoint="/api/brands"
      defaults={{ segment: 'core', primaryColor: '#0f172a', secondaryColor: '#ffffff', accentColor: '#c9a84c', fontFamily: 'Inter', isDefault: false, isActive: true }}
      fields={[
        { key: 'name', label: 'Brand Name', required: true },
        { key: 'slug', label: 'Slug', required: true },
        { key: 'segment', label: 'Segment', type: 'select', options: ['core', 'kids', 'sports', 'premium', 'other'] },
        { key: 'logo', label: 'Logo URL' },
        { key: 'favicon', label: 'Favicon URL' },
        { key: 'domain', label: 'Domain' },
        { key: 'primaryColor', label: 'Primary Color' },
        { key: 'secondaryColor', label: 'Secondary Color' },
        { key: 'accentColor', label: 'Accent Color' },
        { key: 'fontFamily', label: 'Font Family' },
        { key: 'supportEmail', label: 'Support Email' },
        { key: 'supportPhone', label: 'Support Phone' },
        { key: 'seoTitle', label: 'SEO Title' },
        { key: 'seoDescription', label: 'SEO Description', type: 'textarea' },
        { key: 'isDefault', label: 'Default Brand', type: 'checkbox' },
      ]}
      columns={[
        { key: 'name', label: 'Brand' },
        { key: 'slug', label: 'Slug' },
        { key: 'segment', label: 'Segment', type: 'status' },
        { key: 'domain', label: 'Domain' },
        { key: 'isDefault', label: 'Default', type: 'boolean' },
      ]}
    />
  );
}
