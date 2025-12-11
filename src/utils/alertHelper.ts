import { TreeNode, Alert } from '../types';

export const generateAlertsFromNodes = (nodes: TreeNode[]): Alert[] => {
  const problemNodes = nodes.filter(n => n.status !== 'safe');
  
  const criticalTypes = ["Nghiêng > 15°", "Rễ đứt gãy", "Hốc mục thân"];
  const warningTypes = ["Rung lắc mạnh", "Nghiêng nhẹ", "Cành khô"];

  return problemNodes.map((node, index) => {
    const isCritical = node.status === 'critical';
    const typeList = isCritical ? criticalTypes : warningTypes;
    
    // SỬA LỖI TYPE Ở DÒNG DƯỚI ĐÂY (thêm 'as ...')
    const status: "CRITICAL" | "WARNING" = isCritical ? 'CRITICAL' : 'WARNING';

    return {
      id: index + 1,
      treeId: node.id,
      location: node.region === 'north' ? 'Hà Nội' : node.region === 'central' ? 'Đà Nẵng' : 'TP.HCM',
      risk: isCritical ? 85 + Math.floor(Math.random() * 15) : 45 + Math.floor(Math.random() * 20),
      status: status, // Đã được định nghĩa kiểu ở trên
      type: typeList[Math.floor(Math.random() * typeList.length)],
      time: `${Math.floor(Math.random() * 30) + 1} phút trước` 
    };
  }).slice(0, 10);
};