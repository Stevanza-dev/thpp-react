import React, { useState, useEffect, useCallback } from 'react';
import { Navigation, Sword, Heart, Gift, Shield } from 'lucide-react';

const PirateParty = () => {
  const [gameState, setGameState] = useState({
    player: { x: 1, y: 3, hp: 20, attack: 5 },
    currentStage: 1,
    showAlert: false,
    alertMessage: '',
    alertTitle: '',
    isGameOver: false,
    showChestPopup: false
  });

  const [mapData, setMapData] = useState({
    1: {
      size: 5,
      playerStart: { x: 1, y: 3 },
      chest: { x: 5, y: 3 },
      walls: [
        { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 1, y: 4 },
        { x: 2, y: 4 }, { x: 5, y: 2 }, { x: 5, y: 4 }
      ],
      grumete: [
        { x: 4, y: 2, hp: 3, attack: 1 },
        { x: 4, y: 3, hp: 3, attack: 1 },
        { x: 4, y: 4, hp: 3, attack: 1 }
      ],
      pirates: [],
      marines: [],
      heals: [],
      attackBuffs: []
    }
  });

  const SimpleAlert = ({ title, message }) => (
    <div className="mb-4 p-4 rounded border bg-white shadow-sm">
      <div className="font-bold mb-1">{title}</div>
      <div>{message}</div>
    </div>
  );

  const showAlert = (title, message) => {
    setGameState(prev => ({
      ...prev,
      showAlert: true,
      alertTitle: title,
      alertMessage: message
    }));

    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        showAlert: false,
        alertTitle: '',
        alertMessage: ''
      }));
    }, 2000);
  };

  const handleCombat = (nextPosition) => {
    const currentStage = mapData[gameState.currentStage];
    const grumeteAtPosition = currentStage.grumete.find(
      g => g.x === nextPosition.x && g.y === nextPosition.y
    );

    if (grumeteAtPosition) {
      // Player attacks grumete
      const updatedGrumete = currentStage.grumete.map(g => {
        if (g.x === nextPosition.x && g.y === nextPosition.y) {
          const newHp = g.hp - gameState.player.attack;
          return { ...g, hp: newHp };
        }
        return g;
      }).filter(g => g.hp > 0); // Remove defeated grumete

      // Grumete counterattacks
      const newPlayerHp = gameState.player.hp - grumeteAtPosition.attack;
      
      setMapData(prev => ({
        ...prev,
        [gameState.currentStage]: {
          ...prev[gameState.currentStage],
          grumete: updatedGrumete
        }
      }));

      setGameState(prev => ({
        ...prev,
        player: {
          ...prev.player,
          hp: newPlayerHp
        },
        isGameOver: newPlayerHp <= 0
      }));

      showAlert(
        "Combat!",
        `You dealt ${gameState.player.attack} damage and received ${grumeteAtPosition.attack} damage!`
      );

      if (newPlayerHp <= 0) {
        showAlert("Game Over", "You have been defeated!");
        return true;
      }

      return true;
    }
    return false;
  };

  const getCellContent = (x, y) => {
    const stage = mapData[gameState.currentStage];
    
    if (x === gameState.player.x && y === gameState.player.y) {
      return <Navigation className="text-blue-500" size={24} />;
    }
    
    if (stage.walls.some(wall => wall.x === x && wall.y === y)) {
      return <div className="w-6 h-6 bg-gray-700 rounded" />;
    }
    
    if (stage.chest.x === x && stage.chest.y === y) {
      return <Gift className="text-yellow-500" size={24} />;
    }
    
    if (stage.grumete.some(g => g.x === x && g.y === y)) {
      const grumete = stage.grumete.find(g => g.x === x && g.y === y);
      return (
        <div className="relative">
          <Shield className="text-green-500" size={24} />
          <span className="absolute -top-2 -right-2 text-xs bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
            {grumete.hp}
          </span>
        </div>
      );
    }
    
    if (stage.pirates.some(p => p.x === x && p.y === y)) {
      return <Sword className="text-red-500" size={24} />;
    }
    
    if (stage.heals.some(h => h.x === x && h.y === y)) {
      return <Heart className="text-pink-500" size={24} />;
    }

    return null;
  };

  const ChestPopup = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm">
        <h3 className="text-xl font-bold mb-4">Congratulations!</h3>
        <p className="mb-4">You've found the treasure chest! You've completed stage {gameState.currentStage}!</p>
        <button 
          onClick={() => setGameState(prev => ({ ...prev, showChestPopup: false }))}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );

  const move = useCallback((direction) => {
    if (gameState.isGameOver) {
      showAlert("Game Over", "Please restart the game!");
      return;
    }

    setGameState(prev => {
      const nextPosition = { 
        x: prev.player.x + (direction === 'up' ? -1 : direction === 'down' ? 1 : 0),
        y: prev.player.y + (direction === 'left' ? -1 : direction === 'right' ? 1 : 0)
      };

      const stage = mapData[prev.currentStage];
      
      // Check walls
      if (stage.walls.some(wall => wall.x === nextPosition.x && wall.y === nextPosition.y)) {
        showAlert("Invalid Move", "You can't move through walls!");
        return prev;
      }

      // Check boundaries
      if (nextPosition.x < 1 || nextPosition.x > stage.size || 
          nextPosition.y < 1 || nextPosition.y > stage.size) {
        showAlert("Invalid Move", "You can't move outside the map!");
        return prev;
      }

      // Handle combat if moving into a grumete
      if (handleCombat(nextPosition)) {
        return prev;
      }

      // Check if player reached the chest
      if (nextPosition.x === stage.chest.x && nextPosition.y === stage.chest.y) {
        return {
          ...prev,
          showChestPopup: true,
          player: {
            ...prev.player,
            x: nextPosition.x,
            y: nextPosition.y
          }
        };
      }

      return {
        ...prev,
        player: {
          ...prev.player,
          x: nextPosition.x,
          y: nextPosition.y
        }
      };
    });
  }, [gameState.isGameOver, handleCombat, showAlert, mapData]);

  // Tambahkan useEffect untuk mendengarkan event keydown
  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowUp':
          move('up');
          break;
        case 'ArrowDown':
          move('down');
          break;
        case 'ArrowLeft':
          move('left');
          break;
        case 'ArrowRight':
          move('right');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Bersihkan event listener saat komponen unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [move]); 

  const renderGameBoard = () => {
    const stage = mapData[gameState.currentStage];
    const board = [];

    for (let x = 1; x <= stage.size; x++) {
      const row = [];
      for (let y = 1; y <= stage.size; y++) {
        row.push(
          <div 
            key={`${x}-${y}`} 
            className="w-16 h-16 border border-gray-300 flex items-center justify-center bg-white hover:bg-gray-100"
          >
            {getCellContent(x, y)}
          </div>
        );
      }
      board.push(
        <div key={x} className="flex">
          {row}
        </div>
      );
    }

    return board;
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-gray-50 rounded-lg shadow-lg">
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-bold mb-2">Pirate Party</h2>
        <div className="flex justify-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Heart className="text-red-500" />
            <span>HP: {gameState.player.hp}</span>
          </div>
          <div className="flex items-center gap-2">
            <Sword className="text-blue-500" />
            <span>Attack: {gameState.player.attack}</span>
          </div>
          <div>Stage: {gameState.currentStage}</div>
        </div>
      </div>

      {gameState.showAlert && (
        <SimpleAlert 
          title={gameState.alertTitle} 
          message={gameState.alertMessage} 
        />
      )}

      {gameState.showChestPopup && <ChestPopup />}

      <div className="mb-6">
        {renderGameBoard()}
      </div>

      <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
        <div></div>
        <button 
          onClick={() => move('up')}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
        >
          ↑
        </button>
        <div></div>
        <button 
          onClick={() => move('left')}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
        >
          ←
        </button>
        <div></div>
        <button 
          onClick={() => move('right')}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
        >
          →
        </button>
        <div></div>
        <button 
          onClick={() => move('down')}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
        >
          ↓
        </button>
        <div></div>
      </div>
    </div>
  );
};

export default PirateParty;