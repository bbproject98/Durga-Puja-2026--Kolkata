import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BroomBoom Cabs — Admin Management Console",
  description: "Administrative console for managing bookings, fleet, and rental packages for BroomBoom Cabs Kolkata.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}

