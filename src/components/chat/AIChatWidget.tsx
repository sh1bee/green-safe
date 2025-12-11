import React, { useState, useEffect, useRef } from 'react';
import { Bot, MoreHorizontal, Send } from 'lucide-react';
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
    { id: 1, sender: 'ai', text: 'Xin chào! **GreenAI** đã kích hoạt. Tôi sẵn sàng phân tích dữ liệu 3 miền.' }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const createSystemPrompt = () => {
    const northNodes = treeNodes.filter(n => n.region === 'north');
    const centralNodes = treeNodes.filter(n => n.region === 'central');
    const southNodes = treeNodes.filter(n => n.region === 'south');

    const formatCritical = (nodes: TreeNode[]) => nodes.filter(n => n.status === 'critical').map(n => `**${n.id}**(${n.tilt.toFixed(0)}°)`);
    const summary = (nodes: TreeNode[]) => {
       const crit = nodes.filter(n => n.status === 'critical').length;
       const warn = nodes.filter(n => n.status === 'warning').length;
       return `${nodes.length} cây (🔴${crit}, 🟡${warn})`;
    };

    const topRisks = [...treeNodes].sort((a, b) => (b.fallProbability || 0) - (a.fallProbability || 0)).slice(0, 3);
    const riskReport = topRisks.map(n => 
        `- **${n.id}** (Nguy cơ ${n.fallProbability}%): Nghiêng tăng ${n.tiltRate}°/h, Đất ẩm ${n.soilMoisture}%, Rễ ${n.rootHealth}%`
    ).join('\n');

    return `
      VAI TRÒ: Bạn là "GreenAI" - Chuyên gia giám sát & Dự báo rủi ro cây xanh.
      === PHẦN 1: DỮ LIỆU HIỆN TẠI ===
      - 🏞️ **Miền Bắc**: ${summary(northNodes)}. Cây đỏ: [${formatCritical(northNodes).join(', ') || "Không"}].
      - 🏖️ **Miền Trung**: ${summary(centralNodes)}. Cây đỏ: [${formatCritical(centralNodes).join(', ') || "Không"}].
      - 🏙️ **Miền Nam**: ${summary(southNodes)}. Cây đỏ: [${formatCritical(southNodes).join(', ') || "Không"}].
      - 🌡️ **Môi trường**: Nhiệt độ ${sensorData.temp.toFixed(1)}°C, AQI ${sensorData.aqi}.
      === PHẦN 2: DỮ LIỆU DỰ BÁO (24H TỚI) ===
      ${riskReport}
      === QUY TẮC TRẢ LỜI ===
      1. **Định dạng Markdown:** In đậm thông số, gạch đầu dòng.
      2. **Khi hỏi về Hiện trạng:** Báo cáo ngắn gọn 3 miền.
      3. **Khi hỏi về Dự báo:** 
         🚨 **CẢNH BÁO DỰ BÁO 24H:**
         *   ⚠️ **[ID Cây]** (Nguy cơ [X]%):
             *   📉 *Nguyên nhân:* [Ngắn gọn].
             *   🛡️ *Khuyến nghị:* [Ngắn gọn].
    `;
  };

  const handleSend = async () => {
    // CHẶN DOUBLE SUBMIT: Kiểm tra kỹ trạng thái
    if (isTyping || !input.trim()) return;
    
    const userText = input;
    setInput(""); 
    setIsTyping(true); // Khóa ngay lập tức

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
      console.error(error);
      const errorMsg = error.message?.includes("API Keys") 
        ? "⚠️ Lỗi cấu hình: Chưa tìm thấy API Key. Hãy Restart Server."
        : "⚠️ Hệ thống quá tải: Vui lòng thử lại sau 24h.";
        
      setMessages(prev => [...prev, { id: Date.now(), sender: 'ai', text: errorMsg }]);
    } finally {
      setIsTyping(false); // Mở khóa
    }
  };

  // HÀM XỬ LÝ PHÍM ĐƯỢC NÂNG CẤP
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Nếu đang gõ tiếng Việt (IME composing) thì không gửi
    if (e.nativeEvent.isComposing) return;

    if (e.key === 'Enter') {
        e.preventDefault(); // Chặn xuống dòng
        handleSend();       // Gọi gửi tin
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
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Multi-Key Connected
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
            onKeyDown={handleKeyDown} 
            disabled={isTyping}
            placeholder={isTyping ? "Đang xử lý..." : "Hỏi GreenAI..."}
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