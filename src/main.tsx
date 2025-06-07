import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { PageError } from "@/_components/Error";
import { PageNotFound } from "@/_components/NotFound";
import "@/_styles/global.css";
import "@/_styles/fonts.css";

// Create a new router instance
const router = createRouter({
  routeTree,
  defaultNotFoundComponent: PageNotFound,
  defaultErrorComponent: PageError,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
}
