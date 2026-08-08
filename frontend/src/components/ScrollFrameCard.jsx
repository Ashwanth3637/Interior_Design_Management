import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Sparkles, Layers, RefreshCw, ChevronDown, Play, Pause, Eye, Compass } from 'lucide-react';

const ScrollFrameCard = ({ totalFrames = 90, framePrefix = '/frames/frame_', frameExt = '.jpg' }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  const [currentFrame, setCurrentFrame] = useState(0);
  const [targetFrame, setTargetFrame] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const imagesRef = useRef([]);

  // Preload frame images if available in public/frames/
  useEffect(() => {
    let count = 0;
    const images = [];

    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(2, '0');
      const frameNum3 = String(i).padStart(3, '0');

      img.src = `${framePrefix}${frameNum}${frameExt}`;
      
      img.onload = () => {
        count++;
        setLoadedCount(count);
      };

      img.onerror = () => {
        // Fallback: try 3-digit padding if 2-digit is not found
        img.src = `${framePrefix}${frameNum3}${frameExt}`;
      };

      images.push(img);
    }
    imagesRef.current = images;
  }, [totalFrames, framePrefix, frameExt]);

  // Procedural 3D Room Transformation Drawer (Fallback/Enhancement for 50 Frames)
  const drawProceduralFrame = useCallback((ctx, width, height, frameIndex) => {
    const progress = frameIndex / (totalFrames - 1); // 0 to 1

    // Background Gradient (Architectural dusk to warm luxury lighting)
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    const r1 = Math.round(15 + progress * 10);
    const g1 = Math.round(23 + progress * 15);
    const b1 = Math.round(42 - progress * 10);
    bgGrad.addColorStop(0, `rgb(${r1}, ${g1}, ${b1})`);
    bgGrad.addColorStop(1, '#0b0f19');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Grid Floor / Blueprint Lines (Fades out as render progress grows)
    const wireOpacity = Math.max(0, 1 - progress * 1.5);
    if (wireOpacity > 0.05) {
      ctx.save();
      ctx.strokeStyle = `rgba(59, 130, 246, ${wireOpacity * 0.4})`;
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 3D Perspective Room Walls Calculation
    const cx = width / 2;
    const cy = height / 2;
    const cameraAngle = (progress - 0.5) * 0.4; // Camera pan across frames

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(cameraAngle);

    // Inner back wall
    const wSize = Math.min(width, height) * (0.35 + progress * 0.05);
    const bx1 = -wSize;
    const by1 = -wSize * 0.65;
    const bx2 = wSize;
    const by2 = wSize * 0.65;

    // Outer wall bounds
    const ox1 = -width * 0.8;
    const oy1 = -height * 0.8;
    const ox2 = width * 0.8;
    const oy2 = height * 0.8;

    // Wall Colors based on frame progress
    const wallColor = `rgba(${Math.round(240 - progress * 20)}, ${Math.round(240 - progress * 15)}, ${Math.round(245 - progress * 10)}, ${0.1 + progress * 0.85})`;
    const floorColor = `rgba(${Math.round(180 + progress * 50)}, ${Math.round(140 + progress * 40)}, ${Math.round(100 + progress * 30)}, ${0.2 + progress * 0.8})`;

    // Back Wall
    ctx.fillStyle = wallColor;
    ctx.beginPath();
    ctx.rect(bx1, by1, bx2 - bx1, by2 - by1);
    ctx.fill();
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + progress * 0.3})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Floor
    ctx.fillStyle = floorColor;
    ctx.beginPath();
    ctx.moveTo(bx1, by2);
    ctx.lineTo(bx2, by2);
    ctx.lineTo(ox2, oy2);
    ctx.lineTo(ox1, oy2);
    ctx.closePath();
    ctx.fill();

    // Floor Planks / Tiles Texture (Appears as progress advances)
    if (progress > 0.2) {
      ctx.strokeStyle = `rgba(0, 0, 0, ${(progress - 0.2) * 0.15})`;
      ctx.lineWidth = 1;
      for (let p = bx1; p <= bx2; p += 30) {
        ctx.beginPath();
        ctx.moveTo(p, by2);
        ctx.lineTo(p * 2.2, oy2);
        ctx.stroke();
      }
    }

    // Left Wall
    ctx.fillStyle = `rgba(${Math.round(210 - progress * 30)}, ${Math.round(210 - progress * 20)}, ${Math.round(220 - progress * 15)}, ${0.15 + progress * 0.75})`;
    ctx.beginPath();
    ctx.moveTo(ox1, oy1);
    ctx.lineTo(bx1, by1);
    ctx.lineTo(bx1, by2);
    ctx.lineTo(ox1, oy2);
    ctx.closePath();
    ctx.fill();

    // Window on Left Wall (Draws frame by frame)
    if (progress > 0.15) {
      const winOpacity = Math.min(1, (progress - 0.15) * 2);
      ctx.fillStyle = `rgba(224, 242, 254, ${winOpacity * 0.9})`;
      ctx.beginPath();
      ctx.moveTo(ox1 + (bx1 - ox1) * 0.3, oy1 + (by1 - oy1) * 0.3);
      ctx.lineTo(ox1 + (bx1 - ox1) * 0.7, oy1 + (by1 - oy1) * 0.3);
      ctx.lineTo(ox1 + (bx1 - ox1) * 0.7, oy2 + (by2 - oy2) * 0.3);
      ctx.lineTo(ox1 + (bx1 - ox1) * 0.3, oy2 + (by2 - oy2) * 0.3);
      ctx.closePath();
      ctx.fill();

      // Sunlight Beam
      const sunGrad = ctx.createLinearGradient(
        ox1 + (bx1 - ox1) * 0.5, oy1 + (by1 - oy1) * 0.3,
        bx1 + 100, by2 + 50
      );
      sunGrad.addColorStop(0, `rgba(254, 240, 138, ${winOpacity * 0.35})`);
      sunGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.moveTo(ox1 + (bx1 - ox1) * 0.3, oy1 + (by1 - oy1) * 0.3);
      ctx.lineTo(ox1 + (bx1 - ox1) * 0.7, oy1 + (by1 - oy1) * 0.3);
      ctx.lineTo(bx1 + 180, by2 + 120);
      ctx.lineTo(bx1 - 50, by2 + 120);
      ctx.closePath();
      ctx.fill();
    }

    // Modern Sofa Placement (Appears frame 15..50)
    if (progress > 0.3) {
      const sofaAlpha = Math.min(1, (progress - 0.3) * 3);
      ctx.save();
      ctx.fillStyle = `rgba(30, 41, 59, ${sofaAlpha})`;
      
      const sWidth = wSize * 1.1;
      const sHeight = wSize * 0.35;
      const sX = -sWidth / 2;
      const sY = by2 - sHeight * 0.5;

      ctx.shadowColor = `rgba(0, 0, 0, ${sofaAlpha * 0.4})`;
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 10;

      // Base
      ctx.beginPath();
      ctx.roundRect(sX, sY, sWidth, sHeight, 16);
      ctx.fill();

      // Backrest
      ctx.fillStyle = `rgba(51, 65, 85, ${sofaAlpha})`;
      ctx.beginPath();
      ctx.roundRect(sX, sY - sHeight * 0.6, sWidth, sHeight * 0.7, 14);
      ctx.fill();

      // Cushions details
      ctx.fillStyle = `rgba(37, 99, 235, ${sofaAlpha * 0.8})`;
      ctx.beginPath();
      ctx.roundRect(sX + 20, sY + 10, sWidth / 2 - 30, sHeight - 20, 8);
      ctx.roundRect(sX + sWidth / 2 + 10, sY + 10, sWidth / 2 - 30, sHeight - 20, 8);
      ctx.fill();

      ctx.restore();
    }

    // Modern Coffee Table & Art Piece (Appears frame 25..50)
    if (progress > 0.5) {
      const artAlpha = Math.min(1, (progress - 0.5) * 3.5);
      const sWidth = wSize * 1.1;

      // Wall Art
      ctx.save();
      ctx.fillStyle = `rgba(248, 250, 252, ${artAlpha})`;
      ctx.shadowColor = `rgba(0, 0, 0, 0.25)`;
      ctx.shadowBlur = 12;
      const artW = wSize * 0.7;
      const artH = wSize * 0.45;
      ctx.fillRect(-artW / 2, by1 + 30, artW, artH);
      
      // Abstract canvas stroke inside artwork
      ctx.fillStyle = `rgba(37, 99, 235, ${artAlpha * 0.9})`;
      ctx.beginPath();
      ctx.arc(-20, by1 + 60, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(245, 158, 11, ${artAlpha * 0.8})`;
      ctx.beginPath();
      ctx.arc(25, by1 + 75, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Marble Coffee table
      ctx.save();
      ctx.fillStyle = `rgba(241, 245, 249, ${artAlpha})`;
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.ellipse(0, by2 + 60, sWidth * 0.35, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Warm Ambient Pendant Lights (Appears frame 35..50)
    if (progress > 0.7) {
      const glowAlpha = Math.min(1, (progress - 0.7) * 3.33);
      ctx.save();
      const lx = -wSize * 0.4;
      const ly = by1 - 40;

      // Cord
      ctx.strokeStyle = `rgba(203, 213, 225, ${glowAlpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lx, -height * 0.5);
      ctx.lineTo(lx, ly);
      ctx.stroke();

      // Pendant Glow
      const glowGrad = ctx.createRadialGradient(lx, ly + 20, 5, lx, ly + 20, 70);
      glowGrad.addColorStop(0, `rgba(253, 224, 71, ${glowAlpha * 0.9})`);
      glowGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(lx, ly + 20, 70, 0, Math.PI * 2);
      ctx.fill();

      // Bulb
      ctx.fillStyle = `rgba(255, 255, 255, ${glowAlpha})`;
      ctx.beginPath();
      ctx.arc(lx, ly + 15, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Frame Stage Overlay Text (Wireframe -> 3D Clay -> Photorealistic Luxury Interior)
    ctx.restore();

    // Stage Label Overlay
    let stageTitle = 'Stage 1/3: Architectural Blueprint Wireframe';
    if (progress > 0.65) {
      stageTitle = 'Stage 3/3: Photorealistic 4K Luxury Render';
    } else if (progress > 0.3) {
      stageTitle = 'Stage 2/3: 3D Spatial Geometry & Material Setup';
    }

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.beginPath();
    ctx.roundRect(20, height - 64, width - 40, 44, 10);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '600 14px Inter, sans-serif';
    ctx.fillText(stageTitle, 36, height - 38);

    // Progress bar line at bottom
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(20, height - 24, (width - 40) * progress, 4);

    ctx.restore();
  }, [totalFrames]);



  // Main Canvas Render Loop with High-DPI Clarity & Dual-Frame Interpolation (Crossfade)
  const renderFrame = useCallback((floatFrameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // High quality canvas clarity settings
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Clear background
    ctx.clearRect(0, 0, width, height);

    // Calculate sub-frame interpolation values
    const clampedFrame = Math.min(totalFrames - 1, Math.max(0, floatFrameIndex));
    const floorIndex = Math.floor(clampedFrame);
    const ceilIndex = Math.min(totalFrames - 1, floorIndex + 1);
    const alpha = clampedFrame - floorIndex; // Fractional progress 0..1 between adjacent frames

    const drawSingleImage = (imgIndex, opacity) => {
      if (opacity <= 0) return false;
      const loadedImg = imagesRef.current[imgIndex];
      if (loadedImg && loadedImg.complete && loadedImg.naturalWidth > 0) {
        const hRatio = width / loadedImg.width;
        const vRatio = height / loadedImg.height;
        const ratio = Math.max(hRatio, vRatio);
        const centerShift_x = (width - loadedImg.width * ratio) / 2;
        const centerShift_y = (height - loadedImg.height * ratio) / 2;

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.drawImage(
          loadedImg,
          0, 0, loadedImg.width, loadedImg.height,
          centerShift_x, centerShift_y, loadedImg.width * ratio, loadedImg.height * ratio
        );
        ctx.restore();
        return true;
      }
      return false;
    };

    // Draw base frame at full 100% opacity (1.0) so background never bleeds through
    const hasFloorImg = drawSingleImage(floorIndex, 1.0);

    // Draw next frame on top with alpha opacity for smooth flicker-free crossfading
    if (ceilIndex !== floorIndex && alpha > 0.005) {
      drawSingleImage(ceilIndex, alpha);
    }

    // Fallback if images are not yet loaded
    if (!hasFloorImg) {
      drawProceduralFrame(ctx, width, height, Math.round(clampedFrame));
    }
  }, [totalFrames, drawProceduralFrame]);

  // Smooth continuous frame interpolation (Lerp) using requestAnimationFrame
  useEffect(() => {
    let animId;

    const loop = () => {
      setCurrentFrame((prevFrame) => {
        const diff = targetFrame - prevFrame;
        if (Math.abs(diff) < 0.001) {
          renderFrame(targetFrame);
          return targetFrame;
        }
        // Smooth lerp factor (0.18) for buttery continuous sub-frame interpolation
        const nextFrame = prevFrame + diff * 0.18;
        renderFrame(nextFrame);
        return nextFrame;
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [targetFrame, renderFrame]);

  // Listen to Window Scroll inside container bounds
  useEffect(() => {
    const handleScroll = () => {
      if (isAutoPlaying) return;
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Scroll progress from top of container entering screen to bottom exiting
      const totalScrollableDistance = rect.height - windowHeight;
      if (totalScrollableDistance <= 0) return;

      const currentScrollPosition = -rect.top;
      const progress = Math.min(1, Math.max(0, currentScrollPosition / totalScrollableDistance));

      const newFrame = progress * (totalFrames - 1);
      setTargetFrame(newFrame);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [totalFrames, isAutoPlaying]);

  // Auto-play timer if user triggers preview mode
  useEffect(() => {
    let interval;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setTargetFrame((prev) => (prev + 1) % totalFrames);
      }, 60);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, totalFrames]);

  // Resize Canvas to True 4K Ultra HD Resolution (3840x2160 / 4x High-DPI Scaling)
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      // True 4K UHD Canvas Buffer Resolution
      const dpr = Math.max(4, (window.devicePixelRatio || 1) * 2);

      canvas.width = (rect.width || 960) * dpr;
      canvas.height = (rect.height || 540) * dpr;

      renderFrame(currentFrame);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentFrame, renderFrame]);

  const activeDisplayFrame = Math.round(currentFrame) + 1;

  return (
    <div ref={containerRef} className="scroll-frame-container">
      {/* Sticky Card Wrapper */}
      <div className="scroll-frame-sticky">
        <div className="scroll-frame-card plain-scroll">
          {/* Plain Canvas Display Viewport */}
          <div className="frame-canvas-wrapper">
            <canvas ref={canvasRef} className="frame-canvas" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollFrameCard;
