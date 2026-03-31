export function Footer() {
  return (
    <footer className="border-t border-zinc-200/60 bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-8 text-center text-sm text-zinc-500 sm:px-6 lg:px-8">
        Journal Shop © {new Date().getFullYear()}
      </div>
    </footer>
  )
}
