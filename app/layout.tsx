import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'InvoiceGen Pro — Professional Invoice Generator',
  description: 'Create pixel-perfect GST invoices with automatic tax calculations, Indian amount-in-words, and one-click PDF export. Built for Indian businesses.',
  keywords: ['invoice generator', 'GST invoice', 'India invoice', 'CGST SGST calculator', 'invoice PDF'],
  openGraph: {
    title: 'InvoiceGen Pro',
    description: 'Professional GST Invoice Generator for Indian Businesses',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
