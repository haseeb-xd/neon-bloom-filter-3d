import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, Stars, PerspectiveCamera, Line } from '@react-three/drei';
import * as THREE from 'three';
import { BloomState, OperationResult } from '../types';

// Constants
const BOX_SIZE = 0.8;
const GAP = 0.2;
const ROW_LENGTH = 10; 

// Colors
const COLOR_OFF = "#222222";
const COLOR_ON = "#00f3ff"; // Cyan
const COLOR_CHECK_MATCH = "#00ff66"; // Green
const COLOR_CHECK_MISS = "#ff0055"; // Red
const COLOR_FALSE_POSITIVE = "#ffaa00"; // Orange
const COLOR_DELETE = "#aa00ff"; // Purple

interface BitBoxProps {
  index: number;
  count: number;
  operation: OperationResult | null;
  totalSize: number;
}

const BitBox: React.FC<BitBoxProps> = ({ index, count, operation, totalSize }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Grid positioning
  const x = (index % ROW_LENGTH) * (BOX_SIZE + GAP);
  const z = Math.floor(index / ROW_LENGTH) * (BOX_SIZE + GAP);
  
  // Center offsets - need to account for actual grid extent
  const rows = Math.ceil(totalSize / ROW_LENGTH);
  // For X: positions go from 0 to (ROW_LENGTH - 1), so center is at (ROW_LENGTH - 1) / 2
  const offsetX = ((ROW_LENGTH - 1) * (BOX_SIZE + GAP)) / 2;
  // For Z: positions go from 0 to (rows - 1), so center is at (rows - 1) / 2
  const offsetZ = ((rows - 1) * (BOX_SIZE + GAP)) / 2;

  // Determine state based on current operation
  const isTargeted = operation?.indices.includes(index);
  
  let targetColor = count > 0 ? COLOR_ON : COLOR_OFF;
  let emissiveIntensity = count > 0 ? 0.5 : 0;

  if (operation && isTargeted) {
    if (operation.type === 'check') {
      if (operation.isFalsePositive) {
        targetColor = COLOR_FALSE_POSITIVE;
        emissiveIntensity = 2.0;
      } else if (count > 0) {
        targetColor = COLOR_CHECK_MATCH;
        emissiveIntensity = 1.5;
      } else {
        targetColor = COLOR_CHECK_MISS;
        emissiveIntensity = 1.5;
      }
    } else if (operation.type === 'insert') {
      targetColor = COLOR_ON;
      emissiveIntensity = 2.0;
    } else if (operation.type === 'delete') {
      targetColor = COLOR_DELETE;
      emissiveIntensity = 1.5;
    }
  }

  useFrame((state) => {
    if (meshRef.current) {
      // Visual stacking: Height grows with count, but clamped to avoid extreme towers
      const targetScaleY = Math.max(0.2, Math.min(count, 5)); 
      const targetY = (targetScaleY * BOX_SIZE) / 2;
      
      meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, targetScaleY, 0.1);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.1);

      // Color transition
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.color.lerp(new THREE.Color(targetColor), 0.1);
      mat.emissive.lerp(new THREE.Color(targetColor), 0.1);
      mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, emissiveIntensity, 0.1);
    }
  });

  return (
    <group position={[x - offsetX, 0, z - offsetZ]}>
      <mesh ref={meshRef}>
        <boxGeometry args={[BOX_SIZE, BOX_SIZE, BOX_SIZE]} />
        <meshStandardMaterial 
          color={COLOR_OFF}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      
      {/* Index Label - Positioned above box, always visible */}
      <Text
        position={[0, Math.max(BOX_SIZE, count * BOX_SIZE) + 0.4, 0]}
        fontSize={Math.max(0.15, Math.min(0.4, 0.25 * Math.sqrt(totalSize / 20)))}
        color="#888"
        outlineWidth={0.02}
        outlineColor="#000000"
        anchorX="center"
        anchorY="bottom"
        billboard
        renderOrder={1000}
      >
        {index}
      </Text>
      
      {/* Count Label on top if > 1 */}
      {count > 1 && (
        <Text
          position={[0, count * BOX_SIZE + 0.5, 0]}
          fontSize={Math.max(0.3, Math.min(0.6, 0.4 * Math.sqrt(totalSize / 20)))}
          color="#ffffff"
          outlineWidth={0.02}
          outlineColor="#000000"
          anchorX="center"
          anchorY="bottom"
          billboard
          renderOrder={1000}
        >
          x{count}
        </Text>
      )}
    </group>
  );
};

interface ConnectionBeamsProps {
  operation: OperationResult;
  totalSize: number;
}

