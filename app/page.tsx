'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  CharacterPlaceholderLarge,
  ItemPlaceholderMedium,
  WorkIcon,
  HealthIcon,
  LearningIcon,
  AchievementPlaceholderUnlocked,
} from '@/components/placeholders';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [particles, setParticles] = useState<Array<{
    left: number;
    top: number;
    delay: number;
    duration: number;
    opacity: number;
  }>>([])

  useEffect(() => {
    setIsVisible(true)
    setIsMounted(true)
    
    // Generate particles once on client side
    const newParticles = [...Array(20)].map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 15 + Math.random() * 10,
      opacity: 0.3 + Math.random() * 0.3,
    }))
    setParticles(newParticles)
  }, [])

  return (
    <main className="flex min-h-screen flex-col bg-black overflow-hidden relative">
      {/* Dynamic Animated Background */}
      <div className="fixed inset-0 z-0">
        {/* Animated Grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(64, 64, 64, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(64, 64, 64, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />
        </div>

        {/* Floating Particles - Only render on client */}
        {isMounted && particles.map((particle, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-neutral-600 rounded-full animate-float"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
              opacity: particle.opacity,
            }}
          />
        ))}

        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/3 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '3s' }} />
        
        {/* Animated lines */}
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-neutral-700/20 to-transparent animate-slide" />
        <div className="absolute top-2/4 right-0 w-full h-px bg-gradient-to-r from-transparent via-neutral-700/20 to-transparent animate-slide-reverse" />
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-neutral-700/20 to-transparent animate-slide" style={{ animationDelay: '2s' }} />
      </div>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-24 z-10">
        <div className={`text-center max-w-4xl z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-block mb-3 sm:mb-4">
            <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl animate-bounce">⚔️</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 text-white">
            TaskHero
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-3 sm:mb-4 text-neutral-400 leading-relaxed">
            Transform Your Tasks Into Epic Quests
          </p>
          
          <p className="text-sm sm:text-base md:text-lg mb-8 sm:mb-10 md:mb-12 text-neutral-500 max-w-2xl mx-auto px-2">
            Gamify your productivity. Level up by completing tasks, earn achievements, and build the hero version of yourself—one quest at a time.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-10 sm:mb-12 md:mb-16 px-4 sm:px-0">
            <Link href="/signup">
              <div className="group relative inline-block w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white hover:bg-neutral-200 text-black font-semibold rounded-md text-base sm:text-lg transition-all cursor-pointer overflow-hidden text-center">
                <span className="relative z-10">Start Your Journey</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
            <Link href="/login">
              <div className="inline-block w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border border-neutral-700 hover:bg-neutral-900 hover:border-neutral-600 text-neutral-300 font-semibold rounded-md text-base sm:text-lg transition-all cursor-pointer text-center">
                Sign In →
              </div>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-2xl mx-auto px-2">
            <div className="text-center">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">100%</div>
              <div className="text-xs sm:text-sm text-neutral-500">Motivation</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">∞</div>
              <div className="text-xs sm:text-sm text-neutral-500">Quests</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">Level ∞</div>
              <div className="text-xs sm:text-sm text-neutral-500">Potential</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 animate-bounce">
          <div className="w-6 h-10 border-2 border-neutral-700 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-neutral-600 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative min-h-screen flex items-center justify-center py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8 border-t border-neutral-900 z-10">
        {/* Dot pattern background */}
        <div className="absolute inset-0 opacity-50" style={{
          backgroundImage: 'radial-gradient(circle, rgba(100, 100, 100, 0.5) 1.5px, transparent 1.5px)',
          backgroundSize: '50px 50px',
        }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/70" />
        
        <div className="max-w-6xl mx-auto w-full relative z-10">
          <div className={`text-center mb-10 sm:mb-12 md:mb-16 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
              Level Up Every Day
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2">
              Turn mundane tasks into exciting quests with our gamified productivity system
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[
              {
                icon: '🎯',
                title: 'Quest System',
                description: 'Transform your to-dos into epic quests. Complete tasks, earn XP, and watch yourself level up.'
              },
              {
                icon: '🏆',
                title: 'Achievements',
                description: 'Unlock badges and achievements as you hit milestones. Show off your productivity prowess.'
              },
              {
                icon: '⚡',
                title: 'Streak Tracking',
                description: 'Build momentum with daily streaks. Consistency is the path to mastery.'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className={`group relative p-5 sm:p-6 md:p-8 rounded-lg border border-neutral-800 bg-neutral-950 hover:border-neutral-700 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${300 + index * 100}ms` }}
              >
                <div className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4 transform group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
                  {feature.description}
                </p>
                
                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-green-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="relative min-h-screen flex items-center justify-center py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8 border-t border-neutral-900 z-10">
        {/* Diagonal lines background */}
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 60px,
            rgba(80, 80, 80, 0.4) 60px,
            rgba(80, 80, 80, 0.4) 62px
          )`,
        }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        
        <div className="max-w-6xl mx-auto w-full relative z-10">
          <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center mb-6 sm:mb-8 md:mb-12">
              Your Arsenal Awaits
            </h3>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-8 sm:mb-10 md:mb-12 px-2 sm:px-0">
              <div className="transform hover:scale-105 transition-transform duration-300 flex justify-center">
                <CharacterPlaceholderLarge label="Hero Character" />
              </div>
              <div className="transform hover:scale-105 transition-transform duration-300 delay-75 flex justify-center">
                <ItemPlaceholderMedium rarity="legendary" emoji="⚔️" label="Legendary Sword" />
              </div>
              <div className="transform hover:scale-105 transition-transform duration-300 delay-150 flex justify-center">
                <ItemPlaceholderMedium rarity="epic" emoji="🛡️" label="Epic Shield" isEquipped />
              </div>
              <div className="transform hover:scale-105 transition-transform duration-300 delay-225 flex justify-center">
                <AchievementPlaceholderUnlocked emoji="🏆" label="First Quest" />
              </div>
            </div>

            {/* Category Icons */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-5 md:gap-6 pb-6 sm:pb-8">
              <div className="transform hover:scale-110 transition-transform">
                <WorkIcon size="48px" label="Work" />
              </div>
              <div className="transform hover:scale-110 transition-transform delay-75">
                <HealthIcon size="48px" label="Health" />
              </div>
              <div className="transform hover:scale-110 transition-transform delay-150">
                <LearningIcon size="48px" label="Learning" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative min-h-screen flex items-center justify-center py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8 border-t border-neutral-900 z-10">
        {/* Cross-hatch grid background */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(100, 100, 100, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(100, 100, 100, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
        }} />
        <div className="absolute inset-0 bg-gradient-radial from-neutral-900/40 via-black/90 to-black" />
        
        <div className={`max-w-3xl mx-auto text-center transition-all duration-1000 delay-700 relative z-10 px-4 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
            Ready to Begin?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-neutral-400 mb-6 sm:mb-8 md:mb-10">
            Your adventure starts now. Create your hero and conquer your goals.
          </p>
          <Link href="/signup">
            <div className="group inline-block px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 bg-white hover:bg-neutral-200 text-black font-semibold rounded-md text-base sm:text-lg md:text-xl transition-all cursor-pointer shadow-lg hover:shadow-xl">
              Create Your Hero
              <span className="inline-block ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-neutral-900 py-6 sm:py-8 px-4 sm:px-6 md:px-8 z-10">
        <div className="max-w-6xl mx-auto text-center text-neutral-500 text-xs sm:text-sm">
          <p>© 2026 TaskHero. Level up your life.</p>
        </div>
      </footer>
    </main>
  );
}
