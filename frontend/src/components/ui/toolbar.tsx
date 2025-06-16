import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Eraser, Menu, X } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-white shadow-md">
      {/* Main toolbar always visible */}
      <div className="flex items-center justify-between p-3 md:p-4 md:gap-2">
        <div className="flex items-center">
          <h1 className="text-lg md:text-xl font-bold md:mr-2">InkQuiry</h1>
          
          {/* Mobile menu toggle button - only on small screens */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </Button>
          
          {/* Desktop tools - visible on larger screens */}
          <div className="hidden md:flex items-center space-x-4">
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
        </div>

        <div className="flex items-center space-x-2 md:space-x-3">
          {/* Color options - Only show when pen is active */}
          {activeTool === "pen" && (
            <div className="hidden md:flex items-center space-x-1 bg-gray-50 border rounded-lg p-1">
              {SWATCHES.map((paletteColor) => (
                <button
                  key={paletteColor}
                  className={`w-5 h-5 md:w-6 md:h-6 rounded-full transition-transform ${
                    color === paletteColor ? "ring-2 ring-blue-500 scale-110" : ""
                  }`}
                  style={{ backgroundColor: paletteColor }}
                  onClick={() => onColorChange(paletteColor)}
                  aria-label={`Select color ${paletteColor}`}
                />
              ))}
            </div>
          )}

          {/* Analyze button - always visible */}
          <Button
            onClick={onCalculate}
            variant="default"
            size="sm"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-xs md:text-sm"
          >
            {isLoading ? "Processing..." : "Analyze"}
          </Button>
        </div>
      </div>

      {/* Mobile menu - visible only on small screens when toggled */}
      {mobileMenuOpen && (
        <div className="md:hidden py-2 px-3 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col space-y-3">
            <div className="flex justify-center space-x-2">
              <Button
                onClick={() => onToolChange("pen")}
                variant={activeTool === "pen" ? "default" : "outline"}
                size="sm"
                className="flex-1 flex items-center justify-center gap-1"
              >
                <Pencil size={16} />
                <span>Pen</span>
              </Button>

              <Button
                onClick={() => onToolChange("eraser")}
                variant={activeTool === "eraser" ? "default" : "outline"}
                size="sm"
                className="flex-1 flex items-center justify-center gap-1"
              >
                <Eraser size={16} />
                <span>Eraser</span>
              </Button>
            </div>
            
            <Button onClick={onClearCanvas} variant="destructive" size="sm" className="w-full">
              Clear Canvas
            </Button>
            
            <div className="pt-2 border-t border-gray-300">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {activeTool === "pen" ? "Pen size:" : "Eraser size:"}
                </span>
                <span className="text-sm">
                  {activeTool === "pen" ? `${brushSize}px` : `${eraserSize}px`}
                </span>
              </div>
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
                className="w-full mt-1"
              />
            </div>
            
            {/* Color options in mobile view - Only when pen is active */}
            {activeTool === "pen" && (
              <div className=" pt-2 border-t border-gray-300">
                <p className="text-sm text-gray-500 mb-2">Color:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {SWATCHES.map((paletteColor) => (
                    <button
                      key={paletteColor}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        color === paletteColor ? "ring-2 ring-blue-500 scale-110" : ""
                      }`}
                      style={{ backgroundColor: paletteColor }}
                      onClick={() => onColorChange(paletteColor)}
                      aria-label={`Select color ${paletteColor}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};