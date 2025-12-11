// src/utils/dataGenerator.ts
import { TreeNode, Region } from '../types';

export const generateRandomTrees = (): TreeNode[] => {
  const nodes: TreeNode[] = [];
  const regions: Region[] = ['north', 'central', 'south'];
  
  // Tổng số cây muốn tạo (ví dụ 100 cây)
  const TOTAL_TREES = 100;

  for (let i = 0; i < TOTAL_TREES; i++) {
    const region = regions[Math.floor(Math.random() * regions.length)];
    
    // Tỷ lệ rủi ro: 5% Đỏ, 15% Vàng, 80% Xanh
    const rand = Math.random();
    let status: 'safe' | 'warning' | 'critical' = 'safe';
    let tilt = Math.random() * 5; // Nghiêng nhẹ 0-5 độ

    if (rand > 0.95) { // 5% Critical
      status = 'critical';
      tilt = 15 + Math.random() * 20; // Nghiêng > 15 độ
    } else if (rand > 0.80) { // 15% Warning
      status = 'warning';
      tilt = 5 + Math.random() * 10; // Nghiêng 5-15 độ
    }
    let tiltRate = 0;
    let rootHealth = 80 + Math.random() * 20; // Khỏe mạnh (80-100)
    let soilMoisture = 40 + Math.random() * 20; // Bình thường

    if (status === 'critical') {
      tiltRate = 0.2 + Math.random() * 0.5; // Tăng độ nghiêng nhanh
      rootHealth = 20 + Math.random() * 30; // Rễ yếu
      soilMoisture = 85 + Math.random() * 15; // Đất nhão nhoét
    }

    // Công thức tính xác suất đổ (Giả lập Logic)
    let prob = (tilt * 2) + (tiltRate * 50) + (soilMoisture * 0.3) - (rootHealth * 0.5);
    prob = Math.min(Math.max(prob, 0), 99); // Kẹp trong khoảng 0-99%
    nodes.push({
      id: `T-${1000 + i}`, // Logic tên T-1000, T-1001...
      x: Math.floor(Math.random() * 90) + 5, // Tọa độ 5-95%
      y: Math.floor(Math.random() * 90) + 5,
      status: status,
      tilt: parseFloat(tilt.toFixed(1)),
      tiltRate: parseFloat(tiltRate.toFixed(2)),
      soilMoisture: Math.floor(soilMoisture),
      rootHealth: Math.floor(rootHealth),
      fallProbability: Math.floor(prob),
      region: region
    });
  }
  return nodes;
};