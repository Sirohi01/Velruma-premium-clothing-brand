import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import dbConnect from "@/lib/db";
import Setting from "@/models/Setting";
import { getAppUrl } from "@/lib/env";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const dynamic = "force-dynamic";

async function getPublicSettingMap() {
  try {
    await dbConnect();
    const settings = await Setting.find({
      key: {
        $in: [
          "brand_name",
          "default_meta_title",
          "default_meta_description",
          "default_og_image",
          "brand_favicon",
          "brand_logo",
          "brand_email",
          "brand_phone",
          "brand_address",
        ],
      },
    }).lean();

    return settings.reduce<Record<string, string>>((acc, setting) => {
      acc[setting.key] = String(setting.value || "");
      return acc;
    }, {});
  } catch {
    return {};
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettingMap();
  const brandName = settings.brand_name || "VELRUMA";
  const title = settings.default_meta_title || `${brandName} - Premium Clothing Brand`;
  const description =
    settings.default_meta_description ||
    `Discover premium clothing at ${brandName}. Elevate your style with our curated collections of modern, luxury fashion.`;
  const favicon = settings.brand_favicon || "/favicon.ico";
  const ogImage = settings.default_og_image || favicon;

  return {
    title: {
      default: title,
      template: `%s | ${brandName}`,
    },
    description,
    keywords: ["clothing", "fashion", "premium", brandName.toLowerCase(), "online shopping", "india"],
    metadataBase: new URL(getAppUrl()),
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    },
    openGraph: {
      title,
      description,
      siteName: brandName,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

function buildOrganizationJsonLd(settings: Record<string, string>) {
  const brandName = settings.brand_name || "VELRUMA";
  const siteUrl = getAppUrl();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brandName,
    url: siteUrl,
    logo: settings.brand_logo || settings.brand_favicon || `${siteUrl}/favicon.ico`,
    email: settings.brand_email || undefined,
    telephone: settings.brand_phone || undefined,
    address: settings.brand_address || undefined,
    sameAs: [],
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getPublicSettingMap();
  const organizationJsonLd = buildOrganizationJsonLd(settings);

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col font-sans bg-[#F7F4EF] text-zinc-950"
        style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster position="top-right" richColors closeButton duration={2600} />
      </body>
    </html>
  );
}
