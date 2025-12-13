import { TreeNode, Region } from '../types';

export const generateRandomTrees = (): TreeNode[] => {
  const nodes: TreeNode[] = [];
  const regions: Region[] = ['north', 'central', 'south'];
  const TOTAL_TREES = 100;

  for (let i = 0; i < TOTAL_TREES; i++) {
    const region = regions[Math.floor(Math.random() * regions.length)];
    
    // TỶ LỆ RANDOM: 5% Đỏ, 15% Vàng, 80% Xanh
    const rand = Math.random();
    let status: 'safe' | 'warning' | 'critical' = 'safe';
    
    // Thông số vật lý ngẫu nhiên
    let tilt = Math.random() * 3; // Nghiêng nhẹ 0-3 độ (Bình thường)
    let rootHealth = 70 + Math.random() * 30; // Rễ khỏe (70-100%)
    let soilMoisture = 30 + Math.random() * 20; // Đất ổn định

    if (rand > 0.95) { // 5% Critical (Nguy hiểm)
      status = 'critical';
      tilt = 15 + Math.random() * 15; // Nghiêng > 15 độ
      rootHealth = 10 + Math.random() * 30; // Rễ mục
    } else if (rand > 0.80) { // 15% Warning (Cảnh báo)
      status = 'warning';
      tilt = 5 + Math.random() * 10; // Nghiêng 5-15 độ
      rootHealth = 40 + Math.random() * 30; // Rễ yếu
    }

    // Tính toán xác suất đổ (Công thức giả lập)
    let prob = (tilt * 2) + ((100 - rootHealth) * 0.5);
    if (status === 'safe') prob = Math.random() * 10; 
    
    nodes.push({
      id: `T-${1000 + i}`,
      x: Math.floor(Math.random() * 90) + 5,
      y: Math.floor(Math.random() * 90) + 5,
      status: status,
      tilt: parseFloat(tilt.toFixed(1)),
      tiltRate: status === 'critical' ? (Math.random() * 0.5) : 0, // Cây đỏ thì đang nghiêng dần
      soilMoisture: Math.floor(soilMoisture),
      rootHealth: Math.floor(rootHealth),
      fallProbability: Math.min(Math.floor(prob), 99),
      region: region
    });
  }
  return nodes;
};