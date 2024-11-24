import React, { useState, useEffect, useCallback } from 'react';

const TreasureHunt = () => {
  const [gameState, setGameState] = useState({
    player: { x: 1, y: 1, hp: 20, attack: 5 },
    currentStage: 1,
    mapData: {
    1: {
        size: 9,
        playerStart: { x: 1, y: 1 },
        chest: { x: 9, y: 9 },
        walls: [
            { x: 2, y: 8 }, { x: 2, y: 7 }, { x: 2, y: 6 }, { x: 2, y: 5 }, { x: 2, y: 4 }, { x: 2, y: 3 },
            { x: 2, y: 2 }, { x: 8, y: 2 }, { x: 8, y: 3 }, { x: 8, y: 4 }, { x: 8, y: 5 }, { x: 8, y: 6 },
            { x: 8, y: 7 },
            { x: 4, y: 6 }, { x: 4, y: 7 }, { x: 4, y: 8 },
            { x: 6, y: 4 }, { x: 6, y: 5 }, { x: 6, y: 6 },
            { x: 6, y: 7 }, { x: 6, y: 8 }
        ],
        grumete: [
            { x: 5, y: 4 },
            { x: 5, y: 5 }
        ],
        pirates: [
            { x: 9, y: 1 },
            { x: 1, y: 9 },
            { x: 5, y: 9 }
        ],
        marines: [
            { x: 9, y: 8 },
            { x: 8, y: 9 }
        ],
        heals: [],
        attackBuffs: []
      }
    },
    isGameOver: false,
  });

  const getCellContent = (x, y) => {
    const currentMap = gameState.mapData[gameState.currentStage];

    if (gameState.player.x === x && gameState.player.y === y) return 'P';
    if (currentMap.chest.x === x && currentMap.chest.y === y) return 'C';
    if (currentMap.walls.some(wall => wall.x === x && wall.y === y)) return 'W';
    if (currentMap.grumete.some(g => g.x === x && g.y === y)) return 'T';
    if (currentMap.pirates.some(p => p.x === x && p.y === y)) return 'B';
    if (currentMap.marines.some(m => m.x === x && m.y === y)) return 'M';
    if (currentMap.heals.some(h => h.x === x && h.y === y)) return 'H';
    if (currentMap.attackBuffs.some(b => b.x === x && b.y === y)) return 'A';
    return ' ';
  };

  const getCellStyle = (content) => {
    const baseStyle = "w-12 h-12 border-2 border-gray-300 flex items-center justify-center font-bold text-lg";
    switch (content) {
      case 'P': return `${baseStyle} bg-blue-500 text-white`;
      case 'C': return `${baseStyle} bg-yellow-400 text-black`;
      case 'W': return `${baseStyle} bg-gray-800`;
      case 'T': return `${baseStyle} bg-green-500 text-white`;
      case 'B': return `${baseStyle} bg-red-600 text-white`;
      case 'M': return `${baseStyle} bg-purple-600 text-white`;
      case 'H': return `${baseStyle} bg-pink-400 text-white`;
      case 'A': return `${baseStyle} bg-orange-500 text-white`;
      default: return `${baseStyle} bg-white`;
    }
  };

  const movePlayer = useCallback((direction) => {
    setGameState((prev) => {
      const newPos = { ...prev.player };

      switch (direction) {
        case 'up': newPos.x--; break;
        case 'down': newPos.x++; break;
        case 'left': newPos.y--; break;
        case 'right': newPos.y++; break;
        default: return prev;
      }

      const currentMap = prev.mapData[prev.currentStage];
      if (
        newPos.x < 1 ||
        newPos.y < 1 ||
        newPos.x > currentMap.size ||
        newPos.y > currentMap.size ||
        currentMap.walls.some((wall) => wall.x === newPos.x && wall.y === newPos.y)
      ) {
        return prev; // Posisi tidak valid
      }

      // Cek jika mencapai chest
      if (newPos.x === currentMap.chest.x && newPos.y === currentMap.chest.y) {
        alert("You found the treasure! Game Over 🎉");
        return {
          ...prev,
          player: newPos,
          isGameOver: true, // Tambahkan flag untuk menghentikan interaksi
        };
      }

      // Cek interaksi dengan elemen lain (grumete, pirates, heals, attack buffs)
      const interactElement = getElementAtPosition(newPos, currentMap);
      if (interactElement) {
        return interactWithElement(interactElement, newPos, prev);
      }

      return {
        ...prev,
        player: newPos,
      };
    });
  }, []);

  const getElementAtPosition = (position, currentMap) => {
    if (currentMap.grumete.some((g) => g.x === position.x && g.y === position.y)) {
      return { type: "grumete", ...currentMap.grumete.find((g) => g.x === position.x && g.y === position.y) };
    }
    if (currentMap.pirates.some((p) => p.x === position.x && p.y === position.y)) {
      return { type: "pirate", ...currentMap.pirates.find((p) => p.x === position.x && p.y === position.y) };
    }
    if (currentMap.marines.some((m) => m.x === position.x && m.y === position.y)) {
      return { type: "marine", ...currentMap.marines.find((m) => m.x === position.x && m.y === position.y) };
    }
    if (currentMap.heals.some((h) => h.x === position.x && h.y === position.y)) {
      return { type: "heal", ...currentMap.heals.find((h) => h.x === position.x && h.y === position.y) };
    }
    if (currentMap.attackBuffs.some((b) => b.x === position.x && b.y === position.y)) {
      return { type: "attackBuff", ...currentMap.attackBuffs.find((b) => b.x === position.x && b.y === position.y) };
    }
    return null;
  };

  const interactWithElement = (element, position, prev) => {
    const currentMap = prev.mapData[prev.currentStage];
    let newPlayer = { ...prev.player };

    if (element.type === "grumete" || element.type === "pirate" || element.type === "marine") {
      alert(`Combat initiated! Player HP: ${newPlayer.hp}`);
      // Logika combat bisa ditambahkan di sini
      // Misalnya, mengurangi HP pemain dan musuh
      // Jika pemain kalah, set isGameOver menjadi true
      // Jika menang, hapus musuh dari map
      return prev; // Kembalikan prev untuk sementara
    } else if (element.type === "heal") {
      newPlayer.hp += 5;
      alert("You gained 5 HP!");
      currentMap.heals = currentMap.heals.filter(h => h.x !== position.x || h.y !== position.y);
    } else if (element.type === "attackBuff") {
      newPlayer.attack += element.effect;
      alert(`Your attack increased by ${element.effect}!`);
      currentMap.attackBuffs = currentMap.attackBuffs.filter(b => b.x !== position.x || b.y !== position.y);
    }

    return {
      ...prev,
      player: newPlayer,
    };
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (gameState.isGameOver) return; // Hentikan kontrol jika game selesai

      const direction = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
      }[e.key];

      if (direction) {
        movePlayer(direction);
      }
    },
    [movePlayer, gameState.isGameOver]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const currentMap = gameState.mapData[gameState.currentStage];
  const mapSize = currentMap.size;

  // Create the grid rows and cells
  const renderGrid = () => {
    const grid = [];
    for (let x = 1; x <= mapSize; x++) {
      const row = [];
      for (let y = 1; y <= mapSize; y++) {
        const content = getCellContent(x, y);
        row.push(
          <div key={`${x}-${y}`} className={getCellStyle(content)}>
            {content}
          </div>
        );
      }
      grid.push(
        <div key={`row-${x}`} className="flex">
          {row}
        </div>
      );
    }
    return grid;
  };

  return (
    <div className="flex flex-col items-center p-8 min-h-screen bg-gray-100">
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">Treasure Hunt</h1>
        <div className="text-lg">
          HP: {gameState.player.hp} | Attack: {gameState.player.attack} | Stage: {gameState.currentStage}
        </div>
      </div>

      {gameState.isGameOver ? (
        <div className="text-center p-4 bg-green-100 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-green-600">You found the treasure! 🎉</h2>
          <p className="text-lg mt-2">Refresh the page to play again.</p>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <div className="flex flex-col gap-1">{renderGrid()}</div>
        </div>
      )}

      {!gameState.isGameOver && (
        <div className="mt-4 text-gray-600">
          <p>Use arrow keys to move</p>
          <p className="mt-2">
            Legend: P = Player | C = Chest | W = Wall | T = Grumete | B = Pirate | M = Marine | H = Health | A = Attack Buff
          </p>
        </div>
      )}
    </div>
  );
};

export default TreasureHunt;