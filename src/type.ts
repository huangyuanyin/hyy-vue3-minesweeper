export interface BlockState {
  x?: Number; // x 坐标
  y?: Number; // y 坐标
  revealed: Boolean; // 是否翻开
  mine?: Boolean; // 是否是地雷
  flagged?: Boolean; // 是否插旗
  adjacentMines: Number; // 周围地雷数量
}