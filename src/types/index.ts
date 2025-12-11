import React from 'react';

export type Region = 'north' | 'central' | 'south';

export type Alert = {
  id: number;
  treeId: string;
  location: string;
  risk: number;
  status: "CRITICAL" | "WARNING" | "STABLE";
  type: string;
  time: string;
};

export type ChatMessage = {
  id: number;
  sender: 'user' | 'ai';
  text: string | React.ReactNode;
};

export type TreeNode = {
  id: string;
  x: number; // Tọa độ trên bản đồ con (0-100%)
  y: number; // Tọa độ trên bản đồ con (0-100%)
  status: 'safe' | 'warning' | 'critical';
  tilt: number;
  tiltRate: number;    // Độ nghiêng tăng thêm mỗi giờ (VD: 0.1, 0.5)
  soilMoisture: number; // Độ ẩm đất (0-100%)
  rootHealth: number;   // Sức khỏe rễ (0-100, thấp là yếu)
  fallProbability: number; // % Nguy cơ đổ (Trường này sẽ được tính toán)
  region: Region; // Thêm vùng miền
};