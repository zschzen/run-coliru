import React from "react";
import { ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAppContext } from "@/context/AppContext";

const Output: React.FC = () => {
  const { state, dispatch } = useAppContext();

  const clearOutputHistory = (e: any) => {
    e.stopPropagation();
    e.preventDefault();

    dispatch({ type: "SET_OUTPUT", payload: "" });
    dispatch({ type: "CLEAR_OUTPUT_HISTORY", payload: [] });
  };

  return (
    <Collapsible
      open={!state.isOutputCollapsed}
      onOpenChange={(open) => dispatch({ type: "SET_IS_OUTPUT_COLLAPSED", payload: !open })}
      className="border-t border-[#393939]"
    >
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between w-full p-2 bg-[#262626] text-sm font-semibold cursor-pointer">
          <span>Output</span>
          <div className="flex items-center">
            <Button
              onClick={clearOutputHistory}
              variant="ghost"
              size="sm"
              className="mr-2 text-[#c6c6c6] hover:text-white hover:bg-[#525252]"
            >
              <Trash2 size={16} />
            </Button>
            {state.isOutputCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="bg-[#161616]">
        <div className="p-4 max-h-60 overflow-auto">
          <pre className="font-mono text-sm whitespace-pre-wrap bg-[#262626] p-2 rounded">
            {state.output || "No output yet."}
          </pre>
          <div className="mt-4">
            <h3 className="text-sm font-semibold mb-2">Output History</h3>
            <div className="space-y-2">
              {state.outputHistory.map((entry, index) => (
                <div key={index} className="bg-[#262626] p-2 rounded">
                  <div className="text-xs text-[#c6c6c6] mb-1">{entry.timestamp}</div>
                  <pre className="whitespace-pre-wrap text-xs">{entry.content}</pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default Output;