import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WeCats (MeowVerse) - 2D Cozy Cat Sim MMO',
  description: 'เกมเลี้ยงแมว 2D สไตล์ Pastel สุดน่ารัก ปรับแต่งแมวได้อิสระ พร้อมระบบสถิติสมจริง และเดินเล่นออนไลน์กับเพื่อนๆ ใน Cat Plaza',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Itim&family=Quicksand:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-[#fbf7f0] text-[#523e32]">
        {children}
      </body>
    </html>
  );
}
