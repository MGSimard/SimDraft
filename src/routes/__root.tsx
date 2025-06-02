import type { ReactNode } from "react";
import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { PageError } from "@/_components/Error";
import { PageNotFound } from "@/_components/NotFound";
import { DraftStoreProvider } from "@/_store/DraftStoreProvider";
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
    ],
    links: [
      { rel: "stylesheet", href: globalCss },
      { rel: "stylesheet", href: fontsCss },
    ],
    scripts: [
      {
        crossOrigin: "anonymous",
        src: "//unpkg.com/react-scan/dist/auto.global.js",
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
        <DraftStoreProvider>{children}</DraftStoreProvider>
        <Scripts />
      </body>
    </html>
  );
}
