import "./globals.css";
import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "C.A.C. Official Website",
    description: "デジタル系創作団体 C.A.C. の公式Webサイト",
    keywords: ["C.A.C.", "京産", "サークル"],
    authors: [{ name: "C.A.C." }],
    icons: {
        icon: [
            { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
            { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        ],
        apple: "/favicon/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",
    openGraph: {
        title: "C.A.C. Official Website",
        description: "デジタル系創作団体 C.A.C. の公式Webサイト",
        type: "website",
    },
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="ja">
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        </head>
        <body>
            {children}
        </body>
        </html>
    );
}
