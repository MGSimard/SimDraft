export function ButtonPrimaryAction({ label }: { label: string }) {
  return (
    <button type="submit" className="btn-primary-action">
      <span>{label}</span>
    </button>
  );
}
