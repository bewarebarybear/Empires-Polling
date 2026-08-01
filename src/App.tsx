import React, { useState, useEffect } from 'react';

interface QuestionItem {
  date: string;
  question: string;
  yesVotes: number;
  noVotes: number;
}

export default function App() {
  // Empires & Polling Master Question List
  const questionsList: QuestionItem[] = [
    {
      date: '2026-08-03',
      question: 'Knowing at the start what you know now… would you ever have played E&P in the first place, given how much money it cost you?',
      yesVotes: 0,
      noVotes: 0,
    },
    {
      date: '2026-08-02',
      question: 'Are you displeased with how fast the power creep is accelerating in the game?',
      yesVotes: 0,
      noVotes: 0,
    },
    {
      date: '2026-08-01',
      question: 'Have you ever spent money in-game on E&P and genuinely regretted it?',
      yesVotes: 0,
      noVotes: 0,
    },
    {
      date: '2026-07-31',
      question: 'Does the game need to lower portal prices, or at least significantly increase what our money buys?',
      yesVotes: 342,
      noVotes: 18,
    },
    {
      date: '2026-07-30',
      question: 'Do you spend at least 100 bucks per month on Empires & Puzzles?',
      yesVotes: 85,
      noVotes: 210,
    },
    {
      date: '2026-07-29',
      question: 'Are you an E&P mega whale, spending at least 3k bucks per month?',
      yesVotes: 12,
      noVotes: 490,
    },
  ];

  // Helper to determine today's active question safely by sorting dates
  const getActiveQuestion = () => {
    const todayStr = new Date().toLocaleDateString('en-CA');
    const sorted = [...questionsList].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const found = sorted.find((q) => q.date === todayStr);
    return found || sorted.find((q) => q.date <= todayStr) || sorted[0];
  };

  const activeQ = getActiveQuestion();

  const [currentData, setCurrentData] = useState<QuestionItem>(activeQ);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [userChoice, setUserChoice] = useState<'yes' | 'no' | null>(null);
  const [view, setView] = useState<'home' | 'archive'>('home');

  useEffect(() => {
    const votedState = localStorage.getItem(`ep_voted_${currentData.date}`);
    if (votedState) {
      setHasVoted(true);
      setUserChoice(votedState as 'yes' | 'no');
    }
  }, [currentData.date]);

  const handleVote = (choice: 'yes' | 'no') => {
    if (hasVoted) return;

    if (choice === 'yes') {
      setCurrentData((prev) => ({ ...prev, yesVotes: prev.yesVotes + 1 }));
    } else {
      setCurrentData((prev) => ({ ...prev, noVotes: prev.noVotes + 1 }));
    }

    setHasVoted(true);
    setUserChoice(choice);
    localStorage.setItem(`ep_voted_${currentData.date}`, choice);
  };

  // Find yesterday's question (strictly older than current active question)
  const sortedPastQuestions = questionsList
    .filter((q) => q.date < currentData.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const yesterdayQuestion = sortedPastQuestions[0];
  const archiveList = sortedPastQuestions;

  const totalVotes = currentData.yesVotes + currentData.noVotes;
  const yesPercent = totalVotes > 0 ? Math.round((currentData.yesVotes / totalVotes) * 100) : 50;
  const noPercent = totalVotes > 0 ? 100 - yesPercent : 50;

  const formattedDate = new Date(currentData.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).toUpperCase();

  return (
    <div className="min-h-screen bg-black text-white font-mono p-4 max-w-md mx-auto flex flex-col justify-between">
      <div>
        <header className="flex justify-between items-center border-b border-white pb-3 mb-6">
          <h1 
            onClick={() => setView('home')} 
            className="text-xl font-black tracking-widest cursor-pointer text-amber-500"
          >
            EMPIRES & POLLING
          </h1>
          <span className="text-xs tracking-wider text-neutral-400">{view === 'home' ? formattedDate : 'ARCHIVE'}</span>
        </header>

        {view === 'home' ? (
          <div>
            {/* Today's Active Question */}
            <main className="mb-8">
              <h2 className="text-2xl font-bold leading-snug mb-6">{currentData.question}</h2>

              {!hasVoted ? (
                <div className="grid grid-cols-2 gap-4 h-64">
                  <button
                    onClick={() => handleVote('yes')}
                    className="bg-amber-500 hover:bg-amber-400 text-black font-black text-3xl rounded flex flex-col items-center justify-center transition-transform active:scale-95 border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                  >
                    YES
                    <span className="text-xs mt-2 font-normal tracking-wider opacity-95">TAP TO VOTE</span>
                  </button>
                  <button
                    onClick={() => handleVote('no')}
                    className="bg-neutral-800 hover:bg-neutral-700 text-white font-black text-3xl rounded flex flex-col items-center justify-center transition-transform active:scale-95 border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                  >
                    NO
                    <span className="text-xs mt-2 font-normal tracking-wider opacity-80">TAP TO VOTE</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 border-2 border-white bg-neutral-900 rounded">
                    <div className="flex justify-between text-sm mb-2 font-bold">
                      <span className="text-amber-400">YES ({yesPercent}%)</span>
                      <span className="text-neutral-400">NO ({noPercent}%)</span>
                    </div>
                    <div className="w-full bg-neutral-800 h-6 rounded overflow-hidden flex border border-white">
                      <div style={{ width: `${yesPercent}%` }} className="bg-amber-500 h-full transition-all duration-500"></div>
                      <div style={{ width: `${noPercent}%` }} className="bg-neutral-600 h-full transition-all duration-500"></div>
                    </div>
                    <p className="text-center text-xs text-neutral-400 mt-3">
                      TOTAL VOTES: {totalVotes} • YOU VOTED <span className="uppercase font-bold text-white">{userChoice}</span>
                    </p>
                  </div>
                </div>
              )}
            </main>

            {/* Yesterday's Question Section */}
            {yesterdayQuestion && (
              <section className="border-t border-neutral-800 pt-6">
                <h3 className="text-sm font-bold tracking-widest text-amber-500 mb-4">YESTERDAY</h3>
                <div className="p-4 border border-neutral-800 rounded bg-neutral-950 space-y-2">
                  <div className="flex justify-between items-center text-xs text-neutral-500 mb-2">
                    <span>{yesterdayQuestion.date}</span>
                    <span className="text-amber-400 border border-amber-900 px-2 py-0.5 rounded text-[10px]">
                      {yesterdayQuestion.yesVotes > yesterdayQuestion.noVotes ? 'YES WINS' : yesterdayQuestion.noVotes > yesterdayQuestion.yesVotes ? 'NO WINS' : 'TIE'} ({yesterdayQuestion.yesVotes} / {yesterdayQuestion.noVotes})
                    </span>
                  </div>
                  <p className="text-sm font-medium">{yesterdayQuestion.question}</p>
                </div>
              </section>
            )}

            {/* Archive Button */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setView('archive')}
                className="w-full py-3 border border-neutral-700 rounded bg-neutral-900 hover:bg-neutral-800 text-xs font-bold tracking-widest uppercase transition-colors"
              >
                View Full Poll Archive →
              </button>
            </div>
          </div>
        ) : (
          /* Separate Archive Page */
          <div className="space-y-6">
            <button
              onClick={() => setView('home')}
              className="text-xs text-neutral-400 hover:text-white mb-2 tracking-wider flex items-center space-x-1"
            >
              <span>← Back to Today's Poll</span>
            </button>
            
            <h3 className="text-sm font-bold tracking-widest text-amber-500 border-b border-neutral-800 pb-2">
              ALL PAST POLLS
            </h3>

            <div className="space-y-4">
              {archiveList.map((item, index) => {
                const computedOutcome =
                  item.yesVotes > item.noVotes
                    ? 'YES WINS'
                    : item.noVotes > item.yesVotes
                    ? 'NO WINS'
                    : 'TIE';

                return (
                  <div key={index} className="p-4 border border-neutral-800 rounded bg-neutral-950 space-y-2">
                    <div className="flex justify-between items-center text-xs text-neutral-500 mb-2">
                      <span>{item.date}</span>
                      <span className="text-amber-400 border border-amber-900 px-2 py-0.5 rounded text-[10px]">
                        {computedOutcome} ({item.yesVotes} / {item.noVotes})
                      </span>
                    </div>
                    <p className="text-sm font-medium">{item.question}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <footer className="mt-12 text-center text-xs text-neutral-600">
        Empires & Polling • Community Pulse & Meta Tracking
      </footer>
    </div>
  );
}
