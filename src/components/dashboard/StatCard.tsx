import React from 'react';
import { ArrowUpRight, LucideIcon } from 'lucide-react';
import GlassCard from '../ui/GlassCard';

type StatCardProps = {
  title: string;
  value: string | number;
  subtext: string;
  icon: LucideIcon; // Định nghĩa kiểu cho Icon chính xác
  trend?: string;
  color?: string;
}

const StatCard = ({ title, value, subtext, icon: Icon, trend, color = "emerald" }: StatCardProps) => (
  <GlassCard className="group hover:border-white/20 transition-colors duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl bg-${color}-500/10 border border-${color}-500/20 text-${color}-400`}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
          <ArrowUpRight className="w-3 h-3" />
          {trend}
        </div>
      )}
    </div>
    <div>
      <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
      <div className="text-2xl lg:text-3xl font-bold text-white mb-1 tracking-tight">{value}</div>
      <p className="text-xs text-slate-500">{subtext}</p>
    </div>
    {/* Decoration */}
    <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-${color}-500 to-transparent opacity-50`}></div>
  </GlassCard>
);

export default StatCard;