import React from "react";

interface VariablesDisplayProps {
  variables: Record<string, string>;
}

export const VariablesDisplay: React.FC<VariablesDisplayProps> = ({
  variables,
}) => {
  if (Object.keys(variables).length === 0) {
    return null;
  }

  return (
    <div className="fixed right-4 bottom-4 bg-white p-3 rounded-md shadow-md border border-gray-200 z-30">
      <div className="text-sm font-medium text-gray-600 mb-1">Variables:</div>
      {Object.entries(variables).map(([key, value], idx) => (
        <div key={idx} className="text-sm">
          <span className="font-mono">{key}</span> ={" "}
          <span className="text-blue-600">{String(value)}</span>
        </div>
      ))}
    </div>
  );
};
