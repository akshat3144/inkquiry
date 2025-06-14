import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { NotebookPanel, NotebookPage } from "@/components/ui/notebook-panel";
import { ResultsDisplay } from "@/components/ui/results-display";
import { Toolbar } from "@/components/ui/toolbar";
import {
  DrawingCanvas,
  DrawingCanvasRef,
} from "@/components/ui/drawing-canvas";
import { VariablesDisplay } from "@/components/ui/variables-display";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

interface GeneratedResult {
  expression: string;
  answer: string;
}

interface Response {
  expr: string;
  result: string;
  assign: boolean;
}

type Tool = "pen" | "eraser";

export default function Home() {
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(4);
  const [eraserSize, setEraserSize] = useState(20);
  const [activeTool, setActiveTool] = useState<Tool>("pen");
  const [dictOfVars, setDictOfVars] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentResults, setCurrentResults] = useState<Array<GeneratedResult>>(
    []
  );

  // Notebook state
  const [isNotebookOpen, setIsNotebookOpen] = useState(true);
  const [pages, setPages] = useState<NotebookPage[]>([
    {
      id: "default-page",
      name: "Page 1",
      dateCreated: new Date(),
      content: [],
    },
  ]);
  const [activePage, setActivePage] = useState<string>("default-page");
  const [currentPageResults, setCurrentPageResults] = useState<
    Array<GeneratedResult>
  >([]);

  // Initialize on mount
  useEffect(() => {
    // Always make sure we have a page selected
    if (pages.length > 0 && !activePage) {
      setActivePage(pages[0].id);
    }
  }, [pages, activePage]);

  // Load MathJax
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML";
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.MathJax.Hub.Config({
        tex2jax: {
          inlineMath: [
            ["$", "$"],
            ["\\(", "\\)"],
          ],
        },
      });
    };

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Update MathJax rendering when results change
  useEffect(() => {
    if (
      window.MathJax &&
      (currentResults.length > 0 || currentPageResults.length > 0)
    ) {
      setTimeout(() => {
        window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub]);
      }, 100);
    }
  }, [currentResults, currentPageResults]);

  // Update active page content when results change
  useEffect(() => {
    if (activePage && currentResults.length > 0) {
      setPages((prevPages) =>
        prevPages.map((page) =>
          page.id === activePage
            ? {
                ...page,
                content: [...(page.content || []), ...currentResults],
              }
            : page
        )
      );

      setCurrentPageResults((prevResults) => [
        ...prevResults,
        ...currentResults,
      ]);
      setCurrentResults([]);
    }
  }, [currentResults, activePage]);

  const resetCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.resetCanvas();
    }
  };

  const switchTool = (tool: Tool) => {
    setActiveTool(tool);
  };

  const runRoute = async () => {
    if (canvasRef.current && activePage) {
      setIsLoading(true);
      try {
        // Make sure we're using default composite operation for sending image
        canvasRef.current.setCompositeOperation("source-over");

        const imageData = canvasRef.current.getDataURL();
        if (!imageData) return;

        const response = await axios({
          method: "post",
          url: `${import.meta.env.VITE_API_URL}/calculate`,
          data: {
            image: imageData,
            dict_of_vars: dictOfVars,
          },
        });

        const resp = await response.data;
        console.log("Response", resp);

        // Process variable assignments
        resp.data.forEach((data: Response) => {
          if (data.assign === true) {
            setDictOfVars((prev) => ({
              ...prev,
              [data.expr]: data.result,
            }));
          }
        });

        // Process results
        const newResults: GeneratedResult[] = resp.data.map(
          (data: Response) => ({
            expression: data.expr,
            answer: data.result,
          })
        );

        setCurrentResults(newResults);
      } catch (error) {
        console.error("Error processing image:", error);
      } finally {
        setIsLoading(false);

        // Restore active tool composite operation
        if (canvasRef.current && activeTool === "eraser") {
          canvasRef.current.setCompositeOperation("destination-out");
        }
      }
    }
  };

  // Notebook page management
  const addPage = () => {
    const newPage = {
      id: uuidv4(),
      name: `Page ${pages.length + 1}`,
      dateCreated: new Date(),
      content: [],
    };

    setPages([...pages, newPage]);
    setActivePage(newPage.id);
    setCurrentPageResults([]);
  };

  const selectPage = (id: string) => {
    setActivePage(id);
    const page = pages.find((p) => p.id === id);
    setCurrentPageResults(page?.content || []);
  };

  const renamePage = (id: string, name: string) => {
    setPages(pages.map((page) => (page.id === id ? { ...page, name } : page)));
  };

  const deletePage = (id: string) => {
    // Don't delete if it's the only page
    if (pages.length <= 1) return;

    const newPages = pages.filter((page) => page.id !== id);
    setPages(newPages);

    // If we deleted the active page, select another one
    if (activePage === id) {
      setActivePage(newPages[0].id);
      setCurrentPageResults(newPages[0].content || []);
    }
  };

  const toggleNotebook = () => {
    setIsNotebookOpen(!isNotebookOpen);
  };

  const clearResults = () => {
    if (activePage) {
      setCurrentPageResults([]);
      setPages((prevPages) =>
        prevPages.map((page) =>
          page.id === activePage ? { ...page, content: [] } : page
        )
      );
    }
  };

  return (
    <div className="relative w-full h-screen bg-white overflow-hidden">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-20">
        <Toolbar
          activeTool={activeTool}
          onToolChange={switchTool}
          onClearCanvas={resetCanvas}
          brushSize={brushSize}
          eraserSize={eraserSize}
          onBrushSizeChange={setBrushSize}
          onEraserSizeChange={setEraserSize}
          color={color}
          onColorChange={setColor}
          onCalculate={runRoute}
          isLoading={isLoading}
        />
      </div>

      {/* Main layout */}
      <div className="fixed top-16 bottom-0 left-0 right-0 flex">
        {/* Notebook panel */}
        <NotebookPanel
          isOpen={isNotebookOpen}
          pages={pages}
          activePage={activePage}
          onAddPage={addPage}
          onSelectPage={selectPage}
          onRenamePage={renamePage}
          onDeletePage={deletePage}
          onToggle={toggleNotebook}
        />

        {/* Main content area */}
        <div
          className="flex flex-col"
          style={{
            width: isNotebookOpen ? "calc(100% - 300px)" : "100%",
            marginLeft: isNotebookOpen ? "0" : "0",
            transition: "width 0.3s ease-in-out, margin-left 0.3s ease-in-out",
          }}
        >
          {/* Drawing canvas */}
          <div
            className="flex-1 p-4 relative"
            style={{ height: "calc(70% - 1rem)" }}
          >
            <DrawingCanvas
              ref={canvasRef}
              activeTool={activeTool}
              brushSize={brushSize}
              eraserSize={eraserSize}
              color={color}
            />
          </div>

          {/* Results area */}
          <div className="p-4" style={{ height: "calc(30%)" }}>
            <ResultsDisplay
              results={currentPageResults}
              title={`Results - ${
                pages.find((p) => p.id === activePage)?.name || "Current Page"
              }`}
              onClear={clearResults}
              className="h-full overflow-auto"
            />
          </div>
        </div>
      </div>

      {/* Variables display */}
      <VariablesDisplay variables={dictOfVars} />

      {/* Loading overlay */}
      <LoadingOverlay isLoading={isLoading} />
    </div>
  );
}
