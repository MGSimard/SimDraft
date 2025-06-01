import { createFileRoute } from "@tanstack/react-router";
import { ButtonPrimaryAction } from "@/_components/ButtonPrimaryAction";

export const Route = createFileRoute("/")({
  component: PageHome,
});

function PageHome() {
  return (
    <div>
      <h1>vsdraft</h1>
      <ButtonPrimaryAction label="Start" />
    </div>
  );
}
