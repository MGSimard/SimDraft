import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: PageHome,
});

function PageHome() {
  return (
    <div>
      <h1>vsdraft</h1>
    </div>
  );
}
