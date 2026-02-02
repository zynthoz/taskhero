export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 text-accent-gold">
          ⚔️ TaskHero
        </h1>
        <p className="text-2xl mb-8 text-gray-300">
          Level Up Your Life, One Quest at a Time
        </p>
        <div className="inline-block px-8 py-4 bg-accent-gold text-primary font-bold rounded-lg text-xl hover:bg-accent-gold-light transition-colors cursor-pointer">
          Begin Your Adventure →
        </div>
      </div>
    </main>
  );
}
