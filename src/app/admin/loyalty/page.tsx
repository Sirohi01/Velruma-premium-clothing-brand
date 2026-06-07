import Phase9ModulePage from '@/components/admin/Phase9ModulePage';

export default function LoyaltyPage() {
  return (
    <Phase9ModulePage
      title="Loyalty Engine"
      description="Configure Bronze, Silver, Gold and Platinum upgrade tiers."
      endpoint="/api/loyalty"
      defaults={{ level: 1, minSpend: 0, pointsMultiplier: 1, benefits: [], isActive: true }}
      fields={[
        { key: 'name', label: 'Tier Name', required: true },
        { key: 'level', label: 'Level', type: 'number' },
        { key: 'minSpend', label: 'Minimum Spend', type: 'number' },
        { key: 'pointsMultiplier', label: 'Points Multiplier', type: 'number' },
      ]}
      columns={[
        { key: 'name', label: 'Tier' },
        { key: 'level', label: 'Level' },
        { key: 'minSpend', label: 'Min Spend', type: 'currency' },
        { key: 'pointsMultiplier', label: 'Multiplier' },
      ]}
    />
  );
}
