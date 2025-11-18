import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevOn Interview Portal",
  description: "Submit your information and record video responses for DevOn interview questions.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "DevOn Interview Portal",
    description: "Submit your information and record video responses for DevOn interview questions.",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "DevOn Interview Portal Logo"
      }
    ],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "DevOn Interview Portal",
    description: "Submit your information and record video responses for DevOn interview questions.",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "DevOn Interview Portal Logo"
      }
    ]
  }
};


import DisableInspect from "@/components/DisableInspect";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="shortcut icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:title" content="DevOn Interview Portal" />
        <meta property="og:description" content="Submit your information and record video responses for DevOn interview questions." />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="/logo.png" />
        <meta name="twitter:title" content="DevOn Interview Portal" />
        <meta name="twitter:description" content="Submit your information and record video responses for DevOn interview questions." />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <DisableInspect />
        {children}
      </body>
    </html>
  );
}