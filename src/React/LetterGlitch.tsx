import { useRef, useEffect } from "react";

const SqlTypewriterCanvas = ({
  typingSpeed = 40, // ms entre caracteres
  lineHeight = 22,
  centerVignette = false,
  outerVignette = false,
}: {
  typingSpeed?: number;
  lineHeight?: number;
  centerVignette?: boolean;
  outerVignette?: boolean;
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animationRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  // Líneas de código SQL que se irán escribiendo
  const sqlLines = [
      "INSERT INTO training_jobs (batch_id, data)",
      "SELECT 'batch_2025_01',",
      "       json_build_object('age', age, 'bal', balance)",
      "FROM user_features",
      "WHERE last_active > NOW() - INTERVAL '30d'",
      "  AND target_label IS NOT NULL",
      "TABLESAMPLE BERNOULLI (10); -- 10% sample"
  ];



  const stateRef = useRef({
    lineIndex: 0,
    charIndex: 0,
  });

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = "16px monospace";
    ctx.textBaseline = "top";

    // Redibujar estado actual tras el resize
    drawAllText();
  };

  const clearAndFillBackground = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    const { width, height } = canvas.getBoundingClientRect();
    ctx.fillStyle = "#101010";
    ctx.fillRect(0, 0, width, height);
  };

  const drawAllText = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    clearAndFillBackground();

    const { lineIndex, charIndex } = stateRef.current;

    ctx.fillStyle = "#A476FF";

    for (let i = 0; i <= lineIndex; i++) {
      const fullLine = sqlLines[i] ?? "";
      const visibleChars = i === lineIndex ? charIndex : fullLine.length;
      const text = fullLine.slice(0, visibleChars);
      ctx.fillText(text, 20, 20 + i * lineHeight);
    }

    // Cursor parpadeando al final de la línea actual
    const currentLine = sqlLines[lineIndex] ?? "";
    const visibleText = currentLine.slice(0, charIndex);
    const cursorX = 20 + ctx.measureText(visibleText).width;
    const cursorY = 20 + lineIndex * lineHeight;
    const time = performance.now();
    if (Math.floor(time / 400) % 2 === 0) {
      ctx.fillRect(cursorX, cursorY + 2, 8, 16);
    }
  };

  const stepTyping = () => {
    const { lineIndex, charIndex } = stateRef.current;
    const currentLine = sqlLines[lineIndex];

    if (!currentLine) {
      // Reiniciar cuando termine todo
      stateRef.current = { lineIndex: 0, charIndex: 0 };
      drawAllText();
      return;
    }

    if (charIndex < currentLine.length) {
      stateRef.current.charIndex += 1;
    } else if (lineIndex < sqlLines.length - 1) {
      stateRef.current.lineIndex += 1;
      stateRef.current.charIndex = 0;
    } else {
      // Pausa al final y reinicio
      stateRef.current = { lineIndex: 0, charIndex: 0 };
    }

    drawAllText();
  };

  // Bucle sólo para refrescar cursor parpadeando
  const animate = () => {
    drawAllText();
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    ctxRef.current = canvas.getContext("2d");
    resizeCanvas();
    animate();

    // Intervalo de tipeo
    timerRef.current = window.setInterval(stepTyping, typingSpeed);

    let resizeTimeout: number;
    const handleResize = () => {
      window.clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(resizeCanvas, 100);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (timerRef.current) window.clearInterval(timerRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [typingSpeed, lineHeight]);

  return (
    <div className="relative w-full h-full bg-[#101010] overflow-hidden">
      <canvas ref={canvasRef} className="block w-full h-full" />
      {outerVignette && (
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,_rgba(16,16,16,0)_60%,_rgba(16,16,16,1)_100%)]" />
      )}
      {centerVignette && (
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,_rgba(0,0,0,0.8)_0%,_rgba(0,0,0,0)_60%)]" />
      )}
    </div>
  );
};

export default SqlTypewriterCanvas;
