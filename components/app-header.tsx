// Application header (DESIGN.md §3). The stepper (T11) and Start over (T12)
// are added later.
export function AppHeader() {
  return (
    <header className="flex h-13 shrink-0 items-center border-b border-rule px-4 md:h-16 md:px-8 lg:h-18 lg:px-10">
      <h1 className="flex items-baseline gap-2">
        <span className="font-serif text-section">Monis Rent</span>
        <span className="text-copy text-stone">Workspace configurator</span>
      </h1>
    </header>
  );
}
