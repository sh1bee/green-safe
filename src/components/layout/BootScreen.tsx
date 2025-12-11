import React, { useState, useEffect } from 'react';
import { TreeDeciduous } from 'lucide-react';

const BootScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState("Initializing System...");

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + Math.floor(Math.random() * 10) + 1;
      });
    }, 150);

    const texts = [
      "Loading Green Node Modules...",
      "Connecting to The Things Network...",
      "Syncing with InfluxDB...",
      "Activating LSTM Model...",
      "System Ready."
    ];

    let textIndex = 0;
    const textInterval = setInterval(() => {
      textIndex++;
      if (textIndex < texts.length) setText(texts[textIndex]);
    }, 600);

    return () => {
      clearInterval(interval);
      clearInterval(textInterval);
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-[#0f172a] z-[100] flex flex-col items-center justify-center text-emerald-500">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <TreeDeciduous className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-emerald-400" />
      </div>
      <div className="font-mono text-2xl font-bold tracking-widest mb-2">GREEN SAFE</div>
      <div className="font-mono text-sm text-emerald-400/70 mb-6">{text}</div>
      
      <div className="w-64 h-1 bg-emerald-900 rounded-full overflow-hidden">
        <div 
          className="h-full bg-emerald-400 transition-all duration-200 ease-out shadow-[0_0_10px_rgba(16,185,129,0.6)]" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="mt-2 font-mono text-xs text-emerald-600">{progress}%</div>
    </div>
  );
};

export default BootScreen;