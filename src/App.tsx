import { useState, useMemo, useCallback, useEffect } from 'react';
import './App.css';
import { generatePuzzle } from './puzzleGenerator';

// --- 型定義 ---
type CellType = 0 | 1 | 2 | 3;
type Coords = { row: number; col: number };

// --- パズルの設定 ---
const PUZZLE_SIZE = 7;

function App() {
  const [grid, setGrid] = useState<CellType[][]>([]);
  const [path, setPath] = useState<Coords[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [message, setMessage] = useState('スタートマスからドラッグして、すべての道を通ってゴールを目指そう！');
  const [isLocked, setIsLocked] = useState(false);

  // --- 新しいパズルを生成してゲームをリセットする関数 ---
  const createNewPuzzle = useCallback(() => {
    const newGrid = generatePuzzle(PUZZLE_SIZE, PUZZLE_SIZE);
    setGrid(newGrid);
    setIsDrawing(false);
    setPath([]);
    setMessage('スタートマスからドラッグして、すべての道を通ってゴールを目指そう！');
    setIsLocked(false);
  }, []);

  // --- 初回読み込み時にパズルを生成 ---
  useEffect(() => {
    document.documentElement.style.setProperty('--grid-size', String(PUZZLE_SIZE));
    createNewPuzzle();
  }, [createNewPuzzle]);


  // --- メモ化された計算結果 (Memo) ---
  const totalPathCells = useMemo(() => {
    let count = 0;
    grid.forEach(row => row.forEach(cell => {
      if (cell === 1 || cell === 3) count++;
    }));
    return count;
  }, [grid]);

  const tracedCells = useMemo(() => {
    const cellSet = new Set<string>();
    path.forEach(p => cellSet.add(`${p.row}-${p.col}`));
    return cellSet;
  }, [path]);

  // --- イベントハンドラ (Callbacks) ---
  const handleMouseDown = useCallback((row: number, col: number) => {
    if (isLocked || !grid[row] || grid[row][col] !== 2) return;
    
    setPath([]);
    setMessage('なぞり中...');
    setIsDrawing(true);
    setPath([{ row, col }]);
  }, [isLocked, grid]);
  
  const handleMouseEnter = useCallback((row: number, col: number) => {
    if (isLocked || !isDrawing || !grid[row]) return;

    const lastPos = path[path.length - 1];
    const isAdjacent = Math.abs(row - lastPos.row) + Math.abs(col - lastPos.col) === 1;
    if (!isAdjacent) return;

    const cellType = grid[row][col];
    const cellKey = `${row}-${col}`;

    if (cellType === 0 || (tracedCells.has(cellKey) && cellType !== 2)) {
      return; // 壁やなぞり済みのマスは無視
    }
    
    const newPath = [...path, { row, col }];
    setPath(newPath);

    if (cellType === 3 && (newPath.length - 1) === totalPathCells) {
      setMessage('クリア！おめでとうございます！');
      setIsDrawing(false);
      setIsLocked(true);
    }
  }, [isDrawing, path, tracedCells, isLocked, totalPathCells, grid]);

  const handleMouseUp = useCallback(() => {
    if (isDrawing) {
      // 途中で離した場合は、盤面をリセットせずに現在のパスをクリアするだけにする
      setPath([]);
      setIsDrawing(false);
      setMessage('失敗！もう一度スタートからどうぞ。');
    }
  }, [isDrawing]);

  // --- レンダリング ---
  // gridが空の間は何も表示しない
  if (grid.length === 0) {
    return <div>パズルを生成中...</div>;
  }

  return (
    <div className="puzzle-container">
      <h1>一筆書きパズル</h1>
      <div className="message-area">{message}</div>
      <div
        className={`grid ${isLocked ? 'locked' : ''}`}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {grid.map((row, rowIndex) =>
          row.map((cellType, colIndex) => {
            const cellKey = `${rowIndex}-${colIndex}`;
            const isTraced = tracedCells.has(cellKey);
            
            let className = 'cell';
            if (cellType === 0) className += ' wall';
            if (cellType === 1) className += ' path';
            if (cellType === 2) className += ' start';
            if (cellType === 3) className += ' goal';
            if (isTraced) className += ' traced';

            return (
              <div
                key={cellKey}
                className={className}
                onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
              >
              </div>
            );
          })
        )}
      </div>
      <button onClick={createNewPuzzle} className="reset-button">次のパズルへ</button>
    </div>
  );
}

export default App;