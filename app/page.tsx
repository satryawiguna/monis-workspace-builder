export default function Home() {
  return (
    <main className="flex flex-1 flex-col gap-6 px-4 py-8 sm:px-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl">Monis Rent — Workspace Configurator</h1>
        <p className="max-w-prose">
          Compose a workspace from a desk, a chair and a few extras, and see it
          come together before you request it.
        </p>
      </header>
      <section
        aria-label="Workspace configurator"
        className="flex flex-1 flex-col"
      />
    </main>
  );
}
