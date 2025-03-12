import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Online Background Removal Tool - No Login Required | ImageSplitter',
  description: 'Professional online background removal tool. Remove image backgrounds with one click. Support portraits, products, ID photos, and more. Completely free, no login required, no watermark, export high-quality transparent images.',
  keywords: 'background removal,remove image background,free background remover,online background removal tool,ID photo background,product background removal,portrait background removal,transparent background maker,no login required,batch processing',
  authors: [{ name: 'ImageSplitter' }],
  openGraph: {
    title: 'Free Online Background Removal Tool - No Login Required | ImageSplitter',
    description: 'Professional online background removal tool. Remove image backgrounds instantly. Free, no login required, no watermark.',
    type: 'website',
    locale: 'en_US',
    siteName: 'ImageSplitter Background Removal',
    url: 'https://removebg.imagesplitter.vip/en',
  },
  alternates: {
    canonical: 'https://removebg.imagesplitter.vip/en'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function EnLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: '100vh' }}>{children}</body>
    </html>
  );
}