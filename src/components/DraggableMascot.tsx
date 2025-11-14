// src/components/DraggableMascot.tsx
'use client';

import { useState, useRef, useEffect, MouseEvent } from 'react';
import Image from 'next/image';

type MascotProps = {
  idleImageSrc: string;
  factImageSrcs: string[];
  altText: string;
  facts: string[];
  initialPosition?: { x: number; y: number };
  animationType: 'jump' | 'slide' | 'none';
};

export default function DraggableMascot({
  idleImageSrc,
  factImageSrcs,
  altText,
  facts,
  initialPosition = { x: 50, y: 150 },
  animationType = 'none',
}: MascotProps) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [showFact, setShowFact] = useState(false);
  const [currentFact, setCurrentFact] = useState(facts[0]);
  const [currentImage, setCurrentImage] = useState(idleImageSrc);
  const factAnimationTimer = useRef<NodeJS.Timeout | null>(null);
  const mascotRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const hasDragged = useRef(false);

  const showNewFact = () => {
    const randomFact = facts[Math.floor(Math.random() * facts.length)];
    setCurrentFact(randomFact);
    setShowFact(true);

    if (factAnimationTimer.current) {
      clearTimeout(factAnimationTimer.current);
    }

    if (factImageSrcs && factImageSrcs.length > 0) {
      const randomFactImage =
        factImageSrcs[Math.floor(Math.random() * factImageSrcs.length)];
      setCurrentImage(randomFactImage);

      factAnimationTimer.current = setTimeout(() => {
        setCurrentImage(idleImageSrc);
        factAnimationTimer.current = null;
      }, 4000); // 4-second reaction
    }
  };

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
      showNewFact();
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

  useEffect(() => {
    if (!factAnimationTimer.current) {
      setCurrentImage(idleImageSrc);
    }
  }, [idleImageSrc]);

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
        {showFact && (
          <div className="fact-bubble">
            <button className="close-btn" onClick={() => setShowFact(false)}>
              &times;
            </button>
            <p>{currentFact}</p>
          </div>
        )}
        <Image
          src={currentImage}
          alt={altText}
          width={100}
          height={100}
          className="mascot-image"
          unoptimized // Important for GIFs
        />
      </div>

      {/* This CSS has the correct animations */}
      <style jsx>{`
        /* --- Entrance Animations --- */
        @keyframes jump-in {
          0% {
            transform: translateY(300px) scale(0.8);
            opacity: 0;
          }
          60% {
            transform: translateY(-20px) scale(1.05);
            opacity: 1;
          }
          80% {
            transform: translateY(10px) scale(0.95);
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        @keyframes slide-in {
          0% {
            transform: translateX(-300px);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .jump-in {
          animation: jump-in 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          animation-delay: 0.5s; /* This is the delay, NOT 5 seconds */
        }
        .slide-in {
          animation: slide-in 1s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          animation-delay: 0.5s;
        }

        /* --- Main Component Styles --- */
        .mascot-container {
          position: fixed;
          z-index: 9999; /* High z-index */
          user-select: none;
          transition: transform 0.1s ease-out;
          opacity: 0; /* Start invisible */
          animation-fill-mode: forwards;
          will-change: transform, opacity;
        }
        .mascot-container:active {
          transform: scale(1.05);
        }
        .mascot-image {
          pointer-events: none;
        }
        .fact-bubble {
          position: absolute;
          bottom: 90%;
          left: 50%;
          transform: translateX(-50%);
          width: 250px;
          background-color: white;
          color: #333;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          border: 2px solid #facc15;
          z-index: 1001;
        }
        .fact-bubble p {
          margin: 0;
          font-size: 14px;
          line-height: 1.5;
        }
        .fact-bubble::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-width: 10px;
          border-style: solid;
          border-color: #facc15 transparent transparent transparent;
        }
        .close-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          background: #eee;
          border: none;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: bold;
          color: #777;
          cursor: pointer;
        }
        .close-btn:hover {
          background: #ddd;
          color: #000;
        }
      `}</style>
    </>
  );
}