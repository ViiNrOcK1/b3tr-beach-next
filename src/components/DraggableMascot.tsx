// src/components/DraggableMascot.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface DraggableMascotProps {
  idleImageSrc: string;
  factImageSrcs: string[];
  altText: string;
  facts: string[];
  initialPosition: { x: number; y: number };
  animationType: 'jump' | 'slide';
}

export default function DraggableMascot({
  idleImageSrc,
  factImageSrcs,
  altText,
  facts,
  initialPosition,
  animationType,
}: DraggableMascotProps) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [currentFact, setCurrentFact] = useState<string | null>(null);
  const [factImage, setFactImage] = useState<string | null>(null);
  const [showFact, setShowFact] = useState(false);
  const mascotRef = useRef<HTMLDivElement>(null);

  // Random fact + image
  const showRandomFact = () => {
    const randomIndex = Math.floor(Math.random() * facts.length);
    setCurrentFact(facts[randomIndex]);
    setFactImage(factImageSrcs[randomIndex % factImageSrcs.length]);
    setShowFact(true);
    setTimeout(() => setShowFact(false), 5000);
  };

  // Mouse/Touch drag handlers
  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragOffset({
      x: clientX - position.x,
      y: clientY - position.y,
    });
  };

  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setPosition({
      x: clientX - dragOffset.x,
      y: clientY - dragOffset.y,
    });
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleMove);
      document.addEventListener('touchend', handleEnd);
      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging, dragOffset]);

  // Animation class
  const animationClass = animationType === 'jump' ? 'animate-jumpIn' : 'animate-slideIn';

  return (
    <>
      {/* Mascot */}
      <div
        ref={mascotRef}
        className={`fixed w-32 h-32 cursor-grab active:cursor-grabbing transition-all duration-300 z-50 ${animationClass} ${isDragging ? 'opacity-80' : 'opacity-100'}`}
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        onClick={(e) => {
          e.stopPropagation();
          showRandomFact();
        }}
      >
        <Image
          src={idleImageSrc}
          alt={altText}
          width={128}
          height={128}
          className="w-full h-full object-contain drop-shadow-lg"
          draggable={false}
        />
      </div>

      {/* Fact Bubble */}
      {showFact && currentFact && factImage && (
        <div
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 max-w-sm shadow-2xl z-50 animate-fadeIn"
          style={{ pointerEvents: 'none' }}
        >
          <Image
            src={factImage}
            alt="Fact"
            width={200}
            height={200}
            className="w-full h-auto rounded-lg mb-3"
          />
          <p className="text-center text-gray-800 font-medium">{currentFact}</p>
        </div>
      )}
    </>
  );
}