import { useState, useMemo, useCallback, useEffect } from 'react';
import './App.css';
import { generatePuzzle } from './puzzleGenerator';

type CellType = 0 | 1 | 2 | 3;
type Coords = { row: number; col: number };

// 難易度の選択肢を定義
const DIFFICULTY_LEVELS = [
  { name: 'かんたん', size: 5 },
  { name: 'ふつう', size: 7 },
  { name: 'むずかしい', size: 9 },
];

function App() {
  const [grid, setGrid] = useState<CellType[][]>([]);
  const [path, setPath] = useState<Coords[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [message, setMessage] = useState('スタートマスからドラッグしてゴールを目指そう！');
  const [isLocked, setIsLocked] = useState(false);
  const [puzzleSize, setPuzzleSize] = useState(7);

  // パズル生成関数を、現在のpuzzleSizeに依存させる
  const createNewPuzzle = useCallback(() => {
    document.documentElement.style.setProperty('--grid-size', String(puzzleSize));
    const newGrid = generatePuzzle(puzzleSize, puzzleSize);
    setGrid(newGrid);
    setIsDrawing(false);
    setPath([]);
    setMessage('スタートマスからドラッグしてゴールを目指そう！');
    setIsLocked(false);
  }, [puzzleSize]);

  // puzzleSizeが変更されたとき、または初回読み込み時に新しいパズルを生成
  useEffect(() => {
    createNewPuzzle();
  }, [createNewPuzzle]); // createNewPuzzleに依存させることで、puzzleSizeの変更を検知


  const totalPathCells = useMemo(() => {
    if (grid.length === 0) return 0;
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

  const handleMouseDown = useCallback((row: number, col: number) => {
    if (isLocked || !grid[row] || grid[row][col] !== 2) return;
    
    setPath([]);
    setMessage('なぞり中...');
    setIsDrawing(true);
    setPath([{ row, col }]);
  }, [isLocked, grid]);
  
  const handleMouseEnter = useCallback((row: number, col: number) => {
    if (isLocked || !isDrawing || !grid[row]) return;

    if (path.length >= 2) {
      const secondToLastPos = path[path.length - 2];
      if (secondToLastPos.row === row && secondToLastPos.col === col) {
        setPath(prevPath => prevPath.slice(0, -1));
        return;
      }
    }

    const lastPos = path[path.length - 1];
    const isAdjacent = Math.abs(row - lastPos.row) + Math.abs(col - lastPos.col) === 1;
    if (!isAdjacent) return;

    const cellType = grid[row][col];
    const cellKey = `${row}-${col}`;

    if (cellType === 0 || tracedCells.has(cellKey)) {
      return;
    }
    
    const newPath = [...path, { row, col }];
    setPath(newPath);

    if (cellType === 3 && (newPath.length - 1) === totalPathCells) {
      setMessage('🎉 クリア！おめでとうございます！ 🎉');
      setIsDrawing(false);
      setIsLocked(true);
    }
  }, [isDrawing, path, grid, tracedCells, totalPathCells]);

  const handleMouseUp = useCallback(() => {
    if (isDrawing) {
      setPath([]);
      setIsDrawing(false);
      setMessage('失敗！もう一度スタートからどうぞ。');
    }
  }, [isDrawing]);

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseUp]);

  if (grid.length === 0) return <div>パズルを生成中...</div>;

  return (
    <div className="puzzle-container">
      <h1>一筆書きパズル</h1>
      <div className="difficulty-selector">
        {DIFFICULTY_LEVELS.map(level => (
          <button
            key={level.name}
            // 現在の難易度と同じボタンは見た目を変える
            className={`difficulty-button ${puzzleSize === level.size ? 'active' : ''}`}
            onClick={() => setPuzzleSize(level.size)}
          >
            {level.name} ({level.size}x{level.size})
          </button>
        ))}
      </div>
      <div className="message-area">{message}</div>
      <div className={`grid ${isLocked ? 'locked' : ''}`}>
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
              ></div>
            );
          })
        )}
      </div>
      <button onClick={createNewPuzzle} className="reset-button">次のパズルへ</button>
    </div>
  );
}

export default App;