type Coords = { row: number; col: number };

// 2点間の直線上にある全てのセルを計算して返す関数
export const getCellsOnLine = (
  startCoords: Coords,
  endCoords: Coords,
  cellSize: number
): Coords[] => {
  const cells = new Set<string>();
  const startX = startCoords.col * cellSize + cellSize / 2;
  const startY = startCoords.row * cellSize + cellSize / 2;
  const endX = endCoords.col;
  const endY = endCoords.row;

  const dx = endX - startX;
  const dy = endY - startY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // 線の長さに応じて、十分な数の補間点を計算する
  const steps = Math.ceil(distance / (cellSize / 4));
  if (steps === 0) return [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = startX + dx * t;
    const y = startY + dy * t;
    
    const row = Math.floor(y / cellSize);
    const col = Math.floor(x / cellSize);
    
    // 盤面の内側の座標のみを対象とする
    if (row >= 0 && col >= 0) {
        cells.add(`${row}-${col}`);
    }
  }

  // Setから重複を除いた配列に変換して返す
  return Array.from(cells).map(key => {
    const [row, col] = key.split('-').map(Number);
    return { row, col };
  });
};