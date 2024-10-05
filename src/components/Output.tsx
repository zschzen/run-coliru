import React, { useState, useEffect, useMemo } from "react";
import { ChevronUp, ChevronDown, Trash2, Copy, Search, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAppContext } from "@/context/AppContext";
import { Badge } from "@/components/ui/badge";
import Pagination from "@/components/Pagination";

const ITEMS_PER_PAGE = 5;

interface ParsedOutput {
  content: string;
  returnCode: number | null;
}

const parseOutput = (output: string): ParsedOutput => {
  const lines = output.split('\n');
  const returnCodeRegex = /Returned:\s*(-?\d+)/;
  let returnCode: number | null = null;
  let content: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(returnCodeRegex);
    if (match) {
      returnCode = parseInt(match[1], 10);
    } else {
      content.push(lines[i]);
    }
  }

  return { content: content.join('\n'), returnCode };
};

const ExecutionStatusIndicator: React.FC<{ returnCode: number | null }> = ({ returnCode }) => {
  let color: string;
  let icon: React.ReactNode;
  let text: string;
  let tooltipText: string;

  if (returnCode === null) {
    color = "bg-[#525252] hover:bg-[#6e6e6e]";
    icon = <AlertCircle size={16} />;
    text = "No Return Code";
    tooltipText = "Add 'echo Returned: $?' to the Execution command in settings to see the return code.";
  } else if (returnCode === 0) {
    color = "bg-green-600 hover:bg-green-700";
    icon = <CheckCircle size={16} />;
    text = "Success";
    tooltipText = "The code executed successfully";
  } else {
    color = "bg-red-600 hover:bg-red-700";
    icon = <XCircle size={16} />;
    text = `Error (${returnCode})`;
    tooltipText = `The code encountered an error (Return code: ${returnCode})`;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="outline" className={`${color} text-white flex items-center gap-1 px-2 py-0.5 rounded-full transition-colors duration-200`}>
            {icon}
            <span className="text-xs">{text}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-[#333333] text-white border-[#525252] px-4 py-2 max-w-xs">
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const Output: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredHistory = useMemo(() => {
    return state.outputHistory.filter(entry =>
      entry.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [state.outputHistory, searchTerm]);

  const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const clearOutputHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch({ type: "SET_OUTPUT", payload: "" });
    dispatch({ type: "CLEAR_OUTPUT_HISTORY", payload: [] });
    setCurrentPage(1);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <Collapsible
      open={!state.isOutputCollapsed}
      onOpenChange={(open) => dispatch({ type: "SET_IS_OUTPUT_COLLAPSED", payload: !open })}
      className="border-t border-[#393939]"
    >
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between w-full p-2 bg-[#262626] text-sm cursor-pointer hover:bg-[#2f2f2f] transition-colors duration-200">
          <span>Output</span>
          <div className="flex items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={clearOutputHistory}
                    variant="ghost"
                    size="sm"
                    className="mr-2 text-[#c6c6c6] hover:text-white hover:bg-[#525252]"
                  >
                    <Trash2 size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-[#333333] text-white border-[#525252] px-4 py-2">
                  <p>Clear output history</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {state.isOutputCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="bg-[#161616]">
        <div className="p-4">
          <ScrollArea className="h-60">
            <div className="space-y-4">
              {paginatedHistory.map((entry, index) => {
                const { content, returnCode } = parseOutput(entry.content);
                return (
                  <div 
                    key={index} 
                    className="bg-[#262626] p-2 rounded border border-[#393939] hover:border-[#525252] transition-colors duration-200"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="text-xs text-[#c6c6c6]">{entry.timestamp}</div>
                        <ExecutionStatusIndicator returnCode={returnCode} />
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => copyToClipboard(content)}
                              variant="ghost"
                              size="sm"
                              className="text-[#c6c6c6] hover:text-white hover:bg-[#525252]"
                            >
                              <Copy size={12} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="bg-[#333333] text-white border-[#525252] px-4 py-2">
                            <p>Copy output to clipboard</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <pre className="whitespace-pre-wrap text-xs text-white bg-[#1e1e1e] p-2 rounded">{content}</pre>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          <div className="mt-4 grid grid-cols-3 items-center">
            <div className="relative">
              <Input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                disabled={filteredHistory.length < 1}
                placeholder="Search outputs..."
                className="pl-8 bg-[#262626] text-white border-[#393939] focus:border-[#525252] focus:ring-1 focus:ring-[#525252]"
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#c6c6c6]" size={16} />
            </div>

            <div className="text-center text-sm text-[#c6c6c6]">
              {filteredHistory.length > 0 ? `Page ${currentPage} of ${totalPages}` : 'No Outputs'}
            </div>

            <div className="justify-self-end">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default Output;
