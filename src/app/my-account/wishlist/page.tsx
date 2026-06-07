export default function AccountWishlistPage() {
  return <AccountSection title="Wishlist" description="Saved products from your shopping sessions will appear here." />;
}

function AccountSection({ title, description }: { title: string; description: string }) {
  return <div className="rounded-xl border border-white/10 bg-white/5 p-6"><h1 className="text-xl font-semibold text-white">{title}</h1><p className="mt-2 text-sm text-zinc-400">{description}</p></div>;
}
