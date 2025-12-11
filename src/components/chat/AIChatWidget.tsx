import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Bot, MoreHorizontal, Send, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // Import thư viện làm đẹp text
import GlassCard from '../ui/GlassCard';
import { ChatMessage, TreeNode, Alert } from '../../types';

type AIChatProps = {
  isAutoDemo: boolean;
  treeNodes: TreeNode[];
  sensorData: { temp: number; noise: number; aqi: number };
  alerts: Alert[];
}

const AIChatWidget = ({ isAutoDemo, treeNodes, sensorData, alerts }: AIChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, sender: 'ai', text: 'Xin chào! **GreenAI** đã kích hoạt. Dữ liệu 3 miền Bắc - Trung - Nam đã sẵn sàng. Bạn cần kiểm tra gì?' }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const apiKey = import.meta.env.VITE_API_KEY || "";
  
  const genAI = useMemo(() => {
    if (apiKey) return new GoogleGenerativeAI(apiKey);
    return null;
  }, [apiKey]);

  const createSystemPrompt = () => {
      // Lọc ra top 3 cây có nguy cơ đổ cao nhất (Dự báo tương lai)
      const topRisks = treeNodes
          .sort((a, b) => b.fallProbability - a.fallProbability)
          .slice(0, 3);

      const formatRisk = (nodes: TreeNode[]) => nodes.map(n => 
          `Cây **${n.id}** (Nguy cơ đổ: ${n.fallProbability}%): Nghiêng ${n.tilt}°, Tốc độ nghiêng tăng ${n.tiltRate}°/giờ, Đất ẩm ${n.soilMoisture}%, Rễ còn ${n.rootHealth}%`
      ).join('\n');

      return `
        VAI TRÒ: Chuyên gia phân tích rủi ro cây xanh (Predictive Maintenance AI).
        
        DỮ LIỆU DỰ BÁO (FUTURE FORECAST):
        Hệ thống phát hiện 3 cây có nguy cơ gãy đổ cao nhất trong 24h tới:
        ${formatRisk(topRisks)}

        NHIỆM VỤ:
        1. Nếu người dùng hỏi "Cây nào sắp đổ?" hoặc "Dự báo rủi ro", hãy phân tích dựa trên dữ liệu trên.
        2. GIẢI THÍCH LÝ DO (QUAN TRỌNG): 
          - Nếu "Tốc độ nghiêng" > 0, hãy cảnh báo là cây đang mất thăng bằng động.
          - Nếu "Đất ẩm" > 80%, hãy cảnh báo nền đất yếu do mưa/ngập.
          - Nếu "Rễ" < 50%, cảnh báo hệ thống rễ bị tổn thương.
        3. Đưa ra khuyến nghị cụ thể (Ví dụ: Cần chằng chống ngay, Cần phong tỏa khu vực...).
        
        Lưu ý: Luôn dùng ngôn ngữ chuyên ngành nhưng dễ hiểu (như "Gia cố", "Cắt tỉa tán", "Phong tỏa").
      `;
    };

  const handleSend = async () => {
    // FIX LỖI DOUBLE ENTER: Kiểm tra nếu đang gõ hoặc input rỗng thì chặn luôn
    if (isTyping || !input.trim()) return;
    
    const userText = input;
    setInput(""); // Xóa input ngay lập tức
    setIsTyping(true); // Khóa trạng thái ngay

    // Thêm tin nhắn user
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userText }]);

    try {
      if (genAI && apiKey) {
        const model = genAI.getGenerativeModel({ 
          model: import.meta.env.VITE_MODEL, 
          systemInstruction: createSystemPrompt()
        });
        
        const history = messages.slice(1).map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: String(m.text) }]
        }));

        const chat = model.startChat({ history });
        const result = await chat.sendMessage(userText);
        const responseText = result.response.text();
        
        setMessages(prev => [...prev, { id: Date.now() + Math.random(), sender: 'ai', text: responseText }]);

      } else {
        await new Promise(r => setTimeout(r, 1000));
        setMessages(prev => [...prev, { id: Date.now(), sender: 'ai', text: "⚠️ **Lỗi:** Chưa có API Key." }]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now(), sender: 'ai', text: "⚠️ **Mất kết nối:** Vui lòng thử lại sau giây lát." }]);
    } finally {
      setIsTyping(false); // Mở khóa trạng thái
    }
  };

  // Hàm xử lý phím Enter riêng biệt để chặn sự kiện mặc định
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        e.preventDefault(); // <--- QUAN TRỌNG: Chặn hành vi xuống dòng hoặc submit form mặc định
        handleSend();
    }
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <GlassCard className="flex flex-col h-full !p-0" noPadding>
      <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">GreenAI Assistant</div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${apiKey ? "bg-emerald-400" : "bg-red-400"} animate-pulse`}></span>
              {apiKey ? "Online" : "Offline"}
            </div>
          </div>
        </div>
        <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar max-h-[400px]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
              msg.sender === 'user' 
                ? 'bg-emerald-600 text-white rounded-tr-none' 
                : 'bg-white/10 text-slate-200 rounded-tl-none border border-white/5'
            }`}>
              {/* RENDER MARKDOWN TẠI ĐÂY */}
              {msg.sender === 'user' ? (
                 msg.text
              ) : (
                 <ReactMarkdown 
                    components={{
                        strong: ({node, ...props}) => <span className="font-bold text-emerald-300" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-1 my-1" {...props} />,
                        li: ({node, ...props}) => <li className="text-slate-200" {...props} />,
                        p: ({node, ...props}) => <p className="mb-1 last:mb-0" {...props} />
                    }}
                 >
                    {msg.text as string}
                 </ReactMarkdown>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex justify-start">
             <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none border border-white/5 flex gap-1 items-center">
               <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></div>
               <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-75"></div>
               <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-150"></div>
             </div>
           </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-3 border-t border-white/10 bg-black/20">
        <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1 border border-white/10 focus-within:border-emerald-500/50 transition-colors">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown} // Dùng hàm xử lý riêng
            disabled={isTyping} // Khóa input khi đang chờ AI trả lời
            placeholder={isTyping ? "GreenAI đang trả lời..." : "Hỏi về tình trạng cây..."}
            className="bg-transparent border-none outline-none text-sm text-white px-3 py-2 flex-1 placeholder-slate-500 disabled:opacity-50"
          />
          <button 
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className="p-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white transition-all shadow-[0_0_10px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTyping ? <MoreHorizontal className="w-4 h-4 animate-pulse" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </GlassCard>
  );
};

export default AIChatWidget;