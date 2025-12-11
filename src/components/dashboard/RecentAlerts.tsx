import React, { useState } from 'react';
import { Activity, ChevronDown, ChevronUp } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { Alert } from '../../types';

// Thêm prop onAlertClick
const RecentAlerts = ({ alerts, onAlertClick }: { alerts: Alert[], onAlertClick: (id: string) => void }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Logic cắt list: Nếu mở rộng thì lấy 10, nếu không thì lấy 3
  const visibleAlerts = isExpanded ? alerts : alerts.slice(0, 3);

  return (
    <GlassCard className="flex-1 overflow-hidden h-full flex flex-col" noPadding>
      <div className="p-4 border-b border-white/5 font-bold text-white flex justify-between sticky top-0 bg-slate-900/50 backdrop-blur-md z-10 shrink-0">
        <span>Nhật ký cảnh báo ({alerts.length})</span>
        <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
      </div>
      
      <div className="p-2 space-y-2 overflow-y-auto flex-1 custom-scrollbar">
        {alerts.length === 0 ? (
          <div className="text-center text-slate-500 py-4 text-xs">Hệ thống bình thường.</div>
        ) : (
          visibleAlerts.map(a => (
            <div 
                key={a.id} 
                // THÊM SỰ KIỆN CLICK VÀO ĐÂY
                onClick={() => onAlertClick(a.treeId)}
                className="p-3 bg-white/5 rounded-lg border border-white/5 flex justify-between items-center hover:bg-white/10 hover:border-emerald-500/30 transition-all cursor-pointer group active:scale-[0.98]"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                   <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">{a.treeId}</span>
                   <span className="text-[10px] text-slate-500">| {a.location}</span>
                </div>
                <div className="text-[10px] text-slate-300 flex items-center gap-1">
                   <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                   {a.type}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                 <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                   a.status === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'
                 }`}>
                   {a.status}
                 </span>
                 <span className="text-[9px] text-slate-500">{a.time}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* NÚT XEM THÊM / THU GỌN */}
      {alerts.length > 3 && (
        <div className="p-2 border-t border-white/5 bg-slate-900/30 backdrop-blur shrink-0 flex justify-center">
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-colors uppercase font-bold tracking-wider"
            >
                {isExpanded ? (
                    <>Thu gọn <ChevronUp className="w-3 h-3" /></>
                ) : (
                    <>Xem thêm ({alerts.length - 3}) <ChevronDown className="w-3 h-3" /></>
                )}
            </button>
        </div>
      )}
    </GlassCard>
  );
};

export default RecentAlerts;