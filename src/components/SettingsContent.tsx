import React from "react";
import { useAppContext } from "@/context/AppContext";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
//import { Separator } from "@/components/ui/separator";

const SettingsContent: React.FC = () => {
  const { state, dispatch } = useAppContext();

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="compileArgs"
            className="text-sm font-medium text-[#f4f4f4]"
          >
            Compile Arguments
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-[#c6c6c6] cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Specify compilation flags and options here.</p>
                <p className="text-sm text-[#c6c6c6] mt-1">
                  Example: g++ -std=c++20 -O2 -Wall -pedantic -pthread
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Textarea
          id="compileArgs"
          value={state.compileArgs}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            dispatch({ type: "SET_COMPILE_ARGS", payload: e.target.value })
          }
          className="bg-[#393939] border-[#525252] text-[#f4f4f4] min-h-[80px]"
          placeholder="Enter compile arguments..."
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="stdin" className="text-sm font-medium text-[#f4f4f4]">
            Standard Input (stdin)
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-[#c6c6c6] cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Enter input for your program here.</p>
                <p className="text-sm text-[#c6c6c6] mt-1">
                  Use Shift+Enter for line breaks.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Textarea
          id="stdin"
          value={state.stdinInput}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            dispatch({ type: "SET_STDIN_INPUT", payload: e.target.value })
          }
          className="bg-[#393939] border-[#525252] text-[#f4f4f4] min-h-[80px]"
          placeholder="Enter standard input..."
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label
            htmlFor=" executionCmd"
            className="text-sm font-medium text-[#f4f4f4]"
          >
            Execution Command
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-[#c6c6c6] cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Specify how to run your compiled program.</p>
                <p className="text-sm text-[#c6c6c6] mt-1">
                  Example: ./a.out; echo Returned: $?
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Textarea
          id="executionCmd"
          value={state.executionCmd}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            dispatch({ type: "SET_EXECUTION_CMD", payload: e.target.value })
          }
          className="bg-[#393939] border-[#525252] text-[#f4f4f4] min-h-[80px]"
          placeholder="Enter execution command..."
        />
      </div>
    </div>
  );
};

export default SettingsContent;