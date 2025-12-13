import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Lấy danh sách Key và xử lý kỹ hơn (Trim khoảng trắng)
const envKeys = import.meta.env.VITE_API_KEYS || "";
const API_KEYS = envKeys.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0);

const MODEL_NAME = import.meta.env.VITE_MODEL || "gemini-1.5-flash-latest";

export const sendMessageWithFailover = async (
  userMessage: string, 
  history: any[], 
  systemInstruction: string
) => {
  // Debug: In ra console để xem đã nhận được key chưa (Chỉ hiện 4 ký tự cuối để bảo mật)
  console.log("Loaded Keys:", API_KEYS.length, API_KEYS.map(k => "..." + k.slice(-4)));

  if (API_KEYS.length === 0) {
    throw new Error("Không tìm thấy Key nào trong VITE_API_KEYS. Hãy kiểm tra file .env và Restart Server.");
  }
  // CẤU HÌNH CHO AI BỚT SÁNG TẠO, TĂNG TÍNH LOGIC
  const generationConfig = {
    temperature: 0.2, // Rất thấp -> Trả lời cực kỳ ổn định, ít biến đổi
    topP: 0.8,
    topK: 40,
  };
  const shuffledKeys = [...API_KEYS].sort(() => 0.5 - Math.random());
  let lastError = null;

  for (const key of shuffledKeys) {
    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ 
        model: MODEL_NAME, 
        systemInstruction: systemInstruction,
        generationConfig: generationConfig
      });

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(userMessage);
      
      return result.response.text();

    } catch (error: any) {
      console.warn(`Key ...${key.slice(-4)} failed. Switching...`);
      lastError = error;
      continue; 
    }
  }

  throw lastError || new Error("Tất cả API Key đều lỗi.");
};