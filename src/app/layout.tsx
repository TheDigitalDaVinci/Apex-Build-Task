import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Apex BuildTask — Construction Task & Dispatch Platform',
  description: 'Notion-style task assigner with real-time email dispatch for construction crews and subcontractors',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏗️</text></svg>" />
      </head>
      <body className="antialiased min-h-screen text-[#37352F] bg-white">
        {children}
      </body>
    </html>
  );
}
