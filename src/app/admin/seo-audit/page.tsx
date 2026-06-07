import Phase9ModulePage from '@/components/admin/Phase9ModulePage';
import SeoAuditActions from './SeoAuditActions';

export default function SeoAuditPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-end"><SeoAuditActions /></div>
      <Phase9ModulePage
        title="Advanced SEO Audit"
        description="Track SEO score, missing meta, duplicate titles, alt tags and broken links."
        endpoint="/api/seo-audits"
        defaults={{ pageType: 'website', score: 0, missingMetaTitle: false, missingMetaDescription: false, duplicateTitle: false, missingAltTags: 0, brokenLinks: 0, isActive: true }}
        fields={[
          { key: 'pageUrl', label: 'Page URL', required: true },
          { key: 'pageType', label: 'Page Type', type: 'select', options: ['product', 'category', 'collection', 'blog', 'cms', 'website'] },
          { key: 'score', label: 'Score', type: 'number' },
          { key: 'missingMetaTitle', label: 'Missing Meta Title', type: 'checkbox' },
          { key: 'missingMetaDescription', label: 'Missing Meta Description', type: 'checkbox' },
          { key: 'missingAltTags', label: 'Missing Alt Tags', type: 'number' },
          { key: 'duplicateTitle', label: 'Duplicate Title', type: 'checkbox' },
          { key: 'brokenLinks', label: 'Broken Links', type: 'number' },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ]}
        columns={[
          { key: 'pageUrl', label: 'URL' },
          { key: 'pageType', label: 'Type', type: 'status' },
          { key: 'score', label: 'Score' },
          { key: 'missingAltTags', label: 'Alt Missing' },
          { key: 'brokenLinks', label: 'Broken' },
        ]}
      />
    </div>
  );
}
