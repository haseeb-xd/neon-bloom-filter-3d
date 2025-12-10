import React, { useState, useEffect, useCallback } from 'react';
import { BloomState, OperationResult } from './types';
import { getHashIndices, calculateFalsePositiveRate } from './bloomLogic';
import SimulationScene from './components/Simulation';

const DEFAULT_SIZE = 20;
const DEFAULT_HASHES = 3;

const App: React.FC = () => {
  // Configuration
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [hashCount, setHashCount] = useState(DEFAULT_HASHES);

  // Core State
  const [bitArray, setBitArray] = useState<number[]>(Array(DEFAULT_SIZE).fill(0));
  const [items, setItems] = useState<string[]>([]);
  
  // Interaction State
  const [inputValue, setInputValue] = useState('');
  const [lastOperation, setLastOperation] = useState<OperationResult | null>(null);
  
  // Reset simulation when config changes
  useEffect(() => {
    setBitArray(Array(size).fill(0));
    setItems([]);
    setLastOperation(null);
  }, [size, hashCount]);

  // Handler: Insert
  const handleInsert = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;
    const word = inputValue.trim();

    const indices = getHashIndices(word, size, hashCount);
    
    // Update bits (Counting Bloom Filter: Increment)
    const newBits = [...bitArray];
    indices.forEach(idx => {
      newBits[idx]++;
    });

    setBitArray(newBits);
    setItems(prev => [...prev, word]);
    
    setLastOperation({
      type: 'insert',
      word,
      indices,
      isMatch: true,
      isFalsePositive: false,
      timestamp: Date.now()
    });
    
    setInputValue('');
  };

  // Handler: Check
  const handleCheck = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;
    const word = inputValue.trim();

    const indices = getHashIndices(word, size, hashCount);
    
    // Check if all bits are set
    const missingIndices = indices.filter(idx => bitArray[idx] === 0);
    const isMatch = missingIndices.length === 0;
    
    // Check ground truth for False Positive detection
    const actuallyExists = items.includes(word);
    const isFalsePositive = isMatch && !actuallyExists;

    setLastOperation({
      type: 'check',
      word,
      indices,
      isMatch,
      isFalsePositive,
      missingIndices,
      timestamp: Date.now()
    });
  };

  // Handler: Delete
  const handleDelete = () => {
    if (!inputValue.trim()) return;
    const word = inputValue.trim();

    if (!items.includes(word)) {
      alert(`"${word}" is not in the set, cannot delete.`);
      return;
    }

    const indices = getHashIndices(word, size, hashCount);
    
    // Update bits (Counting Bloom Filter: Decrement)
    const newBits = [...bitArray];
    indices.forEach(idx => {
      if (newBits[idx] > 0) newBits[idx]--;
    });

    setBitArray(newBits);
    
    // Remove only the first instance of the word to handle duplicates correctly if we allowed them
    // But for simplicity, we remove one instance from items list
    const newItems = [...items];
    const itemIndex = newItems.indexOf(word);
    if (itemIndex > -1) newItems.splice(itemIndex, 1);
    setItems(newItems);

    setLastOperation({
      type: 'delete',
      word,
      indices,
      isMatch: true,
      isFalsePositive: false,
      timestamp: Date.now()
    });
    
    setInputValue('');
  };

  // Stats
  const filledBits = bitArray.filter(b => b > 0).length;
  const fillRate = filledBits / size;
  const fpRate = calculateFalsePositiveRate(size, hashCount, items.length);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-mono text-white">
      
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <SimulationScene 
          bloomState={{ m: size, k: hashCount, bitArray, items }}
          lastOperation={lastOperation}
        />
      </div>

      {/* UI Overlay - Left Control Panel */}
      <div className="absolute top-0 left-0 h-full w-80 bg-black/80 backdrop-blur-md border-r border-gray-800 p-6 flex flex-col z-10 shadow-2xl overflow-y-auto">
        <h1 className="text-2xl font-bold mb-1 text-cyan-400 tracking-wider">NEON BLOOM</h1>
        <p className="text-xs text-gray-400 mb-6">3D COUNTING FILTER SIMULATION</p>

        {/* Configuration */}
        <div className="mb-8 border-b border-gray-800 pb-6">
          <h2 className="text-sm font-semibold text-gray-300 mb-4 uppercase">Configuration</h2>
          
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span>Array Size (m): {size}</span>
            </div>
            <input 
              type="range" min="10" max="200" step="10"
              value={size} 
              onChange={(e) => setSize(parseInt(e.target.value))}
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          <div className="mb-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Hash Functions (k): {hashCount}</span>
            </div>
            <input 
              type="range" min="1" max="10" 
              value={hashCount} 
              onChange={(e) => setHashCount(parseInt(e.target.value))}
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>
          <button 
            onClick={() => { setBitArray(Array(size).fill(0)); setItems([]); setLastOperation(null); }}
            className="mt-4 w-full py-1 text-xs border border-red-900 text-red-500 hover:bg-red-900/20 rounded transition-colors"
          >
            RESET SIMULATION
          </button>
        </div>

        {/* Operations */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-300 mb-4 uppercase">Operations</h2>
          
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter value..."
            className="w-full bg-gray-900 border border-gray-700 rounded p-2 mb-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
            onKeyDown={(e) => e.key === 'Enter' && handleInsert()}
          />
          
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button 
              onClick={handleInsert}
              disabled={!inputValue}
              className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white py-2 rounded font-bold shadow-[0_0_10px_rgba(0,255,255,0.3)] transition-all"
            >
              INSERT
            </button>
            <button 
              onClick={handleCheck}
              disabled={!inputValue}
              className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white py-2 rounded font-bold transition-all"
            >
              CHECK
            </button>
          </div>
          <button 
            onClick={handleDelete}
            disabled={!inputValue}
            className="w-full border border-purple-500 text-purple-400 hover:bg-purple-900/30 disabled:opacity-30 py-2 rounded font-bold transition-all"
          >
            DELETE
          </button>
        </div>

        {/* Stats */}
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-gray-300 mb-4 uppercase">Statistics</h2>
          
          <div className="grid grid-cols-2 gap-4 text-xs mb-4">
            <div className="bg-gray-900 p-2 rounded border-l-2 border-cyan-500">
              <span className="block text-gray-500">Items (n)</span>
              <span className="text-lg font-mono">{items.length}</span>
            </div>
            <div className="bg-gray-900 p-2 rounded border-l-2 border-blue-500">
              <span className="block text-gray-500">Filled Bits</span>
              <span className="text-lg font-mono">{filledBits}</span>
            </div>
            <div className="bg-gray-900 p-2 rounded border-l-2 border-purple-500">
              <span className="block text-gray-500">Fill Rate</span>
              <span className="text-lg font-mono">{(fillRate * 100).toFixed(1)}%</span>
            </div>
            <div className="bg-gray-900 p-2 rounded border-l-2 border-red-500">
              <span className="block text-gray-500">Est. FP Rate</span>
              <span className="text-lg font-mono">{(fpRate * 100).toFixed(4)}%</span>
            </div>
          </div>

          <div className="bg-gray-900 p-3 rounded text-xs overflow-y-auto max-h-40">
            <h3 className="text-gray-400 mb-2 border-b border-gray-800 pb-1">Stored Items</h3>
            <div className="flex flex-wrap gap-1">
              {items.length === 0 && <span className="text-gray-600 italic">Empty</span>}
              {items.map((item, i) => (
                <span key={i} className="bg-gray-800 px-1 rounded text-cyan-300 border border-gray-700">{item}</span>
              ))}
            </div>
          </div>

          {/* Patreon Donate Section */}
          <div className="mt-4 pt-4 border-t border-gray-800">
            <a
              href="https://www.patreon.com/checkout/HaseebAnsari/9950942"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full"
            >
              <div className="bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 p-3 rounded border border-orange-500/50 transition-all hover:shadow-[0_0_15px_rgba(255,102,0,0.5)] flex items-center justify-center gap-2">
                <img 
                  src="https://c5.patreon.com/external/logo/become_a_patron_button.png" 
                  alt="Become a Patron" 
                  className="h-5 w-auto"
                />
                <span className="text-white font-semibold text-xs">Support on Patreon</span>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Right Legend/Info */}
      <div className="absolute top-6 right-6 flex flex-col gap-2 items-end pointer-events-none">
        <div className="bg-black/70 backdrop-blur px-4 py-2 rounded border border-gray-800 text-xs">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-[#00f3ff] rounded-sm shadow-[0_0_5px_#00f3ff]"></div>
            <span>Active Bit</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-[#00ff66] rounded-sm shadow-[0_0_5px_#00ff66]"></div>
            <span>Match Found</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-[#ff0055] rounded-sm shadow-[0_0_5px_#ff0055]"></div>
            <span>Missing Bit (Miss)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#ffaa00] rounded-sm shadow-[0_0_5px_#ffaa00]"></div>
            <span>False Positive</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default App;
