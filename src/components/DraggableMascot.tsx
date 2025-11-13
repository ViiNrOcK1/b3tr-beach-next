// src/components/DraggableMascot.tsx
'use client';

import { useState, useRef, useEffect, MouseEvent } from 'react';
import Image from 'next/image';

// --- CHANGED: Updated props ---
type MascotProps = {
  idleImageSrc: string; // Renamed from imageSrc
  factImageSrcs: string[]; // NEW: An array of GIFs for reactions
  altText: string;
  facts: string[];
  initialPosition?: { x: number; y: number };
  animationType: 'jump' | 'slide' | 'none';
};

export default function DraggableMascot({
  idleImageSrc, // CHANGED
  factImageSrcs, // NEW
  altText,
  facts,
  initialPosition = { x: 50, y: 150 },
  animationType = 'none',
}: MascotProps) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [showFact, setShowFact] = useState(false);
  const [currentFact, setCurrentFact] = useState(facts[0]);

  // --- NEW: State to manage the current GIF ---
  const [currentImage, setCurrentImage] = useState(idleImageSrc);
  
  // --- NEW: Ref to manage the animation timer ---
  const factAnimationTimer = useRef<NodeJS.Timeout | null>(null);

  // Refs to handle drag logic
  const mascotRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const hasDragged = useRef(false);

  // --- CHANGED: Updated showNewFact function ---
  const showNewFact = () => {
    // 1. Pick and show the fact
    const randomFact = facts[Math.floor(Math.random() * facts.length)];
    setCurrentFact(randomFact);
    setShowFact(true);

    // 2. Clear any existing animation timer
    if (factAnimationTimer.current) {
      clearTimeout(factAnimationTimer.current);
    }

    // 3. Check if we have fact GIFs to play
    if (factImageSrcs && factImageSrcs.length > 0) {
      // 4. Pick a random "fact" GIF
      const randomFactImage =
        factImageSrcs[Math.floor(Math.random() * factImageSrcs.length)];
      
      // 5. Set the new image
      setCurrentImage(randomFactImage);

      // 6. Set a timer to revert to the idle image after 4 seconds (4000ms)
      // (Adjust this duration to match the length of your GIFs)
      factAnimationTimer.current = setTimeout(() => {
        setCurrentImage(idleImageSrc);
        factAnimationTimer.current = null; // Clear the ref
      }, 4000); 
    }
  };

  // --- Drag Handlers (No changes here) ---
  const onMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    hasDragged.current = false;
    const rect = mascotRef.current!.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const onMouseUp = () => {
    setIsDragging(false);
    if (!hasDragged.current) {
      showNewFact(); // This now triggers the new GIF logic
    }
  };

  const onMouseMove = (e: globalThis.MouseEvent) => {
    if (!isDragging) return;
    hasDragged.current = true;
    setPosition({
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y,
    });
  };
  
  // Global listeners for mouse move/up
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging]);

  // --- NEW: Effect to sync idle image if prop changes ---
  useEffect(() => {
    // If no animation is playing, ensure we are showing the idle image
    if (!factAnimationTimer.current) {
      setCurrentImage(idleImageSrc);
    }
  }, [idleImageSrc]);


  // Determine animation class (No change here)
  const animationClass =
    animationType === 'jump'
      ? 'jump-in'
      : animationType === 'slide'
      ? 'slide-in'
      : '';

  return (
    <>
      <div
        ref={mascotRef}
        className={`mascot-container ${animationClass}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={onMouseDown}
      >
        {/* Fact Bubble (No changes here) */}
        {showFact && (
          <div className="fact-bubble">
            <button className="close-btn" onClick={() => setShowFact(false)}>
              &times;
            </button>
            <p>{currentFact}</p>
          </div>
        )}

        {/* --- CHANGED: Mascot Image source is now dynamic --- */}
        <Image
          src={currentImage} // This now uses the state variable
          alt={altText}
          width={100}
          height={100}
          className="mascot-image"
          unoptimized // NEW: Add this if you are using GIFs to prevent optimization issues
        />
      </div>

      {/* STYLES (No changes here) */}
      <style jsx>{`
        /* --- Entrance Animations --- */
        @keyframes jump-in { /* ... */ }
        @keyframes slide-in { /* ... */ }
        .jump-in { /* ... */ }
        .slide-in { /* ... */ }

        /* --- Original Styles --- */
        .mascot-container {
          position: fixed;
          z-index: 1000;
          user-select: none;
          transition: transform 0.1s ease-out;
          opacity: 0; 
          animation-fill-mode: forwards;
        }
        .mascot-container:active { transform: scale(1.05); }
        .mascot-image { pointer-events: none; }
        .fact-bubble { /* ... */ }
        .fact-bubble p { /* ... */ }
        .fact-bubble::after { /* ... */ }
        .close-btn { /* ... */ }
        .close-btn:hover { /* ... */ }
      `}</style>
    </>
  );
}