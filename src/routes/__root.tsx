import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Header } from "@/_components/Header";

export const Route = createRootRoute({
  component: () => (
    <>
      <Header />
      <Outlet />
    </>
  ),
});
