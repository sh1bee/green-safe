// src/components/ui/GlassCard.tsx
import React from 'react';

const GlassCard = ({ 
  children, 
  className = "", 
  noPadding = false 
}: { 
  children?: React.ReactNode; 
  className?: string;
  noPadding?: boolean;
}) => (
  <div className={`relative backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] shadow-2xl rounded-2xl overflow-hidden flex flex-col ${className}`}>
    <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
    <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-[60px] pointer-events-none"></div>
    <div className={`relative z-10 h-full flex flex-col ${noPadding ? '' : 'p-6'}`}>
      {children}
    </div>
  </div>
);

export default GlassCard;