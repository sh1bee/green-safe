import React, { useState } from 'react';
import { LayoutDashboard, Layers, Map as MapIcon, Cpu, AlertTriangle, TreeDeciduous, Loader2, Play, FileText, Zap } from 'lucide-react';
import GlassCard from '../ui/GlassCard';

const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  onToggleAutoDemo, 
  isAutoDemo
}: { 
  activeTab: string, 
  setActiveTab: (t: string) => void,
  onToggleAutoDemo: () => void,
  isAutoDemo: boolean
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert("Đã xuất báo cáo: GREEN_SAFE_REPORT_2024.pdf");
    }, 2000);
  };

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
    { id: 'architecture', icon: Layers, label: 'Kiến trúc hệ thống' },
    { id: 'map', icon: MapIcon, label: 'Bản đồ Số' },
    { id: 'devices', icon: Cpu, label: 'Thiết bị AIoT' },
    { id: 'alerts', icon: AlertTriangle, label: 'Cảnh báo' },
  ];

  return (
    <div className="h-full flex flex-col py-6 w-20 lg:w-64 transition-all duration-300 border-r border-white/5 bg-slate-900/50 backdrop-blur-lg fixed lg:static z-50">
      <div className="flex items-center gap-3 px-6 mb-10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
          <TreeDeciduous className="text-white w-6 h-6" />
        </div>
        <div className="flex flex-col hidden lg:flex">
          <span className="text-lg font-bold text-white tracking-wide">Green Safe</span>
          <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">Smart Urban Guard</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2 px-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${
              activeTab === item.id 
                ? 'bg-gradient-to-r from-emerald-500/20 to-transparent text-emerald-300' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {activeTab === item.id && (
              <div className="absolute left-0 h-full w-1 bg-emerald-500 rounded-r-full shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
            )}
            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-emerald-400' : ''}`} />
            <span className="hidden lg:block font-medium">{item.label}</span>
          </button>
        ))}

        {/* Divider */}
        <div className="h-px bg-white/5 my-2 mx-4"></div>
        
        <div className="text-xs font-bold text-slate-500 px-4 mb-2 uppercase tracking-wider hidden lg:block">Công cụ</div>

        {/* Auto Demo Button */}
        <button
          onClick={onToggleAutoDemo}
          className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group border ${
            isAutoDemo 
              ? 'border-red-500/30 bg-red-500/10 text-red-400' 
              : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-white'
          }`}
        >
           {isAutoDemo ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 group-hover:text-emerald-400" />}
          <span className="hidden lg:block font-medium">
            {isAutoDemo ? 'Dừng Demo' : 'Auto Demo'}
          </span>
        </button>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-200 group"
        >
          {isExporting ? (
            <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
          ) : (
            <FileText className="w-5 h-5 group-hover:text-emerald-400" />
          )}
          <span className="hidden lg:block font-medium">
            {isExporting ? 'Đang xuất...' : 'Xuất báo cáo'}
          </span>
        </button>
      </div>

      <div className="px-6 mt-auto">
        <GlassCard className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 !border-white/5" noPadding>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-bold text-slate-200">System Health</span>
              </div>
              <span className="text-xs text-emerald-400 font-mono">98.5%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full w-[98.5%] bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)]"></div>
            </div>
            <div className="mt-2 text-[10px] text-slate-500">Node T-1092 sending data...</div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
export default Sidebar;