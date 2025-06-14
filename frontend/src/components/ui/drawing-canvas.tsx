import React, { useEffect, useRef, forwardRef, useImperativeHandle } from "react";

// Define the ref type
export interface DrawingCanvasRef {
  resetCanvas: () => void;
  getDataURL: () => string | undefined;
  setCompositeOperation: (operation: GlobalCompositeOperation) => void;
}

interface DrawingCanvasProps {
  activeTool: "pen" | "eraser";
  brushSize: number;
  eraserSize: number;
  color: string;
  onReset?: () => void;
  className?: string;
}

export const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(({
  activeTool,
  brushSize,
  eraserSize,
  color,
  className,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);

  // Canvas setup
  useEffect(() => {
    // Initialize canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Make canvas responsive to container
        const resizeCanvas = () => {
          const container = canvas.parentElement;
          if (container) {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.lineWidth = activeTool === "pen" ? brushSize : eraserSize;
            ctx.strokeStyle = activeTool === "pen" ? color : "#ffffff";
            ctx.fillStyle = "#ffffff"; // White background
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
        };

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        return () => {
          window.removeEventListener("resize", resizeCanvas);
        };
      }
    }
  }, [brushSize, eraserSize, color, activeTool]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineWidth = activeTool === "pen" ? brushSize : eraserSize;
        ctx.strokeStyle = activeTool === "pen" ? color : "#ffffff";
        if (activeTool === "pen") {
          ctx.globalCompositeOperation = "source-over";
        } else {
          ctx.globalCompositeOperation = "destination-out";
        }
      }
    }
  }, [activeTool, brushSize, eraserSize, color]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);

        // Set stroke style based on active tool
        if (activeTool === "pen") {
          ctx.strokeStyle = color;
          ctx.lineWidth = brushSize;
        } else if (activeTool === "eraser") {
          ctx.strokeStyle = "#ffffff"; // White for eraser
          ctx.lineWidth = eraserSize;
          ctx.globalCompositeOperation = "destination-out";
        }

        setIsDrawing(true);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) {
      return;
    }
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx && activeTool === "eraser") {
        // Reset composite operation back to default after using eraser
        ctx.globalCompositeOperation = "source-over";
      }
    }
    setIsDrawing(false);
  };

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };
  
  // Expose canvas methods to parent via ref
  useImperativeHandle(
    ref,
    () => ({
      resetCanvas,
      getDataURL: () => canvasRef.current?.toDataURL("image/png"),
      setCompositeOperation: (operation: GlobalCompositeOperation) => {
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
          ctx.globalCompositeOperation = operation;
        }
      },
    }),
    []
  );

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className={`w-full h-full cursor-${
          activeTool === "pen" ? "crosshair" : "cell"
        } border shadow-sm rounded-md bg-white ${className || ""}`}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
      />
      {/* Tool indicator */}
    </div>
  );
});
