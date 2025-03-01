import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '免费在线图片背景去除工具 - 无需登录 | ImageSplitter',
  description: '专业的在线抠图工具，一键去除图片背景，支持人像、商品、证件照等多种场景，完全免费，无需登录，无水印，快速导出高清透明背景图片。',
  keywords: '在线抠图,图片背景去除,免费抠图,在线扣图工具,证件照背景处理,商品图去背景,人像抠图,透明背景图片制作,免登录抠图,批量抠图',
  authors: [{ name: 'ImageSplitter' }],
  openGraph: {
    title: '免费在线图片背景去除工具 - 无需登录 | ImageSplitter',
    description: '专业的在线抠图工具，一键去除图片背景，完全免费，无需登录，无水印，支持批量处理。',
    type: 'website',
    locale: 'zh_CN',
    siteName: 'ImageSplitter 在线抠图',
    url: 'https://removebg.imagesplitter.vip/',
  },
  alternates: {
    canonical: 'https://removebg.imagesplitter.vip/'
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

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body style={{ margin: 0, minHeight: '100vh' }}>{children}</body>
    </html>
  );
}
