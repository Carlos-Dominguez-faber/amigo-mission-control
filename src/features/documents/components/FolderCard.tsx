"use client";

import { Folder, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { DocFolder } from "@/features/documents/types";

interface FolderCardProps {
  folder: DocFolder;
  onClick: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export function FolderCard({ folder, onClick, onRename, onDelete }: FolderCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [menuOpen]);

  return (
    <article
      className="group relative bg-[#16181a] border border-[#272829] rounded-lg p-3 cursor-pointer hover:border-[#7c3aed]/50 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center gap-2.5">
        <Folder className="w-8 h-8 text-[#7c3aed] shrink-0" />
        <p className="text-sm font-medium text-white truncate flex-1 min-w-0">
          {folder.name}
        </p>

        {/* Kebab menu */}
        <div ref={menuRef} className="relative shrink-0">
          <button
            type="button"
            aria-label="Folder options"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
            className="p-1 rounded-md text-[#9aa0a6] opacity-0 group-hover:opacity-100 hover:text-white hover:bg-[#272829] transition-all"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 z-20 w-32 bg-[#1e2023] border border-[#272829] rounded-lg shadow-xl py-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onRename();
                }}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-[#9aa0a6] hover:text-white hover:bg-[#272829] transition-colors"
              >
                <Pencil className="w-3 h-3" /> Rename
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onDelete();
                }}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-[#272829] transition-colors"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
