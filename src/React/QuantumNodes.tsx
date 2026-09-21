import { useEffect, useRef } from "react";

interface QuantumNodesProps {
  backgroundColor?: string;
  nodeColor?: string;
  activeColor?: string;
  spacing?: number;
  className?: string;
}

interface NodePoint {
  x: number;
  y: number;
}

const QuantumNodes = ({
  backgroundColor = "#080808",
  nodeColor = "rgba(255, 255, 255, 0.45)",
  activeColor = "#7153AD",
  spacing = 50,
  className = "",
}: QuantumNodesProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let devicePixelRatio = 1;
    let nodes: NodePoint[] = [];
    const pointer = { x: -9999, y: -9999, inside: false };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      canvas.width = Math.floor(width * devicePixelRatio);
      canvas.height = Math.floor(height * devicePixelRatio);
      nodes = [];

      for (let y = spacing / 2; y <= height; y += spacing) {
        for (let x = spacing / 2; x <= width; x += spacing) {
          nodes.push({ x, y });
        }
      }
    };

    const draw = () => {
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, width, height);

      nodes.forEach((node) => {
        const distance = pointer.inside
          ? Math.hypot(pointer.x - node.x, pointer.y - node.y)
          : Number.POSITIVE_INFINITY;
        const influence = Math.max(0, 1 - distance / 150);
        const radius = 1.5 + influence * 1.5;

        if (influence > 0) {
          context.save();
          context.globalAlpha = influence * 0.8;
          context.shadowColor = activeColor;
          context.shadowBlur = 18;
          context.fillStyle = activeColor;
          context.beginPath();
          context.arc(node.x, node.y, radius, 0, Math.PI * 2);
          context.fill();
          context.restore();

          context.globalAlpha = influence * 0.35;
          context.strokeStyle = activeColor;
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(node.x, node.y);
          context.lineTo(pointer.x, pointer.y);
          context.stroke();
        }

        context.globalAlpha = 0.65 + influence * 0.35;
        context.fillStyle = influence > 0 ? activeColor : nodeColor;
        context.beginPath();
        context.arc(node.x, node.y, radius, 0, Math.PI * 2);
        context.fill();
      });

      context.globalAlpha = 1;
      animationFrame = window.requestAnimationFrame(draw);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
      pointer.inside =
        pointer.x >= 0 && pointer.x <= bounds.width && pointer.y >= 0 && pointer.y <= bounds.height;
    };

    const handlePointerLeave = () => {
      pointer.inside = false;
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [activeColor, backgroundColor, nodeColor, spacing]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none h-full w-full ${className}`}
    />
  );
};

export default QuantumNodes;
