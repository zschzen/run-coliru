import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TabItem from "./TabItem";
import { Tab } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay, PointerActivationConstraint } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';

const ALLOWED_EXTENSIONS = ['.c', '.h', '.cpp', '.hpp'];
const FILE_NAME_REGEX = /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*$/;

const Tabs: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [newFileName, setNewFileName] = useState("");
  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = useState(false);
  const [isCloseFileDialogOpen, setIsCloseFileDialogOpen] = useState(false);
  const [fileToClose, setFileToClose] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 150,
    } as PointerActivationConstraint
  }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const addNewTab = () => {
    setIsNewFileDialogOpen(true);
  };

  const handleNewFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fileExtension = newFileName.substring(newFileName.lastIndexOf('.'));

    if (
      newFileName &&
      FILE_NAME_REGEX.test(newFileName) &&
      ALLOWED_EXTENSIONS.includes(fileExtension) &&
      !state.tabs.some((tab) => tab.id === newFileName)
    ) {
      const newTab: Tab = { id: newFileName, content: "" };
      const updatedTabs = [...state.tabs, newTab];
      dispatch({ type: "SET_TABS", payload: updatedTabs });
      dispatch({ type: "SET_ACTIVE_TAB", payload: newFileName });
      setNewFileName("");
      setIsNewFileDialogOpen(false);
    } else {
      toast({
        title: "Invalid file name or extension",
        description: "Allowed extensions are: .c, .h, .cpp, .hpp.",
        variant: "destructive",
      });
    }
  };

  const closeTab = (tabId: string) => {
    setFileToClose(tabId);
    setIsCloseFileDialogOpen(true);
  };

  const confirmCloseTab = () => {
    if (fileToClose && state.tabs.length > 1) {
      const newTabs = state.tabs.filter((tab) => tab.id !== fileToClose);
      dispatch({ type: "SET_TABS", payload: newTabs });
      if (state.activeTab === fileToClose) {
        dispatch({ type: "SET_ACTIVE_TAB", payload: newTabs[newTabs.length - 1].id });
      }
    }
    setIsCloseFileDialogOpen(false);
    setFileToClose(null);
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = state.tabs.findIndex((tab) => tab.id === active.id);
      const newIndex = state.tabs.findIndex((tab) => tab.id === over.id);

      const newTabs = [...state.tabs];
      const [reorderedItem] = newTabs.splice(oldIndex, 1);
      newTabs.splice(newIndex, 0, reorderedItem);

      dispatch({ type: "SET_TABS", payload: newTabs });
    }

    setActiveId(null);
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-fit bg-[#1e1e1e]">
        <div className="flex items-center bg-[#252526] overflow-x-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={state.tabs.map(tab => tab.id)} strategy={horizontalListSortingStrategy}>
              {state.tabs.map((tab) => (
                <TabItem
                  key={tab.id}
                  tab={tab}
                  closeTab={closeTab}
                  markerCount={state.markerCounts[tab.id] || { errors: 0, warnings: 0 }}
                />
              ))}
            </SortableContext>
            <DragOverlay>
              {activeId ? (
                <TabItem
                  tab={state.tabs.find(tab => tab.id === activeId)!}
                  closeTab={closeTab}
                  markerCount={state.markerCounts[activeId] || { errors: 0, warnings: 0 }}
                />
              ) : null}
            </DragOverlay>
          </DndContext>

          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="flex-shrink-0 flex items-center h-full px-3 py-1 text-[#c6c6c6] hover:bg-[#2a2d2e70] cursor-pointer"
                onClick={addNewTab}
                aria-label="New tab"
              >
                <Plus size={14} />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add File</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* New File Dialog */}
        <Dialog open={isNewFileDialogOpen} onOpenChange={setIsNewFileDialogOpen}>
          <DialogContent className="bg-[#252526] text-[#cccccc] border border-[#393939]">
            <DialogHeader>
              <DialogTitle>Create New File</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleNewFileSubmit} className="space-y-4">
              <Input
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="Enter file name (e.g., main.c)"
                className="bg-[#3c3c3c] border-[#525252] text-[#cccccc]"
              />
              <Button type="submit" className="bg-[#0e639c] hover:bg-[#1177bb] text-white">
                Create
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Close File Dialog */}
        <Dialog open={isCloseFileDialogOpen} onOpenChange={setIsCloseFileDialogOpen}>
          <DialogContent className="bg-[#252526] text-[#cccccc] border border-[#393939]">
            <DialogHeader>
              <DialogTitle>Close File</DialogTitle>
              <DialogDescription className="text-[#969696]">
                Are you sure you want to close this file? Any unsaved changes will be lost.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setIsCloseFileDialogOpen(false)} variant="secondary" className="bg-[#3c3c3c] text-[#cccccc] hover:bg-[#505050]">
                Cancel
              </Button>
              <Button onClick={confirmCloseTab} className="bg-[#0e639c] hover:bg-[#1177bb] text-white">
                Close File
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default Tabs;
