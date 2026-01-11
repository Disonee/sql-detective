import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const siteUrl = "https://www.sqlnoir.com";
const defaultTitle =
  "SQL Детектив | Решайте криминальные головоломки с помощью SQL | SQLNoir";
const defaultDescription =
  "Станьте цифровым детективом. Решайте криминальные дела с помощью SQL-запросов. Анализируйте улики, вычисляйте преступников и закрывайте дела в стиле нуар.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s | SQL Детектив",
  },
  description: defaultDescription,
  keywords: [
    "SQL детектив",
    "обучение SQL",
    "криминальные головоломки",
    "SQL задачи",
    "детектив SQL",
    "расследования SQL",
    "цифровой детектив",
    "SQL расследования",
    "решать преступления SQL",
    "SQL квесты",
  ],
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/blog/rss.xml",
    },
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "SQL Детектив",
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: "/open-graph-image.png",
        width: 1200,
        height: 630,
        alt: "SQL Детектив - криминальные головоломки с SQL",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/open-graph-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-96x96.png",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#92400e",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "SQL Детектив",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/open-graph-image.png`,
        width: 1200,
        height: 630,
      },
      sameAs: [
        "https://github.com/hristo2612/SQLNoir",
        "https://discord.gg/rMQRwrRYHH",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "SQL Детектив",
      description: defaultDescription,
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/cases?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SiteNavigationElement",
      "@id": `${siteUrl}/#site-navigation`,
      name: ["Главная", "Архив дел", "Блог", "Помощь"],
      url: [
        `${siteUrl}/`,
        `${siteUrl}/cases`,
        `${siteUrl}/blog`,
        `${siteUrl}/help`,
      ],
    },
    {
      "@type": "EducationalGame",
      "name": "SQL Детектив",
      "description": defaultDescription,
      "applicationCategory": "EducationalGame",
      "operatingSystem": "Web Browser",
      "gamePlatform": "Web Browser",
      "genre": "Educational, Puzzle, Detective",
      "educationalUse": ["SQL обучение", "Логическое мышление", "Решение задач"],
      "learningResourceType": "Interactive game",
      "interactivityType": "active",
      "url": siteUrl,
      "author": {
        "@type": "Organization",
        "name": "SQLNoir"
      }
    }
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <Script
          id="seo-json-ld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}