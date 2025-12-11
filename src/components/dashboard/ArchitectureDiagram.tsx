import React from 'react';
import { 
  Cpu, Activity, Wifi, ArrowRight, Share2, Server, Database, CloudRain, 
  BrainCircuit, Smartphone, LayoutDashboard, Bot, Bell 
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';

const ArchitectureDiagram = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 lg:p-0">
    {/* Layer 1 */}
    <GlassCard className="border-emerald-500/30">
      <div className="absolute top-0 right-0 p-2 opacity-10">
        <Cpu className="w-24 h-24" />
      </div>
      <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4">Tầng 1: Vật lý & Biên</div>
      <div className="text-xl font-bold text-white mb-2">Green Node</div>
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-300 bg-white/5 p-2 rounded">
          <Activity className="w-4 h-4 text-emerald-400" /> MPU6050 (Sensor)
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-300 bg-white/5 p-2 rounded">
          <Cpu className="w-4 h-4 text-blue-400" /> ESP32 (Controller)
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-300 bg-white/5 p-2 rounded">
          <Wifi className="w-4 h-4 text-yellow-400" /> LoRa Module
        </div>
      </div>
      <div className="mt-auto flex justify-center text-emerald-500/50">
        <ArrowRight className="animate-pulse" />
      </div>
    </GlassCard>

    {/* Layer 2 */}
    <GlassCard className="border-blue-500/30">
      <div className="absolute top-0 right-0 p-2 opacity-10">
        <Share2 className="w-24 h-24" />
      </div>
      <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Tầng 2: Kết nối & Dữ liệu</div>
      <div className="text-xl font-bold text-white mb-2">Gateway & Cloud</div>
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-300 bg-white/5 p-2 rounded">
          <Server className="w-4 h-4 text-blue-400" /> The Things Network
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-300 bg-white/5 p-2 rounded">
          <Share2 className="w-4 h-4 text-purple-400" /> MQTT Broker
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-300 bg-white/5 p-2 rounded">
          <Database className="w-4 h-4 text-emerald-400" /> InfluxDB (Time-series)
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-300 bg-white/5 p-2 rounded border border-yellow-500/30">
          <CloudRain className="w-4 h-4 text-yellow-400" /> External Weather API
        </div>
      </div>
      <div className="mt-auto flex justify-center text-blue-500/50">
        <ArrowRight className="animate-pulse" />
      </div>
    </GlassCard>

    {/* Layer 3 */}
    <GlassCard className="border-purple-500/30 bg-purple-500/5">
      <div className="absolute top-0 right-0 p-2 opacity-10">
        <BrainCircuit className="w-24 h-24" />
      </div>
      <div className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4">Tầng 3: AI Core (Quan trọng)</div>
      <div className="text-xl font-bold text-white mb-2">Intelligence Engine</div>
      <div className="space-y-2 mb-4">
        <div className="bg-purple-500/20 p-3 rounded border border-purple-500/30">
          <div className="text-sm font-bold text-white">Anomaly Detection</div>
          <div className="text-xs text-purple-200">Phát hiện bất thường rung chấn</div>
        </div>
        <div className="bg-purple-500/20 p-3 rounded border border-purple-500/30">
          <div className="text-sm font-bold text-white">LSTM Forecaster</div>
          <div className="text-xs text-purple-200">Dự báo nguy cơ đổ cây</div>
        </div>
      </div>
      <div className="mt-auto flex justify-center text-purple-500/50">
        <ArrowRight className="animate-pulse" />
      </div>
    </GlassCard>

    {/* Layer 4 */}
    <GlassCard className="border-orange-500/30">
      <div className="absolute top-0 right-0 p-2 opacity-10">
        <Smartphone className="w-24 h-24" />
      </div>
      <div className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-4">Tầng 4: Ứng dụng</div>
      <div className="text-xl font-bold text-white mb-2">User Interaction</div>
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-300 bg-white/5 p-2 rounded">
          <LayoutDashboard className="w-4 h-4 text-orange-400" /> Web Dashboard
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-300 bg-white/5 p-2 rounded">
          <Bot className="w-4 h-4 text-emerald-400" /> GenAI Assistant
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-300 bg-white/5 p-2 rounded">
          <Bell className="w-4 h-4 text-red-400" /> SMS/Zalo Alert
        </div>
      </div>
    </GlassCard>
  </div>
);

export default ArchitectureDiagram;