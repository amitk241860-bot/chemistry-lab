'use client';

import React, { useState } from 'react';
import type { QuizQuestion } from '@/types/experiment';
import { AwardIcon, CheckIcon, XIcon, SparklesIcon } from '@/components/ui/Icons';
import { CyanButton } from '@/components/ui/CyanButton';

interface QuizModalProps {
  questions: QuizQuestion[];
  experimentTitle: string;
  onFinishQuiz: (score: number) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  questions,
  experimentTitle,
  onFinishQuiz,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const score = isSubmitted ? calculateScore() : 0;
  const allAnswered = Object.keys(selectedAnswers).length === questions.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.2)] p-6 md:p-8 my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <AwardIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Post-Lab Concept Quiz</h2>
              <p className="text-xs text-slate-400 truncate max-w-sm">{experimentTitle}</p>
            </div>
          </div>
          {isSubmitted && (
            <div className="text-right">
              <span className="text-2xl font-black text-cyan-400">{score}%</span>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Final Score</p>
            </div>
          )}
        </div>

        {/* Questions List */}
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
          {questions.map((q, qIdx) => {
            const selected = selectedAnswers[qIdx];
            const isCorrect = selected === q.correctIndex;

            return (
              <div
                key={q.id}
                className="bg-slate-950/50 border border-white/5 rounded-xl p-4 space-y-3"
              >
                <div className="text-sm font-semibold text-slate-100 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {qIdx + 1}
                  </span>
                  <span>{q.question}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, optIdx) => {
                    const isChoice = selected === optIdx;
                    let style = 'bg-slate-900/80 border-white/5 text-slate-300 hover:border-cyan-500/40';

                    if (isSubmitted) {
                      if (optIdx === q.correctIndex) {
                        style = 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200 font-medium';
                      } else if (isChoice && !isCorrect) {
                        style = 'bg-rose-950/60 border-rose-500/60 text-rose-200 line-through';
                      } else {
                        style = 'opacity-50 border-white/5 text-slate-500';
                      }
                    } else if (isChoice) {
                      style = 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-medium';
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={isSubmitted}
                        onClick={() => handleSelectOption(qIdx, optIdx)}
                        className={`text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${style}`}
                      >
                        <span>{opt}</span>
                        {isSubmitted && optIdx === q.correctIndex && (
                          <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                        )}
                        {isSubmitted && isChoice && !isCorrect && (
                          <XIcon className="w-4 h-4 text-rose-400 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {isSubmitted && (
                  <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-xs text-slate-300 leading-relaxed">
                    <span className="font-semibold text-cyan-400">Explanation: </span>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-6">
          <div className="text-xs text-slate-400">
            {isSubmitted
              ? 'Results saved to your local offline student progress.'
              : `${Object.keys(selectedAnswers).length} of ${questions.length} answered`}
          </div>
          <div>
            {!isSubmitted ? (
              <CyanButton
                variant="primary"
                size="md"
                disabled={!allAnswered}
                onClick={handleSubmit}
              >
                Submit Answers
              </CyanButton>
            ) : (
              <CyanButton
                variant="primary"
                size="md"
                icon={<SparklesIcon className="w-4 h-4" />}
                onClick={() => onFinishQuiz(score)}
              >
                Complete & Finish Experiment
              </CyanButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
