type CellType = 0 | 1 | 2 | 3;
type Coords = { row: number; col: number };

// 必ず一筆書きでクリアできる、一本道のパズルを生成する関数
export const generatePuzzle = (width: number, height: number): CellType[][] => {
  let path: Coords[] = [];
  const minLength = Math.floor(width * height * 0.5);

  // minLengthに満たないパスが生成された場合は、何度もやり直す
  while (path.length < minLength) {
    const visited: boolean[][] = Array.from({ length: height }, () => Array(width).fill(false));
    
    const startPos: Coords = {
      row: Math.floor(Math.random() * height),
      col: Math.floor(Math.random() * width),
    };

    path = [startPos];
    visited[startPos.row][startPos.col] = true;
    let currentPos = startPos;

    // ランダムウォークで道を作る
    while (true) {
      const neighbors: Coords[] = [];
      const directions = [
        { row: -1, col: 0 }, { row: 1, col: 0 }, { row: 0, col: -1 }, { row: 0, col: 1 },
      ];
      directions.sort(() => Math.random() - 0.5);

      for (const dir of directions) {
        const nextPos: Coords = { row: currentPos.row + dir.row, col: currentPos.col + dir.col };

        if (
          nextPos.row >= 0 && nextPos.row < height &&
          nextPos.col >= 0 && nextPos.col < width &&
          !visited[nextPos.row][nextPos.col]
        ) {
          neighbors.push(nextPos);
        }
      }

      if (neighbors.length > 0) {
        const next = neighbors[0];
        path.push(next);
        visited[next.row][next.col] = true;
        currentPos = next;
      } else {
        break;
      }
    }
  }

  // 生成した一本道を、最終的な盤面データに変換する
  const grid: CellType[][] = Array.from({ length: height }, () => Array(width).fill(0));
  path.forEach((pos, index) => {
    if (index === 0) {
      grid[pos.row][pos.col] = 2;
    } else if (index === path.length - 1) {
      grid[pos.row][pos.col] = 3;
    } else {
      grid[pos.row][pos.col] = 1;
    }
  });

  return grid;
};