import React, { useState, useEffect, useMemo } from 'react';
import { Search, Bell, Flame, TreeDeciduous, AlertTriangle, Thermometer, CloudRain } from 'lucide-react';

// Components
import Sidebar from './components/layout/Sidebar';
import BootScreen from './components/layout/BootScreen';
import StatCard from './components/dashboard/StatCard';
import ArchitectureDiagram from './components/dashboard/ArchitectureDiagram';
import RiskForecastWidget from './components/dashboard/RiskForecastWidget';
import MapWidget from './components/map/MapWidget';
import AIChatWidget from './components/chat/AIChatWidget';
import RecentAlerts from './components/dashboard/RecentAlerts';

// Logic
import { generateRandomTrees } from './utils/dataGenerator';
import { generateAlertsFromNodes } from './utils/alertHelper';
import { TreeNode } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [booted, setBooted] = useState(false);
  const [isAutoDemo, setIsAutoDemo] = useState(false);
  const [sensorData, setSensorData] = useState({ temp: 28, noise: 60, aqi: 50 });

  // STATE MỚI: Dùng để focus vào cây khi click ở bảng cảnh báo
  const [focusedTreeId, setFocusedTreeId] = useState<string | null>(null);

  const [treeNodes] = useState<TreeNode[]>(() => generateRandomTrees());
  const dynamicAlerts = useMemo(() => generateAlertsFromNodes(treeNodes), [treeNodes]);

  const stats = {
    total: treeNodes.length,
    critical: treeNodes.filter(n => n.status === 'critical').length,
    warning: treeNodes.filter(n => n.status === 'warning').length,
    safe: treeNodes.filter(n => n.status === 'safe').length,
  };

  // ... (Giữ nguyên phần useEffect AutoDemo và Sensor Simulation) ...
  // Auto Demo Logic
  useEffect(() => {
    let interval: any;
    if (isAutoDemo) {
      const tabs = ['dashboard', 'architecture', 'map'];
      let currentIndex = tabs.indexOf(activeTab);
      if (currentIndex === -1) currentIndex = 0;
      interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % tabs.length;
        setActiveTab(tabs[currentIndex]);
      }, 8000); 
    }
    return () => clearInterval(interval);
  }, [isAutoDemo, activeTab]);

  // Sensor Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const isSpike = Math.random() > 0.85;
      const newTemp = isSpike ? 36 + Math.random() * 5 : 28 + Math.random() * 3;
      const newNoise = isSpike ? 90 + Math.random() * 10 : 50 + Math.random() * 20;
      const newAqi = isSpike ? 160 + Math.random() * 40 : 40 + Math.random() * 40;
      setSensorData({ temp: newTemp, noise: newNoise, aqi: Math.floor(newAqi) });
    }, 4000); 
    return () => clearInterval(interval);
  }, []);

  if (!booted) {
    return <BootScreen onComplete={() => setBooted(true)} />;
  }

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-slate-200 selection:bg-emerald-500/30 animate-in fade-in duration-700 font-sans">
       {/* ... (Phần Background và Sidebar giữ nguyên) ... */}
       <div className="fixed top-0 left-0 w-screen h-screen overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]"></div>
      </div>

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onToggleAutoDemo={() => setIsAutoDemo(!isAutoDemo)}
        isAutoDemo={isAutoDemo}
      />

      <main className="flex-1 p-4 lg:p-8 overflow-y-auto h-screen relative z-10">
        {/* ... (Header và phần Alert Banner, StatCard giữ nguyên) ... */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              {activeTab === 'architecture' ? 'System Architecture' : 'Dashboard'}
              <span className="text-emerald-500">.</span>
            </h1>
            <p className="text-slate-400 text-sm">
              {activeTab === 'architecture' 
                ? 'Sơ đồ luồng dữ liệu 4 tầng (Device - Connectivity - AI Core - App)' 
                : 'Hệ thống giám sát cây xanh quốc gia (National Green Safe).'}
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="relative group flex-1 md:flex-none">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full md:w-64 pl-10 pr-3 py-2.5 border border-white/10 rounded-xl leading-5 bg-white/5 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-white/10 focus:border-emerald-500/50 sm:text-sm transition-all duration-200"
                placeholder="Tìm kiếm Node, Khu vực..."
              />
            </div>
            <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors relative">
              <Bell className="w-5 h-5 text-slate-300" />
              {stats.critical > 0 && <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
            </button>
          </div>
        </header>

        {activeTab === 'architecture' ? (
          <ArchitectureDiagram />
        ) : (
          <>
            {(stats.critical > 0 || sensorData.temp > 35) && (
               <div className="mb-6 relative overflow-hidden rounded-xl border border-red-500/30 bg-red-500/10 p-4 animate-pulse">
               <div className="relative flex items-center gap-4">
                 <div className="flex-shrink-0 p-3 bg-red-500/20 rounded-lg text-red-400">
                   <Flame className="w-8 h-8 animate-bounce" />
                 </div>
                 <div className="flex-1">
                   <h3 className="text-lg font-bold text-red-400">CẢNH BÁO HỆ THỐNG</h3>
                   <p className="text-sm text-red-200">
                     Phát hiện {stats.critical} cây có nguy cơ gãy đổ cao.
                     {sensorData.temp > 35 && ` Nhiệt độ môi trường tăng cao (${sensorData.temp.toFixed(1)}°C).`}
                   </p>
                 </div>
                 <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg">Kích hoạt ứng cứu</button>
               </div>
             </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
               <StatCard title="Tổng số cây" value={stats.total} subtext="Toàn quốc" icon={TreeDeciduous} trend={`+${stats.safe} safe`} color="emerald" />
               <StatCard title="Nguy cơ cao" value={stats.critical} subtext="Cần xử lý ngay" icon={AlertTriangle} trend="Critical" color="red" />
               <StatCard title="Nhiệt độ TB" value={`${sensorData.temp.toFixed(1)}°C`} subtext="Cảm biến thực" icon={Thermometer} color={sensorData.temp > 35 ? "red" : "blue"} />
               <StatCard title="Chỉ số AQI" value={sensorData.aqi} subtext={sensorData.aqi > 150 ? "Ô nhiễm" : "Tốt"} icon={CloudRain} trend={sensorData.aqi > 150 ? "Xấu" : "Tốt"} color={sensorData.aqi > 150 ? "orange" : "violet"} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 h-[500px]">
                 
                 {/* TRUYỀN focusedTreeId XUỐNG MAP ĐỂ MAP BIẾT CẦN ZOOM CÂY NÀO */}
                 <div className="h-full">
                    <MapWidget nodes={treeNodes} focusedTreeId={focusedTreeId} />
                 </div>
                 
                 <div className="h-full flex flex-col gap-6">
                    <div className="flex-1"><RiskForecastWidget temp={sensorData.temp} /></div>
                    
                    {/* TRUYỀN HÀM XỬ LÝ CLICK XUỐNG RECENT ALERTS */}
                    <RecentAlerts alerts={dynamicAlerts} onAlertClick={setFocusedTreeId} />
                 </div>
              </div>
              
              <div className="h-[500px]">
                <AIChatWidget 
                  isAutoDemo={isAutoDemo} 
                  treeNodes={treeNodes}
                  sensorData={sensorData}
                  alerts={dynamicAlerts} 
                />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}