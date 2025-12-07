import Link from "next/link";

const features = [
  {
    icon: "upload",
    title: "Upload Your Decks",
    description: "Easily upload your existing flashcard sets and start learning in seconds.",
  },
  {
    icon: "label",
    title: "Organize with Labels",
    description: "Categorize your cards with custom labels to find exactly what you need.",
  },
  {
    icon: "monitoring",
    title: "Track Your Mastery",
    description: "Our smart system tracks your progress to help you focus on what matters most.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col">
      {/* Top App Bar */}
      <header className="flex items-center p-4">
        <div className="flex size-10 shrink-0 items-center justify-center text-white bg-primary rounded-lg">
          <span className="material-symbols-outlined">style</span>
        </div>
        <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 pl-4">
          Flashcardly
        </h2>
        <nav className="flex items-center justify-end">
          <Link
            href="/auth"
            className="text-primary text-base font-bold leading-normal tracking-[0.015em] shrink-0 hover:opacity-80 transition-opacity"
          >
            Login
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center px-4 pt-12 pb-8">
        <h1 className="text-foreground tracking-tight text-4xl font-bold leading-tight text-center">
          Master Anything with Smart Flashcards
        </h1>
        <p className="text-muted-foreground text-base font-normal leading-normal pt-2 text-center max-w-sm">
          Upload, organize, and track your learning for long-term retention.
        </p>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 gap-4 p-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="flex flex-1 gap-4 rounded-xl border border-muted bg-card p-4 flex-col transition-all hover:border-primary/50 hover:shadow-md"
          >
            <div className="text-primary">
              <span className="material-symbols-outlined">{feature.icon}</span>
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-foreground text-base font-bold leading-tight">
                {feature.title}
              </h2>
              <p className="text-muted-foreground text-sm font-normal leading-normal">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* Spacer to push CTA to bottom */}
      <div className="flex-grow" />

      {/* CTA Section */}
      <section className="flex flex-col items-center gap-4 px-4 py-6">
        <Link
          href="/auth"
          className="btn btn-primary min-w-[84px] max-w-[480px] h-12 px-5 w-full text-base font-bold leading-normal tracking-[0.015em]"
        >
          <span className="truncate">Create an Account</span>
        </Link>
      </section>
    </div>
  );
}
