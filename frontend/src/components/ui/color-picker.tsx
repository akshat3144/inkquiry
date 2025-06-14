import React from "react";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  colors: string[];
  selectedColor: string;
  onChange: (color: string) => void;
  className?: string;
}

export const ColorPicker = ({
  colors,
  selectedColor,
  onChange,
  className,
}: ColorPickerProps) => {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-1 p-1 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
        className
      )}
    >
      {colors.map((color) => (
        <button
          key={color}
          className={cn(
            "w-6 h-6 rounded-full transition-transform hover:scale-110",
            selectedColor === color &&
              "ring-2 ring-blue-500 dark:ring-blue-400 scale-110"
          )}
          style={{ backgroundColor: color }}
          onClick={() => onChange(color)}
          aria-label={`Select color ${color}`}
        />
      ))}
    </div>
  );
};
