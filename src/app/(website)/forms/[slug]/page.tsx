import PublicDynamicFormClient from './PublicDynamicFormClient';

export default async function PublicDynamicFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <main className="min-h-screen bg-[#FAF9F6] px-4 py-12 text-zinc-900">
      <PublicDynamicFormClient slug={slug} />
    </main>
  );
}
