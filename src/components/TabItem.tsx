import React from "react";
import { createPortal } from "react-dom";
import { useAppContext } from "@/context/AppContext";
import { getIcon } from 'material-file-icons';
import { Tab } from "@/types";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DragOverlay } from '@dnd-kit/core';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface TabItemProps {
  tab: Tab;
  closeTab: (tabId: string) => void;
  markerCount: { errors: number; warnings: number };
}

function FileIcon({ filename, style, className }: { filename: string; style?: React.CSSProperties; className?: string }) {
  return (
    <div
      style={style}
      className={className}
      dangerouslySetInnerHTML={{ __html: getIcon(filename).svg }}
    />
  );
}

const TabItem: React.FC<TabItemProps> = ({ tab, closeTab, markerCount }) => {
  const { state, dispatch } = useAppContext();
  const isActive = state.activeTab === tab.id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleMouseDown = () => {
    dispatch({ type: "SET_ACTIVE_TAB", payload: tab.id });
  };

  const tabContent = (
    <div
      className={`relative flex items-center px-2 py-2 text-sm group ${
        isActive ? "bg-[#1e1e1e] text-[#ffffff]" : "bg-[#2d2d2d] text-[#c6c6c6]"
      }`}
    >
      {isActive && (
        <div
          className="absolute top-0 left-0 w-full h-px bg-blue-500"
          style={{ content: '""' }}
        />
      )}
      <FileIcon filename={tab.id} className="h-4 w-4 mr-2" />
      <span className="flex-grow select-none">{tab.id}</span>
      {(markerCount.errors > 0 || markerCount.warnings > 0) && (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="ml-1 px-1 space-x-1">
            {markerCount.errors > 0 && (
              <span className="text-red-500 text-xs">
                {markerCount.errors > 9 ? '9+' : markerCount.errors}
              </span>
            )}
            {markerCount.warnings > 0 && (
              <span className="text-yellow-500 text-xs">
                {markerCount.warnings > 9 ? '9+' : markerCount.warnings}
              </span>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {markerCount.errors > 0 && `${markerCount.errors > 9 ? '9+' : markerCount.errors} error${markerCount.errors !== 1 ? 's' : ''}`}
            {markerCount.errors > 0 && markerCount.warnings > 0 && ', '}
            {markerCount.warnings > 0 && `${markerCount.warnings > 9 ? '9+' : markerCount.warnings} warning${markerCount.warnings !== 1 ? 's' : ''}`}
          </p>
        </TooltipContent>
      </Tooltip>
    )}
      <button
        onMouseDown={(e) => {e.stopPropagation();e.preventDefault();}}
        onClick={(e) => {
          e.stopPropagation();
          closeTab(tab.id);
        }}
        className={`ml-2 px-1 text-[#c6c6c6] hover:text-[#ffffff] hover:bg-[#2d2d2d] ${isActive ? 'visible' : 'invisible group-hover:visible'}`}
      >
        ×
      </button>
    </div>
  );

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onMouseDown={handleMouseDown}
      >
        {tabContent}
      </div>
      {isDragging && createPortal(
        <DragOverlay>
          <div className="opacity-30 grayscale cursor-grabbing">{tabContent}</div>
        </DragOverlay>,
        document.body
      )}
    </>
  );
};

export default TabItem;