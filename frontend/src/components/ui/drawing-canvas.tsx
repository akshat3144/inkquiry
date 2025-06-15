import React, { useEffect, useRef, useImperativeHandle, useState } from "react";

// Update the DrawingCanvasRef type
export type DrawingCanvasRef = {
  resetCanvas: () => void;
  getDataURL: () => string | undefined;
  setCompositeOperation: (operation: GlobalCompositeOperation) => void;
  loadFromDataURL: (dataURL: string) => void; // Add this method
};

interface DrawingCanvasProps {
  activeTool: "pen" | "eraser";
  brushSize: number;
  eraserSize: number;
  color: string;
  onReset?: () => void;
  className?: string;
}

export const DrawingCanvas = React.forwardRef<
  DrawingCanvasRef,
  DrawingCanvasProps
>(({ activeTool, brushSize, eraserSize, color, className }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasInitializedRef = useRef(false);
  const [cursorStyle, setCursorStyle] = useState<React.CSSProperties>({});

  // Update cursor style when tool changes
  useEffect(() => {
    if (activeTool === "eraser") {
      // Create a custom eraser cursor using CSS
      setCursorStyle({
        cursor: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15.5 2.5a2.121 2.121 0 0 1 3 3L12 12l-4 1 1-4 6.5-6.5z"/></svg>') 0 24, auto`,
      });
    } else {
      // Pen cursor - crosshair is good for drawing
      setCursorStyle({
        cursor: "crosshair",
      });
    }
  }, [activeTool]);

  // Initialize canvas only once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Make canvas responsive to container
        const resizeCanvas = () => {
          const container = canvas.parentElement;
          if (container) {
            // Store the current drawing if already initialized
            let imageData = null;
            if (canvasInitializedRef.current) {
              imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            }

            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;

            // Set default properties
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.fillStyle = "#ffffff"; // White background
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Restore drawing if it existed
            if (imageData) {
              try {
                ctx.putImageData(imageData, 0, 0);
              } catch (error) {
                console.log(
                  `Could not restore canvas data during resize: ${error}`
                );
              }
            }
          }
        };

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        canvasInitializedRef.current = true;

        return () => {
          window.removeEventListener("resize", resizeCanvas);
        };
      }
    }
  }, []);

  // Only update drawing properties without clearing canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Only update the properties we need for the tool change
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
          ctx.globalCompositeOperation = "source-over";
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
    setIsDrawing(false);
  };

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Reset to default composite operation
        ctx.globalCompositeOperation = "source-over";
      }
    }
  };

  // Expose canvas methods to parent via ref - always include this hook!
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
      loadFromDataURL: (dataURL: string) => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            const img = new Image();
            img.onload = () => {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0);
            };
            img.src = dataURL;
          }
        }
      },
    }),
    [] // Empty dependency array so this doesn't change between renders
  );

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        style={cursorStyle}
        className={`w-full h-full border shadow-sm rounded-md bg-white ${
          className || ""
        }`}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
      />

      {/* Tool indicator */}
      <div className="absolute top-6 right-6 bg-white bg-opacity-70 border border-gray-200 rounded-md px-2 py-1 text-xs text-gray-600 shadow-sm">
        {activeTool === "pen"
          ? `Pen (${brushSize}px)`
          : `Eraser (${eraserSize}px)`}
      </div>
    </div>
  );
});

DrawingCanvas.displayName = "DrawingCanvas";
