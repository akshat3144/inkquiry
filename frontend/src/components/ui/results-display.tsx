import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ResultsDisplayProps {
  results: Array<{
    expression: string;
    answer: string;
  }>;
  className?: string;
  title?: string;
  onClear?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: (isCollapsed: boolean) => void;
  autoExpandOnNewResults?: boolean;
  resultsChanged?: boolean;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  results,
  className,
  title = "Results",
  onClear,
  isCollapsed: externalIsCollapsed,
  onToggleCollapse,
  autoExpandOnNewResults = true,
  resultsChanged,
}) => {
  // Use internal state if no external control is provided
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);

  // Determine if component is controlled or uncontrolled
  const isControlled = externalIsCollapsed !== undefined;
  const isCollapsed = isControlled ? externalIsCollapsed : internalIsCollapsed;

  // Handle collapse toggling
  const handleToggleCollapse = () => {
    if (isControlled && onToggleCollapse) {
      onToggleCollapse(!isCollapsed);
    } else {
      setInternalIsCollapsed(!internalIsCollapsed);
    }
  };

  // Auto-expand when new results come in
  useEffect(() => {
    if (resultsChanged && autoExpandOnNewResults && isCollapsed) {
      if (isControlled && onToggleCollapse) {
        onToggleCollapse(false);
      } else {
        setInternalIsCollapsed(false);
      }
    }
  }, [
    resultsChanged,
    autoExpandOnNewResults,
    isCollapsed,
    isControlled,
    onToggleCollapse,
  ]);

  return (
    <div
      className={cn(
        "bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden flex flex-col",
        className
      )}
    >
      <div
        className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200 cursor-pointer min-h-[48px]"
        onClick={handleToggleCollapse}
      >
        <div className="flex items-center gap-2">
          {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          <h3 className="font-medium text-gray-700">{title}</h3>
          {isCollapsed && results.length > 0 && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              {results.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isCollapsed && onClear && results.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent collapse toggle
                onClear();
              }}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear Results
            </button>
          )}
        </div>
      </div>

      <div
        className="overflow-y-auto p-3 flex-grow transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isCollapsed ? "0" : "calc(100% - 48px)",
          padding: isCollapsed ? "0 0.75rem" : "0.75rem",
          opacity: isCollapsed ? 0 : 1,
        }}
      >
        {results.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No results to display. Draw an equation and click Calculate.
          </div>
        ) : (
          <div className="space-y-3">
            {[...results].reverse().map((result, index) => {
              // Check if this is a mathematical expression or descriptive text
              const isMathExpression = /[\^=<>+\-*/\d()[\]{}]/.test(
                result.expression
              );

              return (
                <div
                  key={index}
                  className="bg-gray-50 rounded-md p-3 border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
                >
                  {isMathExpression ? (
                    // Math expression display with LaTeX
                    <>
                      <div className="latex-content mb-1">{`\\(\\displaystyle{${result.expression}}\\)`}</div>
                      <div className="text-blue-600 font-medium dark:text-blue-400">{`\\(\\displaystyle{${result.answer}}\\)`}</div>
                    </>
                  ) : (
                    // Regular text display with proper formatting
                    <>
                      <h3 className="text-gray-700 font-medium mb-2 dark:text-gray-300">
                        {result.expression}
                      </h3>
                      <div className="mt-2 text-blue-600 font-medium dark:text-blue-400">
                        {result.answer}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
