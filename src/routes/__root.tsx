import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import "@/css/global.css";
import "@/css/fonts.css";

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <>
    <Header />
    <Outlet />
    </>
  )
}
