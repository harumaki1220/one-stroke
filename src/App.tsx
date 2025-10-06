import { useState, useMemo, useCallback, useEffect, type MouseEvent } from 'react';
import './App.css';
import { generatePuzzle } from './puzzleGenerator';
import { getCellsOnLine } from './lineTracer';

type CellType = 0 | 1 | 2 | 3;
type Coords = { row: number; col: number };

const CELL_SIZE = 60;

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

  const createNewPuzzle = useCallback(() => {
    document.documentElement.style.setProperty('--grid-size', String(puzzleSize));
    const newGrid = generatePuzzle(puzzleSize, puzzleSize);
    setGrid(newGrid);
    setIsDrawing(false);
    setPath([]);
    setMessage('スタートマスからドラッグしてゴールを目指そう！');
    setIsLocked(false);
  }, [puzzleSize]);

  useEffect(() => {
    createNewPuzzle();
  }, [createNewPuzzle]);

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

  const handleMouseUp = useCallback(() => {
    if (isDrawing) {
      setPath([]);
      setIsDrawing(false);
      setMessage('失敗！もう一度スタートからどうぞ。');
    }
  }, [isDrawing]);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || path.length === 0) return;
    const gridRect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - gridRect.left;
    const mouseY = e.clientY - gridRect.top;
    const lastPos = path[path.length - 1];
    const cellsToTrace = getCellsOnLine(lastPos, { row: mouseY, col: mouseX }, CELL_SIZE);
    let newPath = [...path];
    for (const cell of cellsToTrace) {
      if (!grid[cell.row] || grid[cell.row][cell.col] === undefined) continue;
      const currentLastPos = newPath[newPath.length - 1];
      const cellType = grid[cell.row][cell.col];
      
      if (newPath.length >= 2) {
        const secondToLastPos = newPath[newPath.length - 2];
        if (secondToLastPos.row === cell.row && secondToLastPos.col === cell.col) {
          newPath = newPath.slice(0, -1);
          continue;
        }
      }
      
      const isAdjacent = Math.abs(cell.row - currentLastPos.row) + Math.abs(cell.col - currentLastPos.col) === 1;
      const isAlreadyTraced = newPath.some(p => p.row === cell.row && p.col === cell.col);

      if (isAdjacent && !isAlreadyTraced && cellType !== 0) {
        
        if (cellType === 3) {
          if (newPath.length !== totalPathCells) {
            continue;
          }
        }
        
        newPath.push(cell);

        if (cellType === 3 && (newPath.length - 1) === totalPathCells) {
          setPath(newPath);
          setMessage('🎉 クリア！おめでとうございます！ 🎉');
          setIsDrawing(false);
          setIsLocked(true);
          return;
        }
      }
    }
    setPath(newPath);
  }, [isDrawing, path, grid, totalPathCells]);
  
  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseUp]);

  if (grid.length === 0) return <div>パズルを生成中...</div>;

  return (
    <div className="puzzle-container">
      <h1>一筆書きパズル</h1>
      <div className="difficulty-selector">
        {DIFFICULTY_LEVELS.map(level => (
          <button
            key={level.name}
            className={`difficulty-button ${puzzleSize === level.size ? 'active' : ''}`}
            onClick={() => setPuzzleSize(level.size)}
          >
            {level.name} ({level.size}x{level.size})
          </button>
        ))}
      </div>
      <div className="message-area">{message}</div>
      <div
        className={`grid ${isLocked ? 'locked' : ''}`}
        onMouseMove={handleMouseMove}
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
              ></div>
            );
          })
        )}
      </div>
      <button onClick={createNewPuzzle} className="reset-button">
        次のパズルへ
      </button>
    </div>
  );
}

export default App;