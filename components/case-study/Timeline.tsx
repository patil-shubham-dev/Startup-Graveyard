'use client';

import { motion } from 'framer-motion';

interface Event {
  date: string;
  title: string;
  description: string;
  type: 'milestone' | 'warning' | 'crisis';
}

export function Timeline({ events }: { events: Event[] }) {
  return (
    <div className="flex gap-5 overflow-x-auto pb-8 scrollbar-hide snap-x">
      {events.map((event, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.06 }}
          className={`min-w-[180px] flex-shrink-0 p-4 rounded-md border border-border-subtle border-l-[3px] snap-start ${
            event.type === 'milestone' ? 'bg-[#10B981]/5 border-l-green-lesson' :
            event.type === 'warning' ? 'bg-[#F59E0B]/5 border-l-amber-signal' : 'bg-[#EF4444]/5 border-l-red-critical'
          }`}
        >
          <div className="font-mono text-[11px] text-text-muted uppercase tracking-widest mb-3">
            {event.date}
          </div>
          <h4 className="font-medium text-[14px] text-text-primary mb-2">{event.title}</h4>
          <p className="text-text-secondary text-[12px] leading-relaxed line-clamp-3">{event.description}</p>
        </motion.div>
      ))}
    </div>
  );
}
