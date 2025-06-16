import React from "react";
import { Button } from "@/components/ui/button";

export interface NotebookPage {
  id: string;
  name: string;
  dateCreated: Date | string; // Allow both Date object and ISO string
  date_created?: string; // For API communication
  content?: Array<{
    expression: string;
    answer: string;
  }>;
  canvasData?: string; // Used to store the canvas image data
  canvas_data?: string; // For API communication
}

interface NotebookPanelProps {
  isOpen: boolean;
  pages: NotebookPage[];
  activePage: string | null;
  onAddPage: () => void;
  onSelectPage: (id: string) => void;
  onRenamePage: (id: string, name: string) => void;
  onDeletePage: (id: string) => void;
  onToggle: () => void;
  maxPages?: number; // Optional with default of 5
}

export const NotebookPanel: React.FC<NotebookPanelProps> = ({
  isOpen,
  pages,
  activePage,
  onAddPage,
  onSelectPage,
  onRenamePage,
  onDeletePage,
  onToggle,
}) => {
  return (
    <>
      <div
        className={`h-full bg-white shadow-lg border-r border-gray-200 transition-all duration-300 ease-in-out overflow-hidden`}
        style={{
          width: isOpen ? "300px" : "0px",
          opacity: isOpen ? 1 : 0,
        }}
      >
        {isOpen && (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Notebook</h3>
              <Button variant="ghost" size="sm" onClick={onAddPage}>
                Add Page
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              <ul className="space-y-1">
                {pages.map((page) => (
                  <li
                    key={page.id}
                    className={`rounded-md transition-colors ${
                      activePage === page.id
                        ? "bg-blue-50"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center p-2">
                      <button
                        onClick={() => onSelectPage(page.id)}
                        className="flex-1 text-left truncate py-1 text-sm font-medium"
                      >
                        {page.name}
                      </button>

                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newName = prompt(
                              "Enter new page name:",
                              page.name
                            );
                            if (newName) onRenamePage(page.id, newName);
                          }}
                          className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                        >
                          ✏️
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeletePage(page.id)}
                          className="h-6 w-6 p-0 opacity-50 hover:opacity-100 text-red-500"
                          disabled={pages.length <= 1}
                        >
                          🗑️
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute top-1/2 z-10 transform -translate-y-1/2 h-20 w-10 bg-white border border-gray-300 rounded-r-md flex items-center justify-center shadow-md hover:bg-gray-50"
        style={{
          left: isOpen ? "300px" : "0",
          transition: "left 0.3s ease-in-out",
        }}
      >
        {isOpen ? "←" : "→"}
      </button>
    </>
  );
};
