'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    // Initial theme check
    const savedTheme = localStorage.getItem('sg-theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('light', savedTheme === 'light');
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('sg-theme', newTheme);
    document.documentElement.classList.toggle('light', newTheme === 'light');
  };

  const navLinks = [
    { name: 'ARCHIVES', href: '/explore' },
    { name: 'INSIGHTS', href: '/insights' },
    { name: 'PRE-MORTEM', href: '/pre-mortem' },
    { name: 'INTEL', href: '/ask' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 ${
      scrolled ? 'h-12 bg-bg-base/90 backdrop-blur-md border-b border-border-subtle shadow-lg' : 'h-12 bg-transparent border-b border-transparent'
    } flex items-center`}>
      <div className="w-full max-w-[1400px] mx-auto px-6 flex items-center justify-between relative z-10">
        {/* Left: Wordmark Logo */}
        <Link href="/" className="flex items-center group">
          <img 
            src="/assets/logo-wordmark.svg" 
            alt="STARTUP_GRAVEYARD" 
            className="h-[28px] w-auto object-contain transition-opacity group-hover:opacity-80"
          />
        </Link>

        {/* Center: Nav Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className={`relative font-mono text-[10px] tracking-[0.25em] transition-all duration-300 ${
                pathname === link.href ? 'text-text-primary' : 'text-text-ghost hover:text-text-primary'
              }`}
            >
              {link.name}
              {pathname === link.href && (
                <motion.div 
                  layoutId="nav-glow"
                  className="absolute -bottom-1 left-0 w-full h-[1px] bg-violet-600" 
                />
              )}
            </Link>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="flex items-center gap-2 font-mono text-[9px] text-text-ghost hover:text-violet-500 transition-colors uppercase tracking-widest border border-border-subtle px-2 py-1 rounded-[2px] bg-white/[0.02]"
            title="Toggle Visual Mode"
          >
            <span>{theme === 'dark' ? '◐' : '◑'}</span>
            <span className="hidden xl:inline">{theme === 'dark' ? 'DARK' : 'LIGHT'}</span>
          </button>

          <Link 
            href="/pre-mortem" 
            className="flex items-center gap-2 bg-text-primary text-bg-base px-4 py-1.5 rounded-[2px] font-mono text-[10px] font-bold tracking-widest transition-all hover:bg-violet-600 hover:text-white active:scale-95 group"
          >
            <span>RUN_SCAN</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
