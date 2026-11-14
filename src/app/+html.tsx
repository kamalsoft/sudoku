import { ScrollViewStyleReset, useServerDocumentContext } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

// The HTML shell for the web build: the page title, icons, manifest and install metadata.
// EXPO_BASE_URL is the sub-path the site is served from (/sudoku on GitHub Pages).
export default function Root({ children }: PropsWithChildren) {
  const base = process.env.EXPO_BASE_URL ?? '';
  // headNodes and bodyNodes carry the bundle scripts and framework markup; the page does not load without them.
  const { htmlAttributes, bodyAttributes, headNodes, bodyNodes } = useServerDocumentContext();
  return (
    <html lang="en" {...htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />
        <title>Sudoku</title>
        <meta name="description" content="Play Sudoku with five difficulty levels, a daily challenge and kid-friendly themes." />
        <meta name="theme-color" content="#2563EB" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Sudoku" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="manifest" href={`${base}/manifest.webmanifest`} />
        <link rel="icon" type="image/png" sizes="48x48" href={`${base}/icons/favicon-48.png`} />
        <link rel="apple-touch-icon" href={`${base}/icons/apple-touch-icon.png`} />
        <style>{`
          html, body { height: 100%; margin: 0; background: #F8FAFC; }
          body { overflow: hidden; }
          #root { display: flex; height: 100%; flex: 1; }
        `}</style>
        <ScrollViewStyleReset />
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        {children}
        {bodyNodes}
      </body>
    </html>
  );
}
