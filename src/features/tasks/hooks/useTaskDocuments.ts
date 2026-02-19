"use client";

import { useState, useCallback } from "react";
import type { TaskDocument } from "@/shared/types/database";
import {
  uploadDocument,
  fetchDocumentsByTask,
  deleteDocument,
} from "@/features/tasks/services/documentService";

interface UseTaskDocumentsReturn {
  documents: TaskDocument[];
  isLoading: boolean;
  loadDocuments: (taskId: string) => Promise<void>;
  upload: (taskId: string, file: File) => Promise<TaskDocument>;
  remove: (doc: TaskDocument) => Promise<void>;
}

export function useTaskDocuments(): UseTaskDocumentsReturn {
  const [documents, setDocuments] = useState<TaskDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadDocuments = useCallback(async (taskId: string) => {
    setIsLoading(true);
    try {
      const docs = await fetchDocumentsByTask(taskId);
      setDocuments(docs);
    } catch (err) {
      console.error("[useTaskDocuments] Failed to load:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const upload = useCallback(async (taskId: string, file: File) => {
    const doc = await uploadDocument(taskId, file);
    setDocuments((prev) => [doc, ...prev]);
    return doc;
  }, []);

  const remove = useCallback(async (doc: TaskDocument) => {
    await deleteDocument(doc);
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
  }, []);

  return { documents, isLoading, loadDocuments, upload, remove };
}
