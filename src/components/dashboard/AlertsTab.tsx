import React, { useState, useEffect } from 'react';
import { ShieldAlert, RefreshCw, ExternalLink, Activity, Wind, CloudLightning, TreeDeciduous, Loader2 } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { fetchRealTimeWarning } from '../../utils/weatherService';
import { sendMessageWithFailover } from '../../utils/geminiManager';
import ReactMarkdown from 'react-markdown';
import { TreeNode } from '../../types';

// CẬP NHẬT KIỂU DỮ LIỆU PROPS
type AlertsTabProps = {
  onSimulateImpact: (severity: number, message: string) => void;
  treeNodes: TreeNode[];
  
  // Các props mới nhận từ App.tsx
  weatherInfo: { title: string; link: string; isReal: boolean } | null;
  setWeatherInfo: (data: any) => void;
  aiAnalysis: string;
  setAiAnalysis: (text: string) => void;
  impactLevel: number;
  setImpactLevel: (level: number) => void;
};

const AlertsTab = ({ 
  onSimulateImpact, 
  treeNodes,
  // Destructuring các props mới
  weatherInfo, setWeatherInfo,
  aiAnalysis, setAiAnalysis,
  impactLevel, setImpactLevel
}: AlertsTabProps) => {
  
  // Chỉ giữ lại state cục bộ cho các trạng thái UI (Loading)
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // LOGIC QUAN TRỌNG NHẤT:
    // Chỉ gọi API nếu chưa có dữ liệu (weatherInfo là null)
    if (!weatherInfo) {
      loadWeather();
    }
  }, []); // Chạy 1 lần khi mount, nhưng nhờ if check nên sẽ không fetch lại nếu đã có data

  const loadWeather = async () => {
    setLoading(true);
    // Reset lại dữ liệu cũ trước khi tải mới
    setAiAnalysis(""); 
    setImpactLevel(0);
    
    const data = await fetchRealTimeWarning();
    setWeatherInfo(data); // Lưu lên App.tsx
    setLoading(false);
    
    if (data.title) analyzeWithAI(data.title, data.content); 
  };

  // ... (Hàm getRelevantTreesInfo GIỮ NGUYÊN) ...
  const getRelevantTreesInfo = (newsTitle: string) => {
    // Copy lại logic cũ y nguyên vào đây
    const lowerTitle = newsTitle.toLowerCase();
    let region = "";
    let regionName = "";

    if (lowerTitle.includes("bắc") || lowerTitle.includes("hà nội")) { region = "north"; regionName = "Miền Bắc"; } 
    else if (lowerTitle.includes("trung") || lowerTitle.includes("đà nẵng") || lowerTitle.includes("huế")) { region = "central"; regionName = "Miền Trung"; } 
    else if (lowerTitle.includes("nam") || lowerTitle.includes("hồ chí minh") || lowerTitle.includes("sài gòn")) { region = "south"; regionName = "Miền Nam"; }

    if (!region) return "Tin tức có vẻ là diện rộng hoặc không xác định vùng cụ thể. Hãy phân tích chung.";

    const treesInRegion = treeNodes.filter(t => t.region === region);
    const weakTrees = treesInRegion
        .filter(t => t.status === 'critical' || (t.rootHealth && t.rootHealth < 50))
        .slice(0, 5)
        .map(t => `   - Cây ${t.id} (Trạng thái: ${t.status}, Rễ: ${t.rootHealth}%, Nghiêng: ${t.tilt}°)`)
        .join('\n');

    return `
      THÔNG TIN CÂY TRONG VÙNG ẢNH HƯỞNG (${regionName}):
      Tổng số cây quản lý: ${treesInRegion.length} cây.
      Danh sách các cây ĐẶC BIỆT YẾU cần chú ý trong vùng này:
      ${weakTrees || "Không có cây nào quá yếu, nhưng cần đề phòng."}
    `;
  };

   // Sửa hàm analyzeWithAI để nhận thêm content
   const analyzeWithAI = async (newsTitle: string, newsContent: string = "") => {
      setIsAnalyzing(true);
      
      // Lấy thông tin cây (Input)
      const treeContext = getRelevantTreesInfo(newsTitle);

      // --- PROMPT NÂNG CẤP: ÉP KHUÔN MẪU CỨNG ---
      const prompt = `
         VAI TRÒ: Hệ thống Phân tích Rủi ro Thiên tai Tự động (Green Safe AI).
         NHIỆM VỤ: Phân tích bản tin và xuất báo cáo kỹ thuật chuẩn hóa.

         === DỮ LIỆU ĐẦU VÀO ===
         1. BẢN TIN: "${newsTitle}"
         2. CHI TIẾT: "${newsContent || "Không có chi tiết"}"
         3. HIỆN TRẠNG CÂY XANH: 
         ${treeContext}

         === BẢNG QUY ĐỔI ĐIỂM RỦI RO (SEVERITY) ===
         - Bão / Áp thấp / Gió > cấp 10: 80-100 điểm (Màu Đỏ)
         - Giông lốc / Mưa đá / Gió cấp 6-9: 60-79 điểm (Màu Cam)
         - Mưa lớn / Ngập úng: 40-59 điểm (Màu Vàng)
         - Nắng nóng / Rét đậm: 20-39 điểm (Màu Xanh dương)
         -> Hãy tự suy luận điểm số dựa trên từ khóa trong bản tin.

         === KHUÔN MẪU BÁO CÁO (BẮT BUỘC TUÂN THỦ FORMAT NÀY) ===
         
         ### 🚩 BÁO CÁO TÁC ĐỘNG THIÊN TAI
         
         **1. Phân tích Sự kiện:**
         *   **Loại hình:** [Điền loại thiên tai, ví dụ: Bão số 3]
         *   **Cường độ:** [Trích xuất số liệu gió/mưa từ bản tin, ví dụ: Gió giật cấp 12]
         *   **Khu vực trọng điểm:** [Tên thành phố/khu vực đất liền bị ảnh hưởng]

         **2. Đánh giá Tác động Cây xanh:**
         *   **Cơ chế gây hại:** [Giải thích ngắn gọn vật lý, ví dụ: Gió xoáy gây vặn xoắn thân, đất nhão làm mất lực ma sát rễ]
         *   **Đối tượng nguy cơ cao:**
            *   [Liệt kê tên cây cụ thể lấy từ dữ liệu đầu vào, ví dụ: 🌲 **T-1092** (Rễ yếu 30%)]
            *   [Liệt kê tiếp nếu có...]

         **3. Khuyến nghị Hành động (SOP):**
         *   🔴 [Hành động 1 - Ưu tiên cao nhất]
         *   🟡 [Hành động 2]

         ---
         JSON_OUTPUT: {"severity": <Điền số điểm vào đây>}
      `;

      try {
         const result = await sendMessageWithFailover(newsTitle, [], prompt);
         
         // Logic tách JSON (Giữ nguyên)
         const jsonMatch = result.match(/\{"severity":\s*(\d+)\}/);
         if (jsonMatch) {
            setImpactLevel(parseInt(jsonMatch[1])); 
            // Xóa dòng JSON_OUTPUT khỏi bài văn hiển thị cho đẹp
            const cleanText = result.replace(/JSON_OUTPUT:.*$/, '').replace(/\{"severity":\s*\d+\}/, '');
            setAiAnalysis(cleanText.trim()); 
         } else {
            setImpactLevel(50);
            setAiAnalysis(result);
         }
      } catch (e) {
         setAiAnalysis("⚠️ Lỗi kết nối AI. Vui lòng thử lại.");
      } finally {
         setIsAnalyzing(false);
      }
   };

  const handleApplySimulation = () => {
    onSimulateImpact(impactLevel, weatherInfo?.title || "Thiên tai");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full animate-in fade-in duration-500">
      
      <div className="flex flex-col gap-6">
        <GlassCard className="border-l-4 border-l-blue-500 relative overflow-hidden">
           <div className="absolute right-0 top-0 opacity-10 p-4"><CloudLightning className="w-32 h-32" /></div>
           <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400"><ShieldAlert className="w-6 h-6" /></div>
              <div>
                 <h2 className="text-lg font-bold text-white">Nguồn tin Quốc gia</h2>
                 <p className="text-xs text-slate-400 uppercase tracking-widest">Trung tâm Dự báo KTTV Quốc gia</p>
              </div>
           </div>

           {/* HIỂN THỊ DỮ LIỆU TỪ PROPS (weatherInfo) */}
           {loading ? (
             <div className="py-8 flex justify-center text-slate-400"><Loader2 className="animate-spin" /></div>
           ) : weatherInfo ? (
             <div className="relative z-10">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-4">
                   <h3 className="text-xl font-bold text-white leading-relaxed mb-2">{weatherInfo.title}</h3>
                   <div className="flex items-center gap-2 text-xs">
                      {weatherInfo.isReal ? (
                        <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                          <Activity className="w-3 h-3" /> Dữ liệu thực
                        </span>
                      ) : (
                        <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/20">Dữ liệu giả lập</span>
                      )}
                      <span className="text-slate-500">Đã lưu trữ</span>
                   </div>
                </div>
                <div className="flex gap-3">
                   <a href={weatherInfo.link} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
                      <ExternalLink className="w-4 h-4" /> Đọc bài gốc
                   </a>
                   {/* Nút Làm Mới sẽ gọi lại loadWeather() để ép cập nhật tin mới */}
                   <button onClick={loadWeather} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors">
                      <RefreshCw className="w-4 h-4" /> Cập nhật tin mới
                   </button>
                </div>
             </div>
           ) : (
             <div className="text-red-400">Chưa có dữ liệu. Đang tải...</div>
           )}
        </GlassCard>

        <GlassCard className="flex-1 border-t-4 border-t-red-500 flex flex-col justify-center items-center text-center p-8">
           <Wind className={`w-16 h-16 mb-4 ${impactLevel > 50 ? 'text-red-500 animate-pulse' : 'text-slate-600'}`} />
           <h3 className="text-2xl font-bold text-white mb-1">Mô phỏng Tác động</h3>
           <p className="text-slate-400 text-sm mb-6 max-w-md">Kích hoạt hệ thống Simulation Engine...</p>
           
           {isAnalyzing ? (
              <button disabled className="px-8 py-4 bg-slate-700 text-slate-400 rounded-xl font-bold flex items-center gap-3 cursor-not-allowed">
                 <Loader2 className="animate-spin" /> Đang tính toán tham số...
              </button>
           ) : (
              <button onClick={handleApplySimulation} className="group relative px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all active:scale-95">
                 <div className="flex items-center gap-3"><TreeDeciduous className="w-6 h-6" /> KÍCH HOẠT ỨNG CỨU</div>
              </button>
           )}
           <div className="mt-4 text-xs text-slate-500">
              Mức độ thiệt hại dự báo: <span className="text-white font-bold">{impactLevel}%</span>
           </div>
        </GlassCard>
      </div>

      <GlassCard className="flex flex-col h-full border-t-4 border-t-purple-500">
         <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center"><Activity className="w-5 h-5 text-white" /></div>
             <div><h2 className="text-lg font-bold text-white">AI Chiến lược</h2><p className="text-xs text-purple-400">Phân tích rủi ro & Đề xuất</p></div>
         </div>
         
         <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {/* HIỂN THỊ DỮ LIỆU TỪ PROPS (aiAnalysis) */}
            {isAnalyzing ? (
               <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  <div className="h-4 bg-white/10 rounded w-1/2"></div>
                  <div className="h-32 bg-white/5 rounded-xl border border-white/5"></div>
               </div>
            ) : aiAnalysis ? (
               <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown 
                    components={{
                        strong: ({node, ...props}) => <span className="text-purple-300 font-bold" {...props} />,
                        ul: ({node, ...props}) => <ul className="space-y-2 my-4 bg-white/5 p-4 rounded-xl border border-white/5" {...props} />,
                        li: ({node, ...props}) => <li className="flex gap-2" {...props} />,
                    }}
                  >
                     {aiAnalysis}
                  </ReactMarkdown>
               </div>
            ) : (
               <div className="text-center text-slate-500 mt-20">Đang chờ dữ liệu đầu vào...</div>
            )}
         </div>
      </GlassCard>
    </div>
  );
};

export default AlertsTab;