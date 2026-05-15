'use client';

import { motion } from 'framer-motion';

interface Note {
  id: string;
  text: string;
  position_y: number; // percentage from top of article
}

interface MarginaliaProps {
  notes: Note[];
}

export function Marginalia({ notes }: MarginaliaProps) {
  if (!notes || notes.length === 0) return null;

  return (
    <div className="absolute inset-y-0 -right-48 w-40 hidden xl:block pointer-events-none">
      {notes.map((note) => (
        <motion.div
          key={note.id}
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 + Math.random() * 0.5, duration: 0.8 }}
          viewport={{ once: true }}
          className="absolute left-0 w-full pointer-events-auto"
          style={{ top: `${note.position_y}%` }}
        >
          <div className="relative group">
            {/* The Note */}
            <div className="bg-[#fef9c3] p-4 shadow-sm border-l-4 border-yellow-400 -rotate-2 transform hover:rotate-0 transition-transform duration-300">
               <div className="flex justify-between items-center mb-2">
                 <span className="font-mono text-[8px] text-yellow-700 font-bold tracking-tighter uppercase opacity-60">ANNOTATION</span>
                 <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
               </div>
               <p className="text-[12px] font-handwriting leading-tight text-ink-black/80 font-medium italic">
                 "{note.text}"
               </p>
            </div>
            
            {/* The Pin */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-red-600 shadow-[0_2px_4px_rgba(0,0,0,0.3)] z-10" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
