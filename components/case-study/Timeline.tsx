'use client';

import { motion } from 'framer-motion';

interface Event {
  date: string;
  title: string;
  description: string;
  type: 'milestone' | 'warning' | 'crisis';
}

export function Timeline({ events }: { events: Event[] }) {
  const typeColors = {
    milestone: 'bg-green-500',
    warning: 'bg-amber-500',
    crisis: 'bg-red-500',
  };

  return (
    <div className="relative py-8 pl-8 border-l border-white/5 space-y-12">
      {events.map((event, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="relative group"
        >
          {/* Node Indicator */}
          <div className={`absolute -left-[36.5px] top-1.5 w-4 h-4 rounded-full border-4 border-bg-page transition-colors duration-300 ${typeColors[event.type]} group-hover:scale-125 z-10`} />
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <span className="font-mono text-[10px] text-text-ghost uppercase tracking-[0.2em] bg-white/[0.03] px-2 py-0.5 rounded">
                {event.date}
              </span>
              <div className={`h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
            </div>
            
            <h4 className="font-sans text-[15px] font-semibold text-text-primary uppercase tracking-tight group-hover:text-amber-500 transition-colors">
              {event.title}
            </h4>
            
            <p className="text-text-muted text-[13px] leading-relaxed max-w-xl">
              {event.description}
            </p>
          </div>

          {/* Type Tag */}
          <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-20 transition-opacity">
            <span className="font-mono text-[40px] font-bold text-white select-none">
              {event.type.toUpperCase()}
            </span>
          </div>
        </motion.div>
      ))}
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" />
    </div>
  );
}
