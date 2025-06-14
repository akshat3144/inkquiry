import React from "react";
import { cn } from "@/lib/utils";

interface ResultsDisplayProps {
  results: Array<{
    expression: string;
    answer: string;
  }>;
  className?: string;
  title?: string;
  onClear?: () => void;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  results,
  className,
  title = "Results",
  onClear,
}) => {
  return (
    <div
      className={cn(
        "bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden h-full",
        className
      )}
    >
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
        <h3 className="font-medium text-gray-700">{title}</h3>
        {onClear && (
          <button
            onClick={onClear}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Clear Results
          </button>
        )}
      </div>

      <div
        className="p-3 overflow-y-auto"
        style={{ maxHeight: "calc(100% - 48px)" }}
      >
        {results.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No results to display. Draw an equation and click Calculate.
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-md p-3 border border-gray-100"
              >
                <div className="latex-content mb-1">{`\\(\\displaystyle{${result.expression}}\\)`}</div>
                <div className="text-blue-600 font-medium">{`\\(\\displaystyle{${result.answer}}\\)`}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
