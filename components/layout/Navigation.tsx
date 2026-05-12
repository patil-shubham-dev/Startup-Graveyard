'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Explore', href: '/explore' },
    { name: 'Insights', href: '/insights' },
    { name: 'Pre-Mortem', href: '/pre-mortem' },
    { name: 'Ask the Graveyard', href: '/ask' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'backdrop-blur-md bg-bg-page/80 border-b border-border-subtle h-[60px]' : 'bg-transparent h-[72px]'
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl">💀</span>
          <span className="font-mono font-bold tracking-tighter text-lg uppercase group-hover:text-violet-primary transition-colors">
            STARTUP GRAVEYARD <span className="bg-violet-600 text-[10px] px-1.5 py-0.5 rounded-[3px] ml-1 text-white font-mono tracking-normal">AI</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 h-full">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className={`relative text-sm font-medium transition-colors hover:text-text-primary h-full flex items-center ${
                pathname === link.href ? 'text-text-primary' : 'text-text-secondary'
              }`}
            >
              {link.name}
              {pathname === link.href && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-violet-primary" />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link 
            href="/pre-mortem" 
            className="hidden sm:block px-5 py-2 bg-violet-primary hover:bg-violet-hover text-white text-[14px] font-medium rounded-md shadow-violet-glow transition-all"
          >
            Run Pre-Mortem →
          </Link>
          <button className="text-text-secondary hover:text-text-primary transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
