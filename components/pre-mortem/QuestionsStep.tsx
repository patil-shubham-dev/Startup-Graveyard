'use client';

import { motion } from 'framer-motion';
import { Check, FileText, ArrowLeft } from 'lucide-react';
import { type Question, cleanOptionText } from './types';

interface QuestionsStepProps {
  questions: Question[];
  currentQuestionIndex: number;
  selectedOptions: Record<string, string>;
  customAnswers: Record<string, string>;
  onSelectOption: (questionId: string, optionIndex: string, optionText: string) => void;
  onSelectOther: (questionId: string) => void;
  onCustomTextChange: (questionId: string, text: string) => void;
  onNext: () => void;
  onBack: () => void;
  isLastQuestion: boolean;
}

export function QuestionsStep({
  questions,
  currentQuestionIndex,
  selectedOptions,
  customAnswers,
  onSelectOption,
  onSelectOther,
  onCustomTextChange,
  onNext,
  onBack,
  isLastQuestion
}: QuestionsStepProps) {
  const q = questions[currentQuestionIndex];
  const selected = selectedOptions[q.id];
  const isCurrentQuestionAnswered = selected !== undefined && selected !== null && (selected !== 'other' || (customAnswers[q.id] || '').trim().length > 0);

  return (
    <motion.div
      key="step-questions"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-[1000px] mx-auto w-full h-full flex flex-col justify-between py-2 overflow-hidden"
    >
      <div className="flex flex-col gap-2 shrink-0">
        <div className="flex justify-between items-center leading-none">
          <span className="font-monospace text-[9.5px] tracking-[0.2em] text-[#D35A22] uppercase font-bold leading-none">
            INTERROGATION
          </span>
          <span className="font-monospace text-[9.5px] text-[#9A9187] tracking-wider uppercase font-bold leading-none">
            QUESTION_0{currentQuestionIndex + 1} / 0{questions.length}
          </span>
        </div>

        <div className="w-full h-1 bg-[#DDD3C5] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#D35A22] to-[#BF4F1E] transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1 shrink-0 mt-2">
        <span className="font-monospace text-[9px] text-[#9A9187] uppercase tracking-wider font-bold leading-none">
          FAILURE VECTOR DIAGNOSTIC
        </span>
        <h3 className="question-title-styles text-[#111111] line-clamp-3 mt-1 leading-tight">
          {q.text}
        </h3>
      </div>

      <div className="flex-1 min-h-0 py-2 my-3 grid grid-cols-1 sm:grid-cols-2 gap-4 select-none">
        {q.options && q.options.slice(0, 3).map((option, idx) => {
          const isSelected = selectedOptions[q.id] === String(idx);
          return (
            <button
              key={idx}
              onClick={() => onSelectOption(q.id, String(idx), option)}
              className={`p-5 text-left rounded-[16px] border flex flex-col justify-center items-start gap-1 transition-all duration-150 w-full relative min-h-[72px] h-full ${
                isSelected
                  ? 'bg-[#FCFAF6] border-[#D35A22] shadow-sm'
                  : 'bg-[#FCFAF6] border-[#DDD3C5] hover:bg-[#FCFAF6]/60 hover:border-[#6D655B]'
              }`}
            >
              <span className="font-sans text-[14.5px] leading-snug text-[#111111] pr-6 line-clamp-3">
                {cleanOptionText(option)}
              </span>

              {isSelected && (
                <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-[#D35A22] flex items-center justify-center text-[#FCFAF6]">
                  <Check className="w-2.5 h-2.5" />
                </div>
              )}
            </button>
          );
        })}

        {(() => {
          const isOtherSelected = selected === 'other';
          return (
            <button
              onClick={() => onSelectOther(q.id)}
              className={`p-5 text-left rounded-[16px] border flex flex-col justify-center items-start gap-1.5 transition-all duration-150 w-full relative min-h-[72px] h-full ${
                isOtherSelected
                  ? 'bg-[#FCFAF6] border-[#D35A22] shadow-sm'
                  : 'bg-[#FCFAF6] border-[#DDD3C5] hover:bg-[#FCFAF6]/60 hover:border-[#6D655B]'
              }`}
            >
              <div className="flex gap-2.5 items-center w-full min-w-0">
                <FileText className={`w-4 h-4 shrink-0 ${isOtherSelected ? 'text-[#D35A22]' : 'text-[#9A9187]'}`} />
                <span className={`font-sans text-[14.5px] font-medium ${isOtherSelected ? 'text-[#111111]' : 'text-[#6D655B]'} truncate`}>
                  Other / Custom Scenario
                </span>
              </div>

              {isOtherSelected ? (
                <input
                  type="text"
                  placeholder="Type custom failure vector..."
                  value={customAnswers[q.id] || ''}
                  onChange={(e) => onCustomTextChange(q.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                  className="w-full bg-transparent border-b border-[#D35A22] outline-none text-[#111111] font-sans text-[13.5px] py-0.5 mt-0.5 focus:ring-0 focus:border-b"
                />
              ) : (
                <span className="text-[11px] font-monospace text-[#9A9187] uppercase leading-none mt-1">
                  SPECIFY VULNERABILITY
                </span>
              )}

              {isOtherSelected && (
                <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-[#D35A22] flex items-center justify-center text-[#FCFAF6]">
                  <Check className="w-2.5 h-2.5" />
                </div>
              )}
            </button>
          );
        })()}
      </div>

      <div className="stepFooter flex justify-between items-center pt-3 border-t border-[#DDD3C5] shrink-0">
        {currentQuestionIndex > 0 ? (
          <button
            onClick={onBack}
            className="flex items-center gap-2 font-monospace text-[9.5px] tracking-widest font-bold text-[#6D655B] uppercase hover:text-[#111111] transition-colors leading-none"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> BACK
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={onNext}
          disabled={!isCurrentQuestionAnswered}
          className={`h-11 px-5 rounded-lg font-monospace text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 transition-all duration-150 leading-none ${
            isCurrentQuestionAnswered
              ? 'bg-[#D35A22] text-[#FCFAF6] hover:scale-[1.01] cursor-pointer'
              : 'bg-[#DDD3C5] text-[#9A9187] cursor-not-allowed'
          }`}
        >
          {isLastQuestion ? 'COMPILE VERDICT →' : 'NEXT VECTOR →'}
        </button>
      </div>
    </motion.div>
  );
}
