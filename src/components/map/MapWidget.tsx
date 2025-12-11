import React, { useState, useMemo, useEffect } from 'react';
import { TreeDeciduous, Wifi, Map as MapIcon, ArrowLeft, ZoomIn } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { TreeNode, Region } from '../../types';

// Thêm prop focusedTreeId
const MapWidget = ({ nodes, focusedTreeId }: { nodes: TreeNode[], focusedTreeId: string | null }) => {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  // LOGIC TỰ ĐỘNG CHUYỂN VÙNG KHI CÓ FOCUS
  useEffect(() => {
    if (focusedTreeId) {
        const targetNode = nodes.find(n => n.id === focusedTreeId);
        if (targetNode) {
            setSelectedRegion(targetNode.region);
        }
    }
  }, [focusedTreeId, nodes]);

  const displayNodes = useMemo(() => {
    if (!selectedRegion) return [];
    return nodes.filter(n => n.region === selectedRegion);
  }, [nodes, selectedRegion]);

  const getRegionStats = (region: Region) => {
    const regionNodes = nodes.filter(n => n.region === region);
    const critical = regionNodes.filter(n => n.status === 'critical').length;
    return { total: regionNodes.length, critical };
  };

  return (
    <GlassCard className="h-full relative group !p-0 overflow-hidden" noPadding>
      <div className="absolute inset-0 bg-slate-900">
        <div className="w-full h-full opacity-20" style={{ 
          backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }}></div>

        {!selectedRegion && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 animate-in fade-in zoom-in duration-500">
             <div className="text-center mb-2">
                <h3 className="text-emerald-400 font-bold uppercase tracking-widest text-sm">Bản đồ giám sát quốc gia</h3>
                <p className="text-slate-400 text-xs">Chọn khu vực để xem chi tiết</p>
             </div>
             
             <div className="flex flex-col gap-3 w-full max-w-[200px]">
                {(['north', 'central', 'south'] as Region[]).map(region => {
                   const stats = getRegionStats(region);
                   const labels = { north: "Miền Bắc", central: "Miền Trung", south: "Miền Nam" };
                   
                   return (
                     <button 
                       key={region}
                       onClick={() => setSelectedRegion(region)}
                       className={`relative p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all group/btn flex justify-between items-center
                         ${stats.critical > 0 ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''}
                       `}
                     >
                        <div className="flex items-center gap-3">
                           <MapIcon className="w-5 h-5 text-slate-400 group-hover/btn:text-white" />
                           <div className="text-left">
                              <div className="text-sm font-bold text-white">{labels[region]}</div>
                              <div className="text-[10px] text-slate-400">{stats.total} trạm quan trắc</div>
                           </div>
                        </div>
                        {stats.critical > 0 && (
                           <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white animate-pulse">
                              {stats.critical}
                           </div>
                        )}
                        {!stats.critical && <ZoomIn className="w-4 h-4 text-slate-600 group-hover/btn:text-emerald-400" />}
                     </button>
                   );
                })}
             </div>
          </div>
        )}

        {selectedRegion && (
          <div className="absolute inset-0 animate-in slide-in-from-bottom duration-500">
             <div className="absolute top-4 left-4 z-20 flex gap-2">
                <button 
                  onClick={() => setSelectedRegion(null)}
                  className="bg-slate-800/80 backdrop-blur border border-white/10 p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                >
                   <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="bg-emerald-500/10 backdrop-blur border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs text-emerald-400 font-bold uppercase flex items-center gap-2">
                   {selectedRegion === 'north' ? "Miền Bắc" : selectedRegion === 'central' ? "Miền Trung" : "Miền Nam"}
                   <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                </div>
             </div>

             {displayNodes.map((node) => {
                // KIỂM TRA XEM CÓ PHẢI CÂY ĐANG ĐƯỢC CHỌN KHÔNG
                const isFocused = node.id === focusedTreeId;
                
                return (
                  <div 
                    key={node.id}
                    className={`absolute rounded-full cursor-pointer transition-all duration-500 group/node z-10
                      ${node.status === 'critical' ? 'bg-red-500' : node.status === 'warning' ? 'bg-yellow-500' : 'bg-emerald-500'}
                      
                      ${/* LOGIC STYLE KHI ĐƯỢC FOCUS */ ''}
                      ${isFocused ? 'w-5 h-5 shadow-[0_0_0_4px_rgba(255,255,255,0.3)] z-50 scale-125' : 'w-3 h-3 opacity-80 hover:scale-125'}
                    `}
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  >
                    {isFocused && <div className="absolute inset-0 rounded-full border-2 border-white animate-ping"></div>}

                    <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-white/10 px-3 py-2 rounded-lg transition-opacity whitespace-nowrap z-50 shadow-xl backdrop-blur-md
                        ${isFocused ? 'opacity-100' : 'opacity-0 group-hover/node:opacity-100 pointer-events-none'}
                    `}>
                      <div className="flex items-center gap-2 mb-1">
                        <TreeDeciduous className={`w-3 h-3 ${node.status === 'critical' ? 'text-red-400' : 'text-emerald-400'}`} />
                        <span className="font-bold text-xs text-white">{node.id}</span>
                      </div>
                      <div className="text-[10px] text-slate-300">Nghiêng: {node.tilt.toFixed(1)}°</div>
                    </div>
                    
                    {node.status === 'critical' && !isFocused && (
                       <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                    )}
                  </div>
                );
             })}
          </div>
        )}

        <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur border border-white/10 p-3 rounded-xl z-20 pointer-events-none">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> An toàn
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Cảnh báo
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Nguy hiểm
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default MapWidget;