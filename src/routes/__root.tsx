import type { ReactNode } from "react";
import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { PageError } from "@/_components/Error";
import { PageNotFound } from "@/_components/NotFound";
import globalCss from "@/_styles/global.css?url";
import fontsCss from "@/_styles/fonts.css?url";

export const Route = createRootRoute({
  notFoundComponent: () => <PageNotFound />,
  errorComponent: (props) => {
    return (
      <RootDocument>
        <PageError {...props} />
      </RootDocument>
    );
  },
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      { author: "MGSimard" },
      {
        title: "vsdraft",
      },
      { description: "TBD" },
      { name: "application-name", content: "vsdraft" },
      { name: "apple-mobile-web-app-title", content: "vsdraft" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "theme-color", content: "#000000" },
      { name: "msapplication-TileColor", content: "#000000" },
      // Open Graph / Facebook
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://vsdraft.pages.dev/" },
      { property: "og:title", content: "vsdraft" },
      { property: "og:site_name", content: "vsdraft" },
      {
        property: "og:description",
        content: "TBD",
      },
      { property: "og:image", content: "https://vsdraft.pages.dev/metadata/opengraph-image.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "600" },
      // Twitter
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:url", content: "https://vsdraft.pages.dev/" },
      { name: "twitter:creator", content: "@MGSimard" },
      { name: "twitter:title", content: "vsdraft" },
      {
        name: "twitter:description",
        content: "TBD",
      },
      { name: "twitter:image", content: "https://vsdraft.pages.dev/metadata/twitter-image.png" },
    ],
    links: [
      { rel: "stylesheet", href: globalCss },
      { rel: "stylesheet", href: fontsCss },
      { rel: "canonical", href: "https://vsdraft.pages.dev/" },
      { rel: "manifest", href: "/metadata/manifest.webmanifest" },
      { rel: "shortcut icon", href: "/metadata/favicon.ico" },
      { rel: "icon", type: "image/png", sizes: "96x96", href: "/metadata/icon.png" },
      { rel: "icon", type: "image/svg+xml", href: "/metadata/icon.svg" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/metadata/apple-icon.png" },
      { rel: "apple-touch-startup-image", href: "/metadata/apple-icon.png" },
      {
        rel: "preload",
        href: "/fonts/BeaufortForLOL/BFL-bold.woff2",
        as: "font",
        type: "font/woff2",
        fetchPriority: "high",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: "/fonts/Spiegel/spiegel-regular.woff2",
        as: "font",
        type: "font/woff2",
        fetchPriority: "high",
        crossOrigin: "anonymous",
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
