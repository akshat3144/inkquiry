import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Eraser } from "lucide-react";
import { SWATCHES } from "@/constants";

interface ToolbarProps {
  activeTool: "pen" | "eraser";
  onToolChange: (tool: "pen" | "eraser") => void;
  onClearCanvas: () => void;
  brushSize: number;
  eraserSize: number;
  onBrushSizeChange: (size: number) => void;
  onEraserSizeChange: (size: number) => void;
  color: string;
  onColorChange: (color: string) => void;
  onCalculate: () => void;
  isLoading: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  onToolChange,
  onClearCanvas,
  brushSize,
  eraserSize,
  onBrushSizeChange,
  onEraserSizeChange,
  color,
  onColorChange,
  onCalculate,
  isLoading,
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white shadow-md">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold mr-4">InkQuiry</h1>

        <div className="flex space-x-2">
          <Button
            onClick={() => onToolChange("pen")}
            variant={activeTool === "pen" ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-1"
          >
            <Pencil size={16} />
            <span>Pen</span>
          </Button>

          <Button
            onClick={() => onToolChange("eraser")}
            variant={activeTool === "eraser" ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-1"
          >
            <Eraser size={16} />
            <span>Eraser</span>
          </Button>

          <Button onClick={onClearCanvas} variant="destructive" size="sm">
            Clear Canvas
          </Button>
        </div>

        <div className="border-l border-gray-300 pl-4 ml-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {activeTool === "pen" ? "Pen size:" : "Eraser size:"}
            </span>
            <input
              type="range"
              min="1"
              max={activeTool === "pen" ? "20" : "50"}
              value={activeTool === "pen" ? brushSize : eraserSize}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (activeTool === "pen") {
                  onBrushSizeChange(value);
                } else {
                  onEraserSizeChange(value);
                }
              }}
              className="w-20"
            />
            <span className="text-sm">
              {activeTool === "pen" ? `${brushSize}px` : `${eraserSize}px`}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Color options - only show when pen is active */}
        {activeTool === "pen" && (
          <div className="flex items-center space-x-1 bg-gray-50 border rounded-lg p-1">
            {SWATCHES.map((paletteColor) => (
              <button
                key={paletteColor}
                className={`w-6 h-6 rounded-full transition-transform ${
                  color === paletteColor ? "ring-2 ring-blue-500 scale-110" : ""
                }`}
                style={{ backgroundColor: paletteColor }}
                onClick={() => onColorChange(paletteColor)}
                aria-label={`Select color ${paletteColor}`}
              />
            ))}
          </div>
        )}

        <Button
          onClick={onCalculate}
          variant="default"
          size="sm"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? "Processing..." : "Calculate"}
        </Button>
      </div>
    </div>
  );
};
