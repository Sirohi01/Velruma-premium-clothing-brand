import Phase9ModulePage from '@/components/admin/Phase9ModulePage';

export default function BrandAssetsPage() {
  return (
    <Phase9ModulePage
      title="Brand Assets"
      description="Store logos, brand colors, fonts, banners and campaign assets."
      endpoint="/api/brand-assets"
      defaults={{ assetType: 'banner', isActive: true }}
      fields={[
        { key: 'name', label: 'Name', required: true },
        { key: 'assetType', label: 'Asset Type', type: 'select', options: ['logo', 'color', 'font', 'banner', 'campaign'] },
        { key: 'url', label: 'Asset URL' },
        { key: 'value', label: 'Value' },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ]}
      columns={[
        { key: 'name', label: 'Asset' },
        { key: 'assetType', label: 'Type', type: 'status' },
        { key: 'value', label: 'Value' },
        { key: 'createdAt', label: 'Created', type: 'date' },
      ]}
    />
  );
}
