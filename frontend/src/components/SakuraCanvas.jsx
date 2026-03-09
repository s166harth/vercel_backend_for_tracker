import React, { useEffect, useRef } from 'react';

/**
 * SakuraCanvas - Falling cherry blossom petals animation
 * Renders on canvas for performance with many particles
 */
export function SakuraCanvas() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const petalsRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Petal class
    class Petal {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        // Random starting position
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : -20;
        
        // Size variation (smaller petals fall slower)
        this.size = Math.random() * 8 + 4;
        
        // Fall speed based on size
        this.speedY = Math.random() * 1 + 0.5;
        this.speedX = Math.random() * 2 - 1;
        
        // Sway motion
        this.swayAmplitude = Math.random() * 2 + 1;
        this.swayFrequency = Math.random() * 0.02 + 0.01;
        this.swayOffset = Math.random() * Math.PI * 2;
        
        // Rotation
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = Math.random() * 0.02 - 0.01;
        
        // Opacity variation
        this.opacity = Math.random() * 0.5 + 0.3;
        
        // Color: white with darker edge, light pink, or red tint
        // Optimized for visibility on white background
        const colors = [
          { r: 255, g: 255, b: 255, edge: 200 },  // White with gray edge
          { r: 255, g: 183, b: 197 },  // Light pink
          { r: 220, g: 38, b: 38 },    // Red
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.hasEdge = this.color.edge !== undefined;
        
        // Petal shape variation
        this.shape = Math.floor(Math.random() * 3);
      }

      update(time) {
        // Update position
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(time * this.swayFrequency + this.swayOffset) * this.swayAmplitude;
        
        // Update rotation
        this.rotation += this.rotationSpeed;
        
        // Reset if out of bounds
        if (this.y > height + 20 || this.x < -20 || this.x > width + 20) {
          this.reset();
        }
      }

      draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;

        // Draw petal shape
        ctx.beginPath();
        ctx.fillStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;

        if (this.shape === 0) {
          // Oval petal
          ctx.ellipse(0, 0, this.size, this.size / 2, 0, 0, Math.PI * 2);
        } else if (this.shape === 1) {
          // Pointed petal
          ctx.moveTo(0, -this.size / 2);
          ctx.bezierCurveTo(
            this.size / 2, -this.size / 4,
            this.size, this.size / 2,
            0, this.size / 2
          );
          ctx.bezierCurveTo(
            -this.size, this.size / 2,
            -this.size / 2, -this.size / 4,
            0, -this.size / 2
          );
        } else {
          // Simple circle petal
          ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        }

        ctx.fill();
        
        // Add edge stroke for white petals (visibility on white background)
        if (this.hasEdge) {
          ctx.strokeStyle = `rgb(${this.color.edge}, ${this.color.edge}, ${this.color.edge})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
        
        ctx.restore();
      }
    }

    // Initialize petals
    const petalCount = Math.min(150, Math.floor((width * height) / 10000));
    petalsRef.current = Array.from({ length: petalCount }, () => new Petal());

    // Animation loop
    let time = 0;
    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Update and draw petals
      petalsRef.current.forEach(petal => {
        petal.update(time);
        petal.draw(ctx);
      });
      
      time++;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      
      // Reinitialize petals for new size
      const newPetalCount = Math.min(150, Math.floor((width * height) / 10000));
      petalsRef.current = Array.from({ length: newPetalCount }, () => new Petal());
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="sakura-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
