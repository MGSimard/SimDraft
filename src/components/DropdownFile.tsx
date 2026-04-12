import { useEffect, useRef, useState } from "react";
import { IconDownload } from "@/components/Icons";
import { useDraftStore } from "@/lib/store/draftStore";

export function DropdownFile() {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeImportIdRef = useRef(0);
  const activeReaderRef = useRef<FileReader | null>(null);

  const exportDraft = useDraftStore((state) => state.exportDraft);
  const importDraft = useDraftStore((state) => state.importDraft);

  useEffect(() => {
    return () => {
      if (activeReaderRef.current?.readyState === FileReader.LOADING) {
        activeReaderRef.current.abort();
      }
    };
  }, []);

  const handleExport = () => {
    try {
      const draftData = exportDraft();
      const dataStr = JSON.stringify(draftData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(dataBlob);
      link.download = `simdraft-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      console.log("Draft exported successfully");
    } catch (error) {
      console.error("Failed to export draft:", error);
      alert("Failed to export draft. Please try again.");
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    activeImportIdRef.current += 1;
    const importId = activeImportIdRef.current;

    if (activeReaderRef.current?.readyState === FileReader.LOADING) {
      activeReaderRef.current.abort();
    }

    const reader = new FileReader();
    activeReaderRef.current = reader;

    reader.onload = () => {
      if (importId !== activeImportIdRef.current) {
        return;
      }

      try {
        const rawContents = reader.result;
        if (typeof rawContents !== "string") {
          throw new Error("Imported draft must be a text-based JSON file.");
        }

        const jsonData: unknown = JSON.parse(rawContents);
        importDraft(jsonData);
        console.log("Draft imported successfully");
        alert("Draft imported successfully!");
      } catch (error) {
        console.error("Failed to import draft:", error);
        if (error instanceof Error) {
          alert(`Failed to import draft: ${error.message}`);
        } else {
          alert("Failed to import draft. Please check the file format.");
        }
      }
    };

    reader.onerror = () => {
      if (importId !== activeImportIdRef.current) {
        return;
      }

      console.error("Failed to import draft:", reader.error);
      alert("Failed to read draft file. Please try again.");
    };

    reader.readAsText(file);

    // Reset the input so the same file can be imported again.
    event.target.value = "";
  };

  const menuItems = [
    { label: "Import", action: handleImport },
    { label: "Export", action: handleExport },
  ];

  return (
    <div
      id="dropdown-container"
      ref={containerRef}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}>
      <button
        type="button"
        id="dropdown-trigger"
        aria-label="File"
        aria-expanded={isExpanded}
        aria-controls="dropdown-menu"
        onFocus={() => setIsExpanded(true)}
        onBlur={(e) => {
          if (!containerRef.current?.contains(e.relatedTarget as Node)) {
            setIsExpanded(false);
          }
        }}>
        <IconDownload aria-hidden="true" />
      </button>
      <div id="dropdown-menu" aria-labelledby="dropdown-trigger">
        <div>
          {menuItems.map((item, index) => (
            <button
              key={index}
              type="button"
              className="dropdown-item"
              tabIndex={isExpanded ? 0 : -1}
              onClick={() => {
                item.action();
                setIsExpanded(false);
              }}
              onBlur={(e) => {
                if (!containerRef.current?.contains(e.relatedTarget as Node)) {
                  setIsExpanded(false);
                }
              }}>
              <span className="dropdown-label">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.simdraft"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
}
