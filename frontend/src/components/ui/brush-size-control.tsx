// import React from "react";
import { cn } from "@/lib/utils";

interface BrushSizeControlProps {
  value: number;
  onChange: (size: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export const BrushSizeControl = ({
  value,
  onChange,
  min = 1,
  max = 20,
  className,
}: BrushSizeControlProps) => {
  const sizes = [1, 2, 4, 8, 12, 16, 20];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-xs text-gray-500">Brush:</span>

      <div className="flex items-center gap-1">
        {sizes.map((size) => (
          <button
            key={size}
            className={cn(
              "rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center transition-colors",
              value === size && "bg-blue-500 dark:bg-blue-600",
              "hover:bg-gray-300 dark:hover:bg-gray-600"
            )}
            style={{
              width: `${Math.max(16, size + 10)}px`,
              height: `${Math.max(16, size + 10)}px`,
            }}
            onClick={() => onChange(size)}
            aria-label={`Set brush size to ${size}px`}
          >
            <div
              className={cn(
                "rounded-full",
                value === size
                  ? "bg-white dark:bg-gray-200"
                  : "bg-gray-700 dark:bg-gray-300"
              )}
              style={{
                width: `${size}px`,
                height: `${size}px`,
              }}
            />
          </button>
        ))}
      </div>

      <div className="flex items-center ml-2 gap-1">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-xs font-mono w-8 text-center">{value}px</span>
      </div>
    </div>
  );
};
