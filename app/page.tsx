import {
  CharacterPlaceholderLarge,
  ItemPlaceholderMedium,
  WorkIcon,
  AchievementPlaceholderUnlocked,
} from '@/components/placeholders';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold mb-4 text-accent-gold">
          ⚔️ TaskHero
        </h1>
        <p className="text-2xl mb-8 text-gray-300">
          Level Up Your Life, One Quest at a Time
        </p>
      </div>

      {/* Placeholder System Demo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <CharacterPlaceholderLarge label="Hero Character" />
        <ItemPlaceholderMedium rarity="legendary" emoji="⚔️" label="Legendary Sword" />
        <ItemPlaceholderMedium rarity="epic" emoji="🛡️" label="Epic Shield" isEquipped />
        <AchievementPlaceholderUnlocked emoji="🏆" label="First Quest" />
      </div>

      <div className="flex gap-4 mb-8">
        <WorkIcon size="48px" label="Work" />
        <WorkIcon size="48px" emoji="❤️" color="bg-pink-600" label="Health" />
        <WorkIcon size="48px" emoji="📚" color="bg-blue-600" label="Learning" />
      </div>

      <div className="inline-block px-8 py-4 bg-accent-gold text-primary font-bold rounded-lg text-xl hover:bg-accent-gold-light transition-colors cursor-pointer">
        Begin Your Adventure →
      </div>
    </main>
  );
}
