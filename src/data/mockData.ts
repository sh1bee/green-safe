// src/data/mockData.ts
import { Alert } from '../types';

export const ALERTS: Alert[] = [
  { id: 1, treeId: "T-1092", location: "Nguyễn Trãi, Thanh Xuân", risk: 92, status: "CRITICAL", type: "Nghiêng > 15°", time: "2 phút trước" },
  { id: 2, treeId: "T-0451", location: "Trần Phú, Hà Đông", risk: 78, status: "WARNING", type: "Rung lắc mạnh", time: "15 phút trước" },
  { id: 3, treeId: "T-2201", location: "Láng Hạ, Đống Đa", risk: 45, status: "STABLE", type: "Bảo trì định kỳ", time: "1 giờ trước" },
];

export const FORECAST_DATA = [
  { time: '14:00', risk: 20 },
  { time: '15:00', risk: 35 },
  { time: '16:00', risk: 85 },
  { time: '17:00', risk: 90 },
  { time: '18:00', risk: 60 },
  { time: '19:00', risk: 30 },
];