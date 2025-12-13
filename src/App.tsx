import React, { useState, useEffect, useMemo } from 'react';
import { Search, Bell, Flame, TreeDeciduous, AlertTriangle, Thermometer, CloudRain, ShieldCheck } from 'lucide-react';

// Components
import Sidebar from './components/layout/Sidebar';
import BootScreen from './components/layout/BootScreen';
import StatCard from './components/dashboard/StatCard';
import ArchitectureDiagram from './components/dashboard/ArchitectureDiagram';
import RiskForecastWidget from './components/dashboard/RiskForecastWidget';
import MapWidget from './components/map/MapWidget';
import AIChatWidget from './components/chat/AIChatWidget';
import RecentAlerts from './components/dashboard/RecentAlerts';
import AlertsTab from './components/dashboard/AlertsTab';

// Logic & Types
import { generateRandomTrees } from './utils/dataGenerator';
import { generateAlertsFromNodes } from './utils/alertHelper';
import { TreeNode } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [booted, setBooted] = useState(false);
  const [isAutoDemo, setIsAutoDemo] = useState(false);
  const [sensorData, setSensorData] = useState({ temp: 28, noise: 50, aqi: 40 });
  const [focusedTreeId, setFocusedTreeId] = useState<string | null>(null);

  // --- STATE LƯU TRỮ DỮ LIỆU CẢNH BÁO (CACHE) ---
  // Lưu tại App để không bị mất khi chuyển Tab
  const [weatherInfo, setWeatherInfo] = useState<{ title: string; link: string; isReal: boolean; content?: string } | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [impactLevel, setImpactLevel] = useState<number>(0);

  // --- LOGIC CÂY VÀ TRẠNG THÁI HỆ THỐNG ---
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>(() => generateRandomTrees());
  const dynamicAlerts = useMemo(() => generateAlertsFromNodes(treeNodes), [treeNodes]);

  const [systemStatus, setSystemStatus] = useState<'NORMAL' | 'WARNING'>('NORMAL');
  const [warningMessage, setWarningMessage] = useState("");

  const stats = {
    total: treeNodes.length,
    critical: treeNodes.filter(n => n.status === 'critical').length,
    warning: treeNodes.filter(n => n.status === 'warning').length,
    safe: treeNodes.filter(n => n.status === 'safe').length,
  };

  // Cập nhật trạng thái hệ thống (Xanh/Đỏ) dựa trên số lượng cây nguy hiểm
  useEffect(() => {
     if (stats.critical > 0) {
         setSystemStatus('WARNING');
     } else {
         setSystemStatus('NORMAL');
     }
  }, [stats.critical]);

  // --- LOGIC MÔ PHỎNG TÁC ĐỘNG (GỌI TỪ ALERTS TAB) ---
  const handleSimulateImpact = (severity: number, message: string) => {
    // Tạo danh sách cây mới sau khi bị bão quét qua
    const newNodes = treeNodes.map(node => {
      const resistance = node.rootHealth + (node.status === 'safe' ? 20 : 0);
      const impactChance = (Math.random() * 100) + (severity * 0.8);

      if (impactChance > resistance) {
         return { 
           ...node, 
           status: 'critical', 
           tilt: node.tilt + (Math.random() * 10 + 5),
           tiltRate: node.tiltRate + 0.5 
         } as TreeNode;
      }
      return node;
    });

    setTreeNodes(newNodes);
    setWarningMessage(message);
    setActiveTab('map'); // Chuyển sang bản đồ để xem kết quả ngay
  };

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

  // Sensor Simulation Loop
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
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              {activeTab === 'architecture' ? 'System Architecture' : 
               activeTab === 'alerts' ? 'Trung Tâm Tác Chiến' :
               activeTab === 'map' ? 'Bản Đồ Số Quốc Gia' : 'Dashboard'}
              <span className="text-emerald-500">.</span>
            </h1>
            <p className="text-slate-400 text-sm">
              {activeTab === 'architecture' ? 'Sơ đồ luồng dữ liệu 4 tầng (Device - Connectivity - AI Core - App)' : 
               activeTab === 'alerts' ? 'Kết nối dữ liệu thời gian thực từ Cục KTTV Quốc gia (Google News RSS)' :
               'Hệ thống giám sát cây xanh quốc gia (National Green Safe).'}
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

        {/* --- BANNER TRẠNG THÁI HỆ THỐNG --- */}
        {activeTab !== 'architecture' && activeTab !== 'alerts' && (
            <div className="mb-6">
                {systemStatus === 'WARNING' ? (
                    // BANNER ĐỎ (KHI CÓ CÂY HỎNG)
                    <div className="relative overflow-hidden rounded-xl border border-red-500/30 bg-red-500/10 p-4 animate-in slide-in-from-top duration-500">
                        <div className="relative flex items-center gap-4">
                            <div className="flex-shrink-0 p-3 bg-red-500/20 rounded-lg text-red-400">
                                <Flame className="w-8 h-8 animate-bounce" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-red-400">CẢNH BÁO THIÊN TAI KÍCH HOẠT</h3>
                                <p className="text-sm text-red-200">
                                    {warningMessage || "Phát hiện cây xanh gặp nguy hiểm."} ({stats.critical} cây Critical).
                                </p>
                            </div>
                            <button 
                                onClick={() => setActiveTab('alerts')}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg shadow-lg"
                            >
                                XEM CHI TIẾT
                            </button>
                        </div>
                    </div>
                ) : (
                    // BANNER XANH (MẶC ĐỊNH)
                    <div className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                        <div className="relative flex items-center gap-4">
                            <div className="flex-shrink-0 p-3 bg-emerald-500/20 rounded-lg text-emerald-400">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-emerald-400">HỆ THỐNG HOẠT ĐỘNG BÌNH THƯỜNG</h3>
                                <p className="text-sm text-emerald-200/70">
                                    Thời tiết ổn định. Không phát hiện rủi ro bất thường đối với hệ thống cây xanh.
                                </p>
                            </div>
                            <button 
                                onClick={() => setActiveTab('alerts')}
                                className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold rounded-lg border border-emerald-500/30"
                            >
                                KIỂM TRA TIN TỨC
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* --- MAIN CONTENT SWITCHER --- */}
        {activeTab === 'architecture' ? (
          <ArchitectureDiagram />
        ) : activeTab === 'alerts' ? (
          <AlertsTab 
            onSimulateImpact={handleSimulateImpact} 
            treeNodes={treeNodes} 
            // Truyền State xuống để Cache dữ liệu
            weatherInfo={weatherInfo}
            setWeatherInfo={setWeatherInfo}
            aiAnalysis={aiAnalysis}
            setAiAnalysis={setAiAnalysis}
            impactLevel={impactLevel}
            setImpactLevel={setImpactLevel}
          />
        ) : activeTab === 'map' ? (
          <div className="h-full"><MapWidget nodes={treeNodes} focusedTreeId={focusedTreeId} /></div>
        ) : (
          // --- DASHBOARD VIEW ---
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <StatCard title="Tổng số cây" value={stats.total} subtext="Toàn quốc" icon={TreeDeciduous} trend={`100%`} color="emerald" />
              <StatCard 
                title="Nguy cơ cao" 
                value={stats.critical} 
                subtext={stats.critical > 0 ? "Cần xử lý ngay" : "An toàn"} 
                icon={AlertTriangle} 
                trend={stats.critical > 0 ? "Critical" : "Stable"} 
                color={stats.critical > 0 ? "red" : "emerald"} 
              />
              <StatCard title="Nhiệt độ TB" value={`${sensorData.temp.toFixed(1)}°C`} subtext="Cảm biến thực" icon={Thermometer} color={sensorData.temp > 35 ? "red" : "blue"} />
              <StatCard title="Chỉ số AQI" value={sensorData.aqi} subtext={sensorData.aqi > 150 ? "Ô nhiễm" : "Tốt"} icon={CloudRain} trend={sensorData.aqi > 150 ? "Xấu" : "Tốt"} color={sensorData.aqi > 150 ? "orange" : "violet"} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 h-[500px]">
                 <div className="h-full">
                    <MapWidget nodes={treeNodes} focusedTreeId={focusedTreeId} />
                 </div>
                 
                 <div className="h-full flex flex-col gap-6">
                    <div className="flex-1"><RiskForecastWidget temp={sensorData.temp} /></div>
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