"use client";

import { useRef, useEffect, useContext } from 'react';
import { GameContext } from './game-provider';
import { formatNum } from '@/lib/utils';
import Image from 'next/image';
import type { Particle, FloatingText } from '@/types/game';
import { useI18n } from '@/locales/client';

const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state, dispatch } = useContext(GameContext);
  const { t } = useI18n();
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const beanImgRef = useRef<HTMLImageElement>(null);
  const clickScaleRef = useRef(1.0);
  
  useEffect(() => {
    if (state) {
      particlesRef.current = state.particles;
      floatingTextsRef.current = state.floatingTexts;
      clickScaleRef.current = state.clickScale;
    }
  }, [state]);

  const handleInput = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || !dispatch) return;

    const rect = canvas.getBoundingClientRect();
    const points = 'touches' in e ? e.touches : [e];
    
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const x = (p.clientX - rect.left) * (canvas.width / rect.width);
      const y = (p.clientY - rect.top) * (canvas.height / rect.height);
      dispatch({ type: 'CANVAS_CLICK', payload: { x, y } });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrameId: number;

    const render = () => {
      if (!state) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      
      const { feverGauge, isFever, goldenBean } = state;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (clickScaleRef.current < 1.0) {
        clickScaleRef.current += 0.03;
        if (clickScaleRef.current > 1.0) clickScaleRef.current = 1.0;
      }

      // Main Bean
      ctx.save();
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2 + 10;
      ctx.translate(centerX, centerY);
      if (isFever) {
        const shake = Math.sin(Date.now() / 50) * 5;
        ctx.rotate(shake * Math.PI / 180);
        ctx.scale(1.1, 1.1);
      }
      ctx.scale(clickScaleRef.current, clickScaleRef.current);
      
      const beanImg = beanImgRef.current;
      if (beanImg && beanImg.complete && beanImg.naturalWidth > 0) {
          const size = 110;
          ctx.shadowColor = "rgba(62, 39, 35, 0.4)";
          ctx.shadowBlur = 15;
          ctx.shadowOffsetY = 10;
          ctx.drawImage(beanImg, -size / 2, -size / 2, size, size);
      } else {
        // Fallback drawing
        ctx.fillStyle = isFever ? '#ff5722' : '#6d4c41';
        ctx.beginPath();
        ctx.arc(0, 0, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🫘", 0, 0);
      }
      ctx.restore();

      // Golden Bean
      if (goldenBean.active) {
        const gb = goldenBean;
        ctx.save();
        ctx.translate(gb.x, gb.y);
        const scale = 1 + Math.sin(Date.now() / 100) * 0.1;
        ctx.scale(scale, scale);
        ctx.shadowColor = '#ff8f00'; ctx.shadowBlur = 20;
        ctx.rotate(-Math.PI / 6);
        const grd = ctx.createLinearGradient(-20, -20, 20, 20);
        grd.addColorStop(0, "#fff59d"); grd.addColorStop(0.5, "#fbc02d"); grd.addColorStop(1, "#f57f17");
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.ellipse(0, 0, 28, 18, 0, 0, 2 * Math.PI); ctx.fill();
        ctx.restore();
      }

      // Particles
      particlesRef.current.forEach((p) => {
          ctx.fillStyle = `rgba(62, 39, 35, ${p.life})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI*2); ctx.fill();
      });

      // Floating Texts
      ctx.textAlign = 'center';
      floatingTextsRef.current.forEach((ft) => {
          ctx.save(); ctx.globalAlpha = ft.life;
          ctx.font = `900 ${isFever ? '24px' : '18px'} var(--font-body)`;
          ctx.fillStyle = ft.color || (isFever ? '#d50000' : '#fff');
          ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 4;
          const text = ft.val === 'LUCKY!' ? t('lucky') : `+${typeof ft.val === 'number' ? formatNum(ft.val) : ft.val} ${typeof ft.val === 'number' ? '🫘' : ''}`;
          ctx.fillText(text, ft.x, ft.y); 
          ctx.restore();
      });
      ctx.textAlign = 'start';
      
      // Fever Bar
      ctx.fillStyle = 'hsl(var(--muted))';
      ctx.fillRect(50, 155, 300, 10);
      ctx.fillStyle = isFever ? '#d50000' : 'hsl(var(--primary))';
      ctx.fillRect(50, 155, 300 * (feverGauge / 100), 10);
      
      // Click Text
      ctx.fillStyle = 'hsl(var(--foreground) / 0.8)';
      ctx.font = '900 16px var(--font-headline)';
      ctx.textAlign = 'center';
      ctx.fillText(isFever ? `🔥 ${t('fever_mode')} (x5) 🔥` : t('click_to_roast'), canvas.width/2, 20);
      ctx.textAlign = 'start';
      
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state, t]);

  return (
    <div className="relative flex-shrink-0 shadow-inner rounded-2xl bg-black/5 backdrop-blur-sm">
      <Image
        ref={beanImgRef}
        src="https://picsum.photos/seed/bean/130/130"
        data-ai-hint="coffee bean"
        alt="Coffee Bean"
        width={130}
        height={130}
        className="hidden"
        unoptimized
      />
      <canvas
        ref={canvasRef}
        id="game"
        width="400"
        height="180"
        className="w-full cursor-pointer touch-none rounded-2xl"
        onMouseDown={handleInput}
        onTouchStart={handleInput}
      />
    </div>
  );
};

export default GameCanvas;