const ConnectionBeams: React.FC<ConnectionBeamsProps> = ({ operation, totalSize }) => {
  const points = useMemo(() => {
    const startPoint = new THREE.Vector3(0, 5, 0); // Floating text position
    
    // Calculate grid offsets again to match BitBox
    const rows = Math.ceil(totalSize / ROW_LENGTH);
    const offsetX = ((ROW_LENGTH - 1) * (BOX_SIZE + GAP)) / 2;
    const offsetZ = ((rows - 1) * (BOX_SIZE + GAP)) / 2;

    return operation.indices.map(idx => {
       const x = (idx % ROW_LENGTH) * (BOX_SIZE + GAP) - offsetX;
       const z = Math.floor(idx / ROW_LENGTH) * (BOX_SIZE + GAP) - offsetZ;
       return {
         start: startPoint,
         end: new THREE.Vector3(x, 0.5, z) // Target the box
       };
    });
  }, [operation, totalSize]);

  let color = COLOR_ON;
  if (operation.type === 'check') {
     color = operation.isFalsePositive ? COLOR_FALSE_POSITIVE : (operation.isMatch ? COLOR_CHECK_MATCH : COLOR_CHECK_MISS);
  } else if (operation.type === 'delete') {
     color = COLOR_DELETE;
  }

  return (
    <group>
      {points.map((p, i) => (
        <Line 
          key={i} 
          points={[p.start, p.end]} 
          color={color} 
          lineWidth={2} 
          transparent 
          opacity={0.6} 
        />
      ))}
    </group>
  );
};

const FloatingLabel: React.FC<{ operation: OperationResult }> = ({ operation }) => {
  const [displayText, setDisplayText] = useState("");
  
  useEffect(() => {
    let prefix = "";
    if (operation.type === 'insert') prefix = "INSERTING";
    if (operation.type === 'check') prefix = "CHECKING";
    if (operation.type === 'delete') prefix = "DELETING";
    
    setDisplayText(`${prefix}: "${operation.word}"`);
    
    // Result text logic
    if (operation.type === 'check') {
       if (operation.isFalsePositive) {
         setDisplayText(`FALSE POSITIVE: "${operation.word}"`);
       } else if (operation.isMatch) {
         setDisplayText(`FOUND: "${operation.word}"`);
       } else {
         setDisplayText(`NOT FOUND: "${operation.word}"`);
       }
    }
  }, [operation]);

  const color = operation.isFalsePositive ? COLOR_FALSE_POSITIVE : "#ffffff";

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
      <group position={[0, 6, 0]}>
        <Text
          fontSize={0.8}
          color={color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {displayText}
        </Text>
      </group>
    </Float>
  );
};

interface SimulationSceneProps {
  bloomState: BloomState;
  lastOperation: OperationResult | null;
}

const SimulationScene: React.FC<SimulationSceneProps> = ({ bloomState, lastOperation }) => {
  // Determine camera distance based on array size
  const rows = Math.ceil(bloomState.m / ROW_LENGTH);
  
  // Calculate actual grid extent (centered at origin)
  const gridWidth = (ROW_LENGTH - 1) * (BOX_SIZE + GAP);
  const gridDepth = (rows - 1) * (BOX_SIZE + GAP);
  const gridDiagonal = Math.sqrt(gridWidth * gridWidth + gridDepth * gridDepth);
  
  // Position camera to see entire grid - need to account for grid extending in both +Z and -Z
  const camZ = Math.max(15, gridDiagonal * 1.2);
  const camY = Math.max(10, gridDepth * 0.8 + 8);

  return (
    <Canvas shadows dpr={[1, 2]}>
      <PerspectiveCamera makeDefault position={[0, camY, camZ]} fov={50} />
      <OrbitControls 
        maxPolarAngle={Math.PI / 2.2} 
        minPolarAngle={0.1}
        enablePan={true}
        enableZoom={true}
        target={[0, 0, 0]}
      />
      
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 10, Math.max(50, gridDiagonal * 2)]} />

      <ambientLight intensity={0.4} />
      <pointLight position={[10, 20, 10]} intensity={1} color="#ffffff" />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#00ffff" />

      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Grid of Bits */}
      <group>
        {bloomState.bitArray.map((count, i) => (
          <BitBox 
            key={i} 
            index={i} 
            count={count} 
            operation={lastOperation}
            totalSize={bloomState.m}
          />
        ))}
      </group>

      {/* Visual Effects for Operation */}
      {lastOperation && (
        <>
          <ConnectionBeams operation={lastOperation} totalSize={bloomState.m} />
          <FloatingLabel operation={lastOperation} />
        </>
      )}

      {/* Floor reflection plane for cyber aesthetic */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#0a0a0a" 
          metalness={0.9} 
          roughness={0.5} 
          transparent
          opacity={0.8}
        />
      </mesh>

    </Canvas>
  );
};

export default SimulationScene;
