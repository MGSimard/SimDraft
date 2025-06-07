import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Header } from "@/_components/Header";
import { PageError } from "@/_components/Error";
import { PageNotFound } from "@/_components/NotFound";

export const Route = createRootRoute({
  errorComponent: PageError,
  notFoundComponent: PageNotFound,
  component: () => (
    <>
      <Header />
      <Outlet />
    </>
  ),
});
