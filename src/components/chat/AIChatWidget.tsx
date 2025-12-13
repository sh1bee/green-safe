import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Bot, MoreHorizontal, Send, Trash2 } from 'lucide-react'; // Thêm icon thùng rác để xóa chat
import ReactMarkdown from 'react-markdown';
import GlassCard from '../ui/GlassCard';
import { ChatMessage, TreeNode, Alert } from '../../types';
import { sendMessageWithFailover } from '../../utils/geminiManager';

type AIChatProps = {
  isAutoDemo: boolean;
  treeNodes: TreeNode[];
  sensorData: { temp: number; noise: number; aqi: number };
  alerts: Alert[];
}

const AIChatWidget = ({ isAutoDemo, treeNodes, sensorData, alerts }: AIChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, sender: 'ai', text: 'Xin chào! **GreenAI** đã kết nối dữ liệu thời gian thực. Hệ thống đang giám sát chặt chẽ 3 miền. Bạn cần báo cáo gì?' }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // --- HÀM TẠO PROMPT "THẦN THÁNH" (Kết hợp Báo cáo & Dự báo) ---
  const createSystemPrompt = () => {
    // 1. Phân tích dữ liệu hiện tại
    const northNodes = treeNodes.filter(n => n.region === 'north');
    const centralNodes = treeNodes.filter(n => n.region === 'central');
    const southNodes = treeNodes.filter(n => n.region === 'south');

    // Hàm format hiển thị cây lỗi
    const formatNodes = (nodes: TreeNode[]) => {
       const critical = nodes.filter(n => n.status === 'critical');
       if (critical.length === 0) return "Tình trạng ổn định ✅";
       return critical.map(n => `⚠️ **${n.id}** (Nghiêng ${n.tilt.toFixed(1)}°)`).join(', ');
    };

    const countStatus = (nodes: TreeNode[]) => {
       const c = nodes.filter(n => n.status === 'critical').length;
       const w = nodes.filter(n => n.status === 'warning').length;
       return c > 0 ? `🔴 ${c} Nguy hiểm` : w > 0 ? `🟡 ${w} Cảnh báo` : `🟢 An toàn`;
    }

    // 2. Tìm top cây có nguy cơ cao nhất (Dù hiện tại vẫn xanh nhưng chỉ số ẩn xấu)
    const futureRisks = [...treeNodes]
        .sort((a, b) => (b.fallProbability || 0) - (a.fallProbability || 0))
        .slice(0, 3)
        .map(n => `- 🌲 **${n.id}** (${n.region === 'north' ? 'Bắc' : n.region === 'central' ? 'Trung' : 'Nam'}): Nguy cơ đổ **${n.fallProbability}%** (Rễ ${n.rootHealth}%, Đất ẩm ${n.soilMoisture}%)`)
        .join('\n');

    return `
      VAI TRÒ: Trợ lý ảo AI chuyên trách giám sát hệ thống Green Safe.
      PHONG CÁCH: Ngắn gọn, súc tích, dùng gạch đầu dòng, chuyên nghiệp (Technical Report).

      === DỮ LIỆU THỜI GIAN THỰC (LIVE STATUS) ===
      *   🌡️ **Môi trường:** Temp ${sensorData.temp.toFixed(1)}°C | AQI ${sensorData.aqi} | Noise ${sensorData.noise}dB
      *   🏞️ **Miền Bắc:** ${countStatus(northNodes)}. Chi tiết: ${formatNodes(northNodes)}
      *   🏖️ **Miền Trung:** ${countStatus(centralNodes)}. Chi tiết: ${formatNodes(centralNodes)}
      *   🏙️ **Miền Nam:** ${countStatus(southNodes)}. Chi tiết: ${formatNodes(southNodes)}

      === DỮ LIỆU DỰ BÁO RỦI RO (PREDICTIVE DATA) ===
      (Dùng khi người dùng hỏi về tương lai/sắp đổ/nguy cơ tiềm ẩn)
      ${futureRisks}

      === QUY TẮC TRẢ LỜI ===
      1. **Nếu hỏi về "Tình trạng hiện tại":** Báo cáo nhanh theo 3 miền. Nếu miền nào an toàn thì ghi "An toàn", không cần liệt kê cây.
      2. **Nếu hỏi về "Cây nào sắp đổ" / "Dự báo":** Sử dụng dữ liệu PREDICTIVE DATA để trả lời. Giải thích nguyên nhân do rễ yếu hoặc đất ẩm.
      3. **Nếu hỏi câu ngoài lề:** Từ chối lịch sự.
      4. **Định dạng:** Bắt buộc dùng Markdown (**đậm**, - gạch dòng) để dễ đọc. KHÔNG viết văn xuôi dài dòng.
    `;
  };

  const handleSend = async () => {
    if (isTyping || !input.trim()) return;
    
    const userText = input;
    setInput(""); 
    setIsTyping(true); 
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userText }]);

    try {
      const history = messages.slice(1).map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: String(m.text) }]
      }));

      const responseText = await sendMessageWithFailover(
        userText,
        history,
        createSystemPrompt()
      );
      
      setMessages(prev => [...prev, { id: Date.now() + Math.random(), sender: 'ai', text: responseText }]);

    } catch (error: any) {
      setMessages(prev => [...prev, { id: Date.now(), sender: 'ai', text: "⚠️ Hệ thống đang bận. Vui lòng thử lại." }]);
    } finally {
      setIsTyping(false); 
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter') {
        e.preventDefault(); 
        handleSend();
    }
  };

  return (
    <GlassCard className="flex flex-col h-full !p-0" noPadding>
      {/* HEADER */}
      <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">GreenAI Assistant</div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Connected
            </div>
          </div>
        </div>
        {/* Nút xóa lịch sử chat để đỡ rối */}
        <button 
            onClick={() => setMessages([{ id: 1, sender: 'ai', text: 'Hệ thống đã reset hội thoại. Mời bạn đặt lệnh.' }])}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-red-400" title="Xóa lịch sử chat"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* CHAT BODY */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar max-h-[400px]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
              msg.sender === 'user' 
                ? 'bg-emerald-600 text-white rounded-tr-none' 
                : 'bg-white/10 text-slate-200 rounded-tl-none border border-white/5'
            }`}>
              {msg.sender === 'user' ? (
                 msg.text
              ) : (
                 <ReactMarkdown 
                    components={{
                        strong: ({node, ...props}) => <span className="font-bold text-emerald-300" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-1 my-1" {...props} />,
                        li: ({node, ...props}) => <li className="text-slate-200" {...props} />,
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />
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

      {/* INPUT AREA */}
      <div className="p-3 border-t border-white/10 bg-black/20">
        <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1 border border-white/10 focus-within:border-emerald-500/50 transition-colors">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown} 
            disabled={isTyping}
            placeholder={isTyping ? "GreenAI đang phân tích..." : "Hỏi: Miền Bắc thế nào? / Cây nào sắp đổ?"}
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