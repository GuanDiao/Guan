import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import { 
  Heart, 
  Flower, 
  Globe2, 
  User, 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  Palette, 
  Hand
} from 'lucide-react';

import HandController from './components/HandController';
import ParticleScene from './components/ParticleScene';
import { ShapeType } from './types';

const COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#FFE66D', // Yellow
  '#F7FFF7', // White
  '#FF00FF', // Magenta
  '#1A535C', // Dark Teal
  '#00BFFF', // Deep Sky Blue
];

const SHAPE_BUTTONS = [
  { type: ShapeType.HEART, icon: Heart, label: 'Love' },
  { type: ShapeType.FLOWER, icon: Flower, label: 'Bloom' },
  { type: ShapeType.SATURN, icon: Globe2, label: 'Cosmos' },
  { type: ShapeType.BUDDHA, icon: User, label: 'Zen' },
  { type: ShapeType.FIREWORK, icon: Sparkles, label: 'Burst' },
];

function App() {
  const [shape, setShape] = useState<ShapeType>(ShapeType.SATURN);
  const [color, setColor] = useState<string>('#4ECDC4');
  const [interactionValue, setInteractionValue] = useState(0); // 0 (closed) to 1 (open)
  const [isHandDetected, setIsHandDetected] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Smooth out interaction value to prevent jitter
  const targetInteractionRef = useRef(0);
  
  useEffect(() => {
    let animationFrameId: number;
    const smoothInteraction = () => {
        // Simple Lerp
        const current = interactionValue;
        const target = targetInteractionRef.current;
        const diff = target - current;
        if (Math.abs(diff) > 0.001) {
            setInteractionValue(current + diff * 0.1);
        }
        animationFrameId = requestAnimationFrame(smoothInteraction);
    };
    smoothInteraction();
    return () => cancelAnimationFrame(animationFrameId);
  }, [interactionValue]);

  const handleHandInteraction = (val: number) => {
    targetInteractionRef.current = val;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden selection:bg-transparent">
      
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 2]}>
          <color attach="background" args={['#050505']} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          
          <ParticleScene 
            shape={shape} 
            color={color} 
            interactionValue={interactionValue}
            particleCount={4000}
          />
          
          <OrbitControls 
            enablePan={false} 
            enableZoom={true} 
            maxDistance={20} 
            minDistance={2} 
            autoRotate={!isHandDetected}
            autoRotateSpeed={0.5}
          />
          <Environment preset="city" />
        </Canvas>
      </div>

      {/* Hand Controller (Hidden logic, Visible Feedback) */}
      <HandController 
        onInteractionChange={handleHandInteraction}
        onDetectionChange={setIsHandDetected}
      />

      {/* Status Indicators */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
         <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border ${isHandDetected ? 'bg-green-500/20 border-green-500/50 text-green-200' : 'bg-red-500/20 border-red-500/50 text-red-200'} transition-colors duration-300`}>
            <Hand size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isHandDetected ? 'Hand Detected' : 'No Hand Detected'}
            </span>
         </div>
         {isHandDetected && (
            <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur text-xs text-white/70">
                Pinch/Open to Interact
            </div>
         )}
      </div>

      {/* Fullscreen Toggle */}
      <button 
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white transition-all"
      >
        {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
      </button>

      {/* Main Control Panel */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 w-[90%] max-w-2xl">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            
            {/* Shape Selectors */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
              {SHAPE_BUTTONS.map((btn) => (
                <button
                  key={btn.type}
                  onClick={() => setShape(btn.type)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl min-w-[70px] transition-all duration-300 ${
                    shape === btn.type 
                      ? 'bg-white/20 text-white shadow-lg scale-105 border border-white/20' 
                      : 'hover:bg-white/5 text-white/50 hover:text-white'
                  }`}
                >
                  <btn.icon size={24} />
                  <span className="text-[10px] uppercase font-bold tracking-widest">{btn.label}</span>
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-12 bg-white/10"></div>

            {/* Color Picker */}
            <div className="flex items-center gap-3">
              <div className="text-white/50">
                <Palette size={20} />
              </div>
              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform duration-200 ${
                      color === c ? 'border-white scale-125' : 'border-transparent hover:scale-110'
                    }`}
                    style={{ backgroundColor: c, boxShadow: `0 0 10px ${c}40` }}
                    aria-label="Select color"
                  />
                ))}
              </div>
            </div>

          </div>
        </div>
        
        <p className="text-center text-white/30 text-[10px] mt-4 uppercase tracking-[0.2em]">
          Powered by Gemini Concept • React Three Fiber • MediaPipe
        </p>
      </div>
      
    </div>
  );
}

export default App;