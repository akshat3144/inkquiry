import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/context/AuthContext";
import { notebookApi } from "@/services/notebookApi";
import { NotebookPanel, NotebookPage } from "@/components/ui/notebook-panel";
import { ResultsDisplay } from "@/components/ui/results-display";
import { Toolbar } from "@/components/ui/toolbar";
import {
  DrawingCanvas,
  DrawingCanvasRef,
} from "@/components/ui/drawing-canvas";
import { VariablesDisplay } from "@/components/ui/variables-display";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { Button } from "@/components/ui/button";

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
  const [isSaving, setIsSaving] = useState(false);
  const [currentResults, setCurrentResults] = useState<Array<GeneratedResult>>(
    []
  );

  // Auth context
  const { user, logout } = useAuth();

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
  const [savedPages, setSavedPages] = useState<string[]>([]);

  // Results panel state
  const [isResultsCollapsed, setIsResultsCollapsed] = useState(false);
  const [resultsChanged, setResultsChanged] = useState(false);

  // Effect for initializing active page
  useEffect(() => {
    if (pages.length > 0 && !activePage) {
      setActivePage(pages[0].id);
    }
  }, [pages, activePage]);
  // Effect to load saved pages from MongoDB when component mounts
  useEffect(() => {
    if (user) {
      loadSavedPages();
    }
    // We intentionally omit loadSavedPages from dependencies to avoid an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Function to load saved pages from MongoDB
  const loadSavedPages = async () => {
    try {
      setIsLoading(true);
      console.log("Loading saved pages from server...");
      const savedPages = await notebookApi.getPages();
      console.log("Received pages from server:", savedPages.length);

      if (savedPages && savedPages.length > 0) {
        // Process each page to ensure it has the right format
        const processedPages = savedPages.map((page) => {
          // Extract canvas data - handle both field name conventions
          const rawCanvasData = page.canvas_data || page.canvasData;
          // Verify canvas data
          const validCanvasData =
            rawCanvasData &&
            verifyCanvasData(`Page ${page.id} load`, rawCanvasData)
              ? rawCanvasData
              : undefined;

          // Return properly formatted page
          return {
            ...page,
            id: page.id,
            name: page.name || `Page ${page.id.substring(0, 4)}`,
            dateCreated: new Date(page.date_created || page.dateCreated),
            content: page.content || [],
            canvasData: validCanvasData,
          };
        });

        console.log(
          "Processed pages:",
          processedPages.map((p) => ({ id: p.id, hasCanvas: !!p.canvasData }))
        );

        // Replace current pages with saved ones
        setPages(processedPages);

        // Set the first saved page as active
        const firstPage = processedPages[0];
        setActivePage(firstPage.id);
        setCurrentPageResults(firstPage.content || []);

        // Mark all pages as saved
        setSavedPages(processedPages.map((page) => page.id));

        // If the first page has canvas data, load it after a delay
        if (firstPage.canvasData && canvasRef.current) {
          // Make sure canvas is properly initialized
          console.log("Will load canvas data for first page shortly...");

          // More generous timeout to ensure canvas is fully initialized
          setTimeout(() => {
            try {
              console.log("Loading canvas data for first page now");
              canvasRef.current?.resetCanvas(); // Make sure canvas is clean
              canvasRef.current?.loadFromDataURL(firstPage.canvasData!);
            } catch (error) {
              console.error("Failed to load canvas data:", error);
            }
          }, 500); // Longer timeout for better reliability
        } else {
          console.log("No canvas data for first page or canvas ref not ready");
        }
      }
    } catch (error) {
      console.error("Error loading saved pages:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

      // Set this flag to true when results change
      setResultsChanged(true);

      // Reset flag after a delay
      const timer = setTimeout(() => {
        setResultsChanged(false);
      }, 500);

      setCurrentResults([]);

      return () => clearTimeout(timer);
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

      // Store current composite operation to restore it later
      const isEraser = activeTool === "eraser";

      try {
        // Temporarily save the current composite operation but don't change the canvas visually
        // We're just getting the data URL which doesn't modify the canvas content
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

        // Force a refresh of the canvas to ensure it looks the same as before
        if (canvasRef.current) {
          canvasRef.current.forceRefresh();

          // Make sure eraser is still in eraser mode if that was the active tool
          if (isEraser) {
            canvasRef.current.setCompositeOperation("destination-out");
          }
        }
      }
    }
  };
  // Notebook page management
  const addPage = () => {
    // Don't add more pages if we've reached the maximum
    if (pages.length >= 10) {
      alert("Maximum of 10 pages allowed");
      return;
    }

    // Save current page's canvas and results before creating a new one
    if (activePage && canvasRef.current) {
      const currentCanvasData = canvasRef.current.getDataURL();

      // Create a new page
      const newPage = {
        id: uuidv4(),
        name: `Page ${pages.length + 1}`,
        dateCreated: new Date(),
        content: [],
      };

      // Update pages with both the saved current page and the new page
      setPages((prevPages) => [
        ...prevPages.map((page) =>
          page.id === activePage
            ? {
                ...page,
                content: currentPageResults,
                canvasData: currentCanvasData,
              }
            : page
        ),
        newPage,
      ]);

      // Set active page and clear results
      setActivePage(newPage.id);
      setCurrentPageResults([]);

      // Clear the canvas for the new page
      if (canvasRef.current) {
        canvasRef.current.resetCanvas();
      }
    }
  };

  const selectPage = (id: string) => {
    // Save current page's canvas and results before switching
    if (activePage && canvasRef.current) {
      const currentCanvasData = canvasRef.current.getDataURL();

      setPages((prevPages) =>
        prevPages.map((page) =>
          page.id === activePage
            ? {
                ...page,
                content: currentPageResults,
                canvasData: currentCanvasData,
              }
            : page
        )
      );
    }

    // Set the new active page
    setActivePage(id);

    // Find the page we're switching to
    const page = pages.find((p) => p.id === id);

    // Update the results display
    setCurrentPageResults(page?.content || []); // Clear canvas and restore the page's canvas data if it exists
    if (canvasRef.current) {
      // Reset canvas first
      canvasRef.current.resetCanvas();

      // Check for canvas data in either field format
      const canvasData = page?.canvas_data || page?.canvasData;

      // Verify the canvas data is valid
      const isValid = verifyCanvasData(`Select Page ${id}`, canvasData);

      if (isValid && canvasData) {
        console.log(`Loading canvas for page ${id}...`);

        // Use a longer timeout to ensure canvas is ready
        setTimeout(() => {
          try {
            if (!canvasRef.current) {
              console.error("Canvas ref lost during timeout");
              return;
            }

            // Double-check canvas is reset
            canvasRef.current.resetCanvas();

            // Load the canvas data
            console.log(`Now loading canvas data for page ${id}`);
            canvasRef.current.loadFromDataURL(canvasData); // Force a refresh of the canvas display
            if (canvasRef.current && "forceRefresh" in canvasRef.current) {
              canvasRef.current.forceRefresh();
            }
          } catch (error) {
            console.error("Error loading canvas data for page:", id, error);
          }
        }, 300); // Longer delay to ensure canvas is reset first
      } else {
        console.log(`Page ${id} has no valid canvas data to load`);
      }
    } else {
      console.error("Cannot load canvas data - canvas ref is null");
    }
  };

  const renamePage = (id: string, name: string) => {
    setPages(pages.map((page) => (page.id === id ? { ...page, name } : page)));
  };
  const deletePage = async (id: string) => {
    // Don't delete if it's the only page
    if (pages.length <= 1) return;

    try {
      // If the page was saved to MongoDB, delete it there too
      if (savedPages.includes(id)) {
        await notebookApi.deletePage(id);
        setSavedPages((prev) => prev.filter((pageId) => pageId !== id));
      }

      const newPages = pages.filter((page) => page.id !== id);
      setPages(newPages);

      // If we deleted the active page, select another one
      if (activePage === id) {
        setActivePage(newPages[0].id);
        setCurrentPageResults(newPages[0].content || []);

        // If the next page has canvas data, load it
        const nextPage = newPages[0];
        if (nextPage?.canvasData && canvasRef.current) {
          setTimeout(() => {
            canvasRef.current?.loadFromDataURL(nextPage.canvasData!);
          }, 50);
        } else if (canvasRef.current) {
          // Clear canvas if no data
          canvasRef.current.resetCanvas();
        }
      }
    } catch (error) {
      console.error("Error deleting page:", error);
      alert("Failed to delete page. Please try again.");
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

  // Function to save the current page to MongoDB
  const savePage = async () => {
    if (!activePage) return;

    try {
      setIsSaving(true); // Find the current active page
      const currentPage = pages.find((page) => page.id === activePage);
      if (!currentPage) return;

      // Get the current canvas data - this captures the current drawing
      let canvasData;

      try {
        // Get fresh canvas data from the canvas
        if (canvasRef.current) {
          canvasData = canvasRef.current.getDataURL();
          console.log("Got fresh canvas data from canvas");
        } else {
          // Fall back to stored data
          canvasData = currentPage.canvasData;
          console.log("Using stored canvas data");
        }
      } catch (error) {
        console.error("Error getting canvas data:", error);
        canvasData = currentPage.canvasData; // Fallback
      }

      // Verify the canvas data is valid
      const isValid = verifyCanvasData("Save", canvasData);
      if (!isValid) {
        console.error("Invalid canvas data, cannot save drawing");
        alert("Could not save your drawing. Please try again.");
        setIsSaving(false);
        return;
      }
      // Prepare the page data for saving
      const pageToSave = {
        id: currentPage.id,
        name: currentPage.name,
        canvas_data: canvasData, // Snake case for backend
        canvasData: canvasData, // Camel case for frontend
        content: currentPageResults || [],
        // Ensure date is in ISO string format
        date_created: (currentPage.dateCreated instanceof Date ? currentPage.dateCreated : new Date()).toISOString(),
        dateCreated: (currentPage.dateCreated instanceof Date ? currentPage.dateCreated : new Date()).toISOString(),
      };

      // Check if this page has been saved before
      if (savedPages.includes(activePage)) {
        // Update existing page
        await notebookApi.updatePage(activePage, pageToSave);
      } else {
        // Save new page
        await notebookApi.savePage(pageToSave);
        setSavedPages((prev) => [...prev, activePage]);
      }

      alert("Page saved successfully!");
    } catch (error) {
      console.error("Error saving page:", error);
      alert("Failed to save page. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Function to handle user logout
  const handleLogout = () => {
    logout();
  };

  // Debug function to verify canvas data saving and loading
  const verifyCanvasData = (action: string, data?: string) => {
    if (!data) {
      console.warn(`[Canvas Debug - ${action}] No canvas data available`);
      return false;
    }

    const isValidData = data.startsWith("data:image/");

    console.log(`[Canvas Debug - ${action}]`, {
      valid: isValidData,
      length: data.length,
      start: data.substring(0, 50) + "...",
      end: "..." + data.substring(data.length - 20),
    });

    return isValidData;
  };
  // Special effect to ensure canvas is loaded after everything is initialized
  useEffect(() => {
    if (pages.length > 0 && activePage && canvasRef.current) {
      // Find the active page
      const currentPage = pages.find((page) => page.id === activePage);
      if (currentPage?.canvasData) {
        // Wait a bit longer to ensure canvas is fully initialized
        const timer = setTimeout(() => {
          console.log(
            "Delayed canvas loading - ensuring initialization is complete"
          );
          try {
            canvasRef.current?.resetCanvas();
            canvasRef.current?.loadFromDataURL(currentPage.canvasData!);
            console.log("Canvas data loaded with delay");
          } catch (error) {
            console.error("Error in delayed canvas loading:", error);
          }
        }, 1000); // Longer timeout for initialization

        return () => clearTimeout(timer);
      }
    }
  }, [pages, activePage]); // We intentionally omit canvasRef.current from deps as it's a mutable ref
  // eslint-disable-next-line react-hooks/exhaustive-deps

  return (
    <div className="relative w-full h-screen bg-white overflow-hidden">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-20">
        <div className="flex flex-row items-center justify-between">
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

          {/* Save and Logout Buttons */}
          <div className="flex items-center gap-2 mr-4">
            <Button
              onClick={savePage}
              disabled={isSaving || isLoading}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              {isSaving ? "Saving..." : "Save Page"}
            </Button>

            <Button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Sign Out
            </Button>
          </div>
        </div>
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
          {/* Drawing canvas area - grows when results are collapsed */}
          <div
            className="flex-1 transition-all duration-300 ease-in-out p-4 relative"
            style={{
              height: isResultsCollapsed ? "calc(100% - 60px)" : "70%",
            }}
          >
            <DrawingCanvas
              ref={canvasRef}
              activeTool={activeTool}
              brushSize={brushSize}
              eraserSize={eraserSize}
              color={color}
            />
          </div>

          {/* Results area - only header is visible when collapsed */}
          <div
            className="transition-all duration-300 ease-in-out p-4"
            style={{
              height: isResultsCollapsed ? "60px" : "30%",
              padding: "1rem",
            }}
          >
            <ResultsDisplay
              results={currentPageResults}
              title={`Results - ${
                pages.find((p) => p.id === activePage)?.name || "Current Page"
              }`}
              onClear={clearResults}
              className="h-full"
              isCollapsed={isResultsCollapsed}
              onToggleCollapse={setIsResultsCollapsed}
              autoExpandOnNewResults={true}
              resultsChanged={resultsChanged}
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
