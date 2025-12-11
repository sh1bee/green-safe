import React, { useMemo } from 'react';
import { BrainCircuit, Wind, Droplets, ThermometerSun } from 'lucide-react';
import GlassCard from '../ui/GlassCard';

// Nhận sensorData để tính toán biểu đồ động
const RiskForecastWidget = ({ temp }: { temp: number }) => {
  
  // Logic giả lập: Nhiệt độ càng cao -> Rủi ro các giờ tới càng tăng
  const forecastData = useMemo(() => {
    const baseRisk = (temp - 25) * 5; // Công thức bịa: Cứ hơn 25 độ là tăng rủi ro
    const hours = ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
    
    return hours.map((time, i) => {
       // Tạo đường cong rủi ro ngẫu nhiên nhưng dựa trên nhiệt độ
       let risk = baseRisk + Math.random() * 30 + (i * 5); 
       if (risk > 100) risk = 95;
       if (risk < 10) risk = 10;
       return { time, risk: Math.floor(risk) };
    });
  }, [temp]);

  // Tìm giờ rủi ro cao nhất
  const peakRisk = Math.max(...forecastData.map(d => d.risk));

  return (
    <GlassCard className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">Dự báo Rủi ro AI</h3>
            <p className="text-[10px] text-slate-400">Mô hình LSTM v2.1</p>
          </div>
        </div>
        <div className="text-right">
             <div className="text-xs text-emerald-400 font-bold">Confidence: 94%</div>
             <div className="text-[10px] text-slate-500">Updated: Just now</div>
        </div>
      </div>

      {/* Chart Bars */}
      <div className="flex items-end gap-2 h-32 mt-2 px-2">
        {forecastData.map((item, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
             {/* Tooltip bar */}
             <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] px-2 py-1 rounded border border-white/10 whitespace-nowrap z-10">
                Rủi ro: {item.risk}%
             </div>

             <div className="w-full relative h-full flex items-end">
                <div 
                  className={`w-full rounded-t-sm transition-all duration-1000 ease-out relative overflow-hidden ${
                    item.risk > 70 ? 'bg-gradient-to-t from-red-600 to-red-400' : 
                    item.risk > 40 ? 'bg-gradient-to-t from-yellow-600 to-yellow-400' : 
                    'bg-gradient-to-t from-emerald-600 to-emerald-400'
                  }`}
                  style={{ height: `${item.risk}%` }}
                >
                    {/* Hiệu ứng quét sáng */}
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                </div>
             </div>
             <span className="text-[9px] text-slate-400 font-mono">{item.time}</span>
          </div>
        ))}
      </div>

      {/* Phân tích nguyên nhân (Context Factors) */}
      <div className="mt-auto pt-4 border-t border-white/5 grid grid-cols-3 gap-2">
          <div className="bg-white/5 rounded p-2 flex flex-col items-center gap-1 border border-white/5">
              <Wind className={`w-4 h-4 ${peakRisk > 70 ? 'text-red-400 animate-pulse' : 'text-slate-400'}`} />
              <span className="text-[9px] text-slate-400">Gió giật</span>
              <span className="text-xs font-bold text-white">{peakRisk > 70 ? 'Cấp 7' : 'Cấp 3'}</span>
          </div>
          <div className="bg-white/5 rounded p-2 flex flex-col items-center gap-1 border border-white/5">
              <Droplets className="w-4 h-4 text-blue-400" />
              <span className="text-[9px] text-slate-400">Độ ẩm đất</span>
              <span className="text-xs font-bold text-white">45%</span>
          </div>
          <div className="bg-white/5 rounded p-2 flex flex-col items-center gap-1 border border-white/5">
              <ThermometerSun className="w-4 h-4 text-orange-400" />
              <span className="text-[9px] text-slate-400">Nhiệt mặt</span>
              <span className="text-xs font-bold text-white">{temp.toFixed(0)}°C</span>
          </div>
      </div>
    </GlassCard>
  );
};

export default RiskForecastWidget;