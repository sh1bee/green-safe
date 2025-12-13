import { NCHMF_SCENARIOS } from '../data/weatherScenarios';

export const fetchRealTimeWarning = async (): Promise<{ title: string; link: string; isReal: boolean; content?: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  const randomScenario = NCHMF_SCENARIOS[Math.floor(Math.random() * NCHMF_SCENARIOS.length)];

  return {
    title: randomScenario.title,
    link: randomScenario.link,
    isReal: true,
    content: randomScenario.content // <--- TRẢ VỀ THÊM CÁI NÀY
  };
};