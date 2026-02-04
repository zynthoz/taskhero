// Avatar mapping helper
export const avatarOptions = [
  // Hero Category
  { id: 'hero_1', emoji: '🧙', name: 'Wizard', category: 'hero' },
  { id: 'hero_2', emoji: '🧙‍♀️', name: 'Sorceress', category: 'hero' },
  { id: 'hero_3', emoji: '🧑‍🚀', name: 'Astronaut', category: 'hero' },
  { id: 'hero_4', emoji: '🦸', name: 'Superhero', category: 'hero' },
  { id: 'hero_5', emoji: '🦸‍♀️', name: 'Superheroine', category: 'hero' },
  
  // Magic Category
  { id: 'magic_1', emoji: '🧚', name: 'Fairy', category: 'magic' },
  { id: 'magic_2', emoji: '🧚‍♂️', name: 'Fairy Prince', category: 'magic' },
  { id: 'magic_3', emoji: '🧜', name: 'Merperson', category: 'magic' },
  { id: 'magic_4', emoji: '🧛', name: 'Vampire', category: 'magic' },
  { id: 'magic_5', emoji: '🧝', name: 'Elf', category: 'magic' },
  
  // Warrior Category
  { id: 'warrior_1', emoji: '⚔️', name: 'Swordsman', category: 'warrior' },
  { id: 'warrior_2', emoji: '🛡️', name: 'Guardian', category: 'warrior' },
  { id: 'warrior_3', emoji: '🏹', name: 'Archer', category: 'warrior' },
  { id: 'warrior_4', emoji: '🗡️', name: 'Knight', category: 'warrior' },
  { id: 'warrior_5', emoji: '🥋', name: 'Martial Artist', category: 'warrior' },
  
  // Nature Category
  { id: 'nature_1', emoji: '🦊', name: 'Fox Spirit', category: 'nature' },
  { id: 'nature_2', emoji: '🐉', name: 'Dragon', category: 'nature' },
  { id: 'nature_3', emoji: '🦅', name: 'Eagle', category: 'nature' },
  { id: 'nature_4', emoji: '🐺', name: 'Wolf', category: 'nature' },
  { id: 'nature_5', emoji: '🦁', name: 'Lion', category: 'nature' },
  
  // Tech Category
  { id: 'tech_1', emoji: '🤖', name: 'Robot', category: 'tech' },
  { id: 'tech_2', emoji: '👾', name: 'Alien', category: 'tech' },
  { id: 'tech_3', emoji: '🚀', name: 'Rocket', category: 'tech' },
  { id: 'tech_4', emoji: '💻', name: 'Hacker', category: 'tech' },
  { id: 'tech_5', emoji: '⚡', name: 'Lightning', category: 'tech' },
]

export function getAvatarEmoji(avatarId: string | null | undefined): string {
  if (!avatarId) return '🧙' // Default wizard
  const avatar = avatarOptions.find(a => a.id === avatarId)
  return avatar?.emoji || '🧙'
}
