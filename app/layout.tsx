import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '별채홈피 — SNS가 막혀도 여기 있어',
  description: '스레드 정지·벤 당해도 친구들이 들러서 글 남길 수 있는 한국 미니홈피. 방명록, 일촌, BGM, 꾸미기.',
  metadataBase: new URL('https://byeolchae.revely.company'),
  keywords: ['미니홈피', '싸이월드', '방명록', '일촌', '별채홈피', 'SNS 백업'],
  openGraph: {
    title: '별채홈피',
    description: 'SNS가 막혀도 여기 있어 — 나만의 미니홈피',
    url: 'https://byeolchae.revely.company',
    siteName: '별채홈피',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: '별채홈피', description: 'SNS가 막혀도 여기 있어' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
