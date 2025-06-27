import React, { useEffect, useRef, useImperativeHandle, useState } from "react";

// Update the DrawingCanvasRef type
export type DrawingCanvasRef = {
  resetCanvas: () => void;
  getDataURL: () => string | undefined;
  setCompositeOperation: (operation: GlobalCompositeOperation) => void;
  loadFromDataURL: (dataURL: string) => void;
  forceRefresh: () => void; // Add method to force a redraw
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
    console.log("Initializing canvas...");
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Make canvas responsive to container
        const resizeCanvas = () => {
          console.log("Canvas resize triggered");
          const container = canvas.parentElement;
          if (container) {
            // Store the current drawing if already initialized
            let imageData = null;
            if (canvasInitializedRef.current) {
              try {
                imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                console.log("Saved current canvas state during resize");
              } catch (error) {
                console.error("Could not save canvas state:", error);
              }
            }

            // Update canvas dimensions to match container
            const oldWidth = canvas.width;
            const oldHeight = canvas.height;
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            console.log(
              `Resized canvas: ${oldWidth}x${oldHeight} -> ${canvas.width}x${canvas.height}`
            );

            // Set default properties
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.fillStyle = "#ffffff"; // White background
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Restore drawing if it existed
            if (imageData) {
              try {
                ctx.putImageData(imageData, 0, 0);
                console.log("Restored canvas drawing after resize");
              } catch (error) {
                console.error(
                  `Could not restore canvas data during resize: ${error}`
                );
              }
            }
          }
        }; // Initial setup
        resizeCanvas();

        // Set a flag that canvas is initialized
        setTimeout(() => {
          canvasInitializedRef.current = true;
          console.log("Canvas initialization complete");
        }, 100);

        // Add resize listener
        window.addEventListener("resize", resizeCanvas);

        // Cleanup function
        return () => {
          window.removeEventListener("resize", resizeCanvas);
          console.log("Canvas resize listener removed");
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

  // Helper function to get coordinates for both mouse and touch events
  const getEventCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      // Touch event
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      // Mouse event
      return {
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      };
    }
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault(); // Prevent scrolling on touch devices

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const coords = getEventCoordinates(e);

        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);

        // Set stroke style based on active tool
        if (activeTool === "pen") {
          ctx.strokeStyle = color;
          ctx.lineWidth = brushSize;
          ctx.globalCompositeOperation = "source-over";
        } else if (activeTool === "eraser") {
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = eraserSize;
          ctx.globalCompositeOperation = "destination-out";
        }

        setIsDrawing(true);
      }
    }
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault(); // Prevent scrolling on touch devices

    if (!isDrawing) {
      return;
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const coords = getEventCoordinates(e);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = (
    e?:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (e) {
      e.preventDefault();
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
      getDataURL: () => {
        try {
          const dataURL = canvasRef.current?.toDataURL("image/png");
          console.log("Canvas data retrieved, length:", dataURL?.length || 0);
          return dataURL;
        } catch (error) {
          console.error("Error getting canvas data URL:", error);
          return undefined;
        }
      },
      setCompositeOperation: (operation: GlobalCompositeOperation) => {
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
          ctx.globalCompositeOperation = operation;
        }
      },
      forceRefresh: () => {
        // Force a redraw of the canvas
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            // Save current canvas content
            const imageData = ctx.getImageData(
              0,
              0,
              canvas.width,
              canvas.height
            );

            // Clear and redraw
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.putImageData(imageData, 0, 0);
            console.log("Canvas force refreshed");
          }
        }
      },
      loadFromDataURL: (dataURL: string) => {
        if (!dataURL || typeof dataURL !== "string") {
          console.error("Invalid dataURL:", dataURL);
          return;
        }

        if (!dataURL.startsWith("data:image/")) {
          console.error(
            "Not a valid image data URL:",
            dataURL.substring(0, 30)
          );
          return;
        }

        try {
          console.log("Loading canvas from dataURL, length:", dataURL.length);
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
              // Create a new image object
              const img = new Image();

              // Set up a promise to know when loading is complete
              const loadPromise = new Promise((resolve, reject) => {
                img.onload = () => {
                  console.log(
                    "Image loaded successfully, dimensions:",
                    img.width,
                    "x",
                    img.height
                  );

                  // Clear canvas and draw white background
                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                  ctx.fillStyle = "#ffffff";
                  ctx.fillRect(0, 0, canvas.width, canvas.height);

                  // Draw the image to fit the canvas
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                  resolve("Canvas loaded successfully");
                };

                img.onerror = (error) => {
                  console.error("Error loading image from dataURL:", error);
                  reject(error);
                };
              });

              // Set the source to trigger loading
              img.src = dataURL;

              // Return the promise (though we can't really use it with the current ref structure)
              return loadPromise;
            }
          }
        } catch (error) {
          console.error("Error in loadFromDataURL:", error);
        }
      },
    }),
    [] // Empty dependency array so this doesn't change between renders
  );

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        style={{
          ...cursorStyle,
          touchAction: "none", // Prevent default touch behaviors like zooming/scrolling
        }}
        className={`w-full h-full border shadow-sm rounded-md bg-white ${
          className || ""
        }`}
        // Mouse events
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        // Touch events for iPad/mobile
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        onTouchCancel={stopDrawing}
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
