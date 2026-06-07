import Phase9ModulePage from '@/components/admin/Phase9ModulePage';

export default function AnnouncementsPage() {
  return (
    <Phase9ModulePage
      title="Announcements"
      description="Manage website bars, popups and admin dashboard announcements."
      endpoint="/api/announcements"
      defaults={{ placement: 'website_bar', isActive: true }}
      fields={[
        { key: 'title', label: 'Title', required: true },
        { key: 'message', label: 'Message', type: 'textarea', required: true },
        { key: 'placement', label: 'Placement', type: 'select', options: ['website_bar', 'popup', 'admin_dashboard'] },
        { key: 'startsAt', label: 'Starts At', type: 'date' },
        { key: 'endsAt', label: 'Ends At', type: 'date' },
        { key: 'link', label: 'Link' },
      ]}
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'placement', label: 'Placement', type: 'status' },
        { key: 'startsAt', label: 'Starts', type: 'date' },
        { key: 'endsAt', label: 'Ends', type: 'date' },
      ]}
    />
  );
}
