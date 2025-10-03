type CellType = 0 | 1 | 2 | 3;
type Coords = { row: number; col: number };

// 必ず一筆書きでクリアできる、一本道のパズルを生成する関数
export const generatePuzzle = (width: number, height: number): CellType[][] => {
  let path: Coords[] = [];
  // パスの最低長を盤面の半分に設定し、短すぎるパズルを防ぐ
  const minLength = Math.floor(width * height * 0.5);

  // minLengthに満たないパスが生成された場合は、満足するまで何度もやり直す
  while (path.length < minLength) {
    // 1. 盤面と訪問履歴を初期化
    const visited: boolean[][] = Array.from({ length: height }, () => Array(width).fill(false));
    
    // 2. ランダムなスタート地点を選択
    const startPos: Coords = {
      row: Math.floor(Math.random() * height),
      col: Math.floor(Math.random() * width),
    };

    path = [startPos];
    visited[startPos.row][startPos.col] = true;
    let currentPos = startPos;

    // 3. ランダムウォークで道を作る
    while (true) {
      const neighbors: Coords[] = [];
      // 上下左右の4方向（★★ここでタイプミスを修正しました★★）
      const directions = [
        { row: -1, col: 0 }, // 上
        { row: 1, col: 0 },  // 下
        { row: 0, col: -1 }, // 左
        { row: 0, col: 1 },  // 右
      ];
      // 方向をシャッフルして、毎回違う形の道を作る
      directions.sort(() => Math.random() - 0.5);

      for (const dir of directions) {
        const nextPos: Coords = { row: currentPos.row + dir.row, col: currentPos.col + dir.col };

        // 次のマスが「盤面の内側」かつ「未訪問」かチェック
        if (
          nextPos.row >= 0 && nextPos.row < height &&
          nextPos.col >= 0 && nextPos.col < width &&
          !visited[nextPos.row][nextPos.col]
        ) {
          neighbors.push(nextPos);
        }
      }

      if (neighbors.length > 0) {
        // 進める方向があれば、ランダムに選んで道を進める
        const next = neighbors[0];
        path.push(next);
        visited[next.row][next.col] = true;
        currentPos = next;
      } else {
        // どの方向にも進めなくなったら、道の生成を終了
        break;
      }
    }
  }

  // 4. 生成した一本道を、最終的な盤面データに変換する
  const grid: CellType[][] = Array.from({ length: height }, () => Array(width).fill(0));
  path.forEach((pos, index) => {
    if (index === 0) {
      grid[pos.row][pos.col] = 2; // 道の始点を「スタート」に
    } else if (index === path.length - 1) {
      grid[pos.row][pos.col] = 3; // 道の終点を「ゴール」に
    } else {
      grid[pos.row][pos.col] = 1; // 途中を「道」に
    }
  });

  return grid;
};