import { useState, useRef } from "react";
import { IconDownload } from "@/_components/Icons";
import { useDraftStore } from "@/_store/draftStore";

export function DropdownFile() {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportDraft = useDraftStore((state) => state.exportDraft);
  const importDraft = useDraftStore((state) => state.importDraft);

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

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
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
    reader.readAsText(file);

    // Reset the input so the same file can bbe imported again
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
        aria-label="File Menu"
        aria-haspopup="menu"
        aria-expanded={isExpanded}
        aria-controls="dropdown-menu"
        tabIndex={1}
        onFocus={() => setIsExpanded(true)}
        onBlur={(e) => {
          if (!containerRef.current?.contains(e.relatedTarget as Node)) {
            setIsExpanded(false);
          }
        }}>
        <IconDownload />
      </button>
      <div role="menu" id="dropdown-menu" aria-labelledby="dropdown-trigger">
        <div>
          {menuItems.map((item, index) => (
            <button
              key={index}
              type="button"
              role="menuitem"
              className="dropdown-item"
              tabIndex={isExpanded ? 1 : -1}
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
