import axios from "axios";
import { NotebookPage } from "@/components/ui/notebook-panel";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8900";

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const notebookApi = {
  // Get all pages for the current user
  getPages: async (): Promise<NotebookPage[]> => {
    try {
      console.log("Requesting pages from API...");
      const token = localStorage.getItem("token");
      console.log("Auth header:", token ? "Present" : "Missing");

      const response = await apiClient.get("/notebook/pages", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("API responded with pages:", response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch notebook pages:", error);
      throw error;
    }
  },

  // Save a new page
  savePage: async (page: NotebookPage): Promise<NotebookPage> => {
    try {
      const token = localStorage.getItem("token");
      console.log("Saving page to API:", {
        id: page.id,
        name: page.name,
        hasCanvas: !!page.canvasData || !!page.canvas_data,
        canvasDataLength:
          page.canvasData?.length || page.canvas_data?.length || 0,
        date_format: page.date_created ? typeof page.date_created : "missing",
      });

      const response = await apiClient.post("/notebook/pages", page, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("API saved page successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to save notebook page:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("Error details:", error.response.data);
      }
      throw error;
    }
  },

  // Update an existing page
  updatePage: async (
    pageId: string,
    page: NotebookPage
  ): Promise<NotebookPage> => {
    try {
      const token = localStorage.getItem("token");
      const response = await apiClient.put(`/notebook/pages/${pageId}`, page, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to update notebook page:", error);
      throw error;
    }
  },

  // Delete a page
  deletePage: async (pageId: string): Promise<void> => {
    try {
      const token = localStorage.getItem("token");
      await apiClient.delete(`/notebook/pages/${pageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Failed to delete notebook page:", error);
      throw error;
    }
  },
};
