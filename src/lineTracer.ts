type Coords = { row: number; col: number };

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
  
  const steps = Math.ceil(distance / (cellSize / 4));
  if (steps === 0) return [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = startX + dx * t;
    const y = startY + dy * t;
    
    const row = Math.floor(y / cellSize);
    const col = Math.floor(x / cellSize);

    if (row >= 0 && col >= 0) {
        cells.add(`${row}-${col}`);
    }
  }

  return Array.from(cells).map(key => {
    const [row, col] = key.split('-').map(Number);
    return { row, col };
  });
};