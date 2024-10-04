import React, { useState } from "react";
import { Loader2, Play, Download, Settings, FileInput, HelpCircle, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/context/AppContext";
import { compileCode, loadGist } from "@/utils/api";
import { saveAsZip } from "@/utils/fileUtils";
import SettingsContent from "./SettingsContent";

const Header: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { toast } = useToast();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGistDialogOpen, setIsGistDialogOpen] = useState(false);
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [gistInput, setGistInput] = useState("");

  const validateGistInput = (input: string): string | null => {
    const gistIdRegex = /^[a-f0-9]{32}$/i;
    const gistUrlRegex = /^(https?:\/\/)?(gist\.github\.com\/([a-zA-Z0-9-]+\/)?[a-f0-9]{32})$/i;

    if (gistIdRegex.test(input)) {
      return input;
    } else if (gistUrlRegex.test(input)) {
      return input.split('/').pop() || null;
    }

    return null;
  };

  const handleLoadGist = () => {
    const validGistId = validateGistInput(gistInput);

    if (validGistId) {
      loadGist(validGistId, dispatch);
      setIsGistDialogOpen(false);
      setGistInput("");
      toast({
        title: "Gist Loaded",
        description: "The Gist has been successfully loaded.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Invalid Gist",
        description: "Please enter a valid Gist ID or URL.",
      });
    }
  };

  const MobileMenuContent = () => (
    <div className="flex flex-col space-y-4">
      <Button onClick={() => saveAsZip(state.tabs, state.compileArgs)} variant="default" className="w-full justify-start">
        <Download className="mr-2 h-4 w-4" /> Save as ZIP
      </Button>
      <Button onClick={() => setIsGistDialogOpen(true)} variant="default" className="w-full justify-start">
        <FileInput className="mr-2 h-4 w-4" /> Load Gist
      </Button>
      <Button onClick={() => setIsSettingsOpen(true)} variant="default" className="w-full justify-start">
        <Settings className="mr-2 h-4 w-4" /> Settings
      </Button>
    </div>
  );

  return (
    <TooltipProvider>
      <header className="flex justify-between items-center p-2 bg-[#262626] border-b border-[#393939]">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold hidden sm:inline">
            Run, 
            <a className="underline decoration-wavy hover:decoration-pink-500" href="http://coliru.stacked-crooked.com" target="_blank" rel="noopener noreferrer">
              Coliru
            </a>!
          </h1>
          <h1 className="text-xl font-semibold sm:hidden">Run, Coliru!</h1>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={() => setIsHelpDialogOpen(true)} 
                size="sm" 
                variant="ghost" 
                className="bg-[#262626] border-[#393939] hover:bg-[#393939] text-[#c6c6c6]"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Help & Information</p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        <div className="flex gap-2 items-center">
          <Button
            onClick={() => compileCode(state, dispatch)}
            disabled={state.isCompiling}
            size="sm"
            className="bg-[#0f62fe] hover:bg-[#0353e9] text-white"
          >
            {state.isCompiling ? (
              <>
                <Loader2 className="sm:mr-2 h-4 w-4 animate-spin" /> 
                <span className="hidden sm:inline">Compiling...</span>
              </>
            ) : (
              <>
                <Play className="sm:mr-2 h-4 w-4" /> 
                <span className="hidden sm:inline">Compile & Run</span>
              </>
            )}
          </Button>

          <div className="hidden md:flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                 <Button onClick={() => saveAsZip(state.tabs, state.compileArgs)} size="sm" variant="outline" className="bg-[#262626] border-[#393939] hover:bg-[#393939] text-[#c6c6c6] hover:text-white">
                  <Download className="mr-2 h-4 w-4" /> Save as ZIP
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download all files as ZIP</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                  <Button onClick={() => setIsGistDialogOpen(true)} size="sm" variant="outline" className="bg-[#262626] border-[#393939] hover:bg-[#393939] text-[#c6c6c6] hover:text-white">
                  <FileInput className="mr-2 h-4 w-4" /> Load Gist
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Load a Gist by URL or ID</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="md:hidden bg-[#262626] border-[#393939] hover:bg-[#393939]">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px] bg-[#262626] text-[#f4f4f4] border-l border-[#393939]">
              <SheetHeader>
                <SheetTitle className="text-[#f4f4f4]">Menu</SheetTitle>
              </SheetHeader>
              <MobileMenuContent />
            </SheetContent>
          </Sheet>

          <div className="hidden md:block">
            <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-[#262626] border-[#393939] hover:bg-[#393939] text-[#c6c6c6] hover:text-white">
                  <Settings className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-[#262626] text-[#f4f4f4] border-l border-[#393939]">
                <SheetHeader>
                  <SheetTitle className="text-[#f4f4f4]">Settings</SheetTitle>
                  <SheetDescription className="text-[#c6c6c6]">
                    Configure compiler settings and input
                  </SheetDescription>
                </SheetHeader>
                <SettingsContent />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <Dialog open={isHelpDialogOpen} onOpenChange={setIsHelpDialogOpen}>
        <DialogContent className="bg-[#262626] text-[#f4f4f4] border border-[#393939]">
          <DialogHeader>
            <DialogTitle>Help & Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Welcome to the Run, Coliru! app. Here you can compile and run C++ code online using Coliru&apos;s services.</p>
            <p>To start, simply write your code in the editor, and click on the &quot;<i>Compile & Run</i>&quot; button.</p>
            <p>If you encounter any issues, feel free to reach out for support.</p>
            <p className="text-yellow-400 font-semibold">Please use Coliru&apos;s services responsibly and do not abuse the APIs. Excessive use may impact others.</p>
          </div>
          <div className="border-t border-[#393939] my-4" />
          <p className="text-center text-sm text-[#c6c6c6]">Made by <a href="https://leandro.peres.dev" target="_blank" rel="noopener noreferrer" className="hover:underline">Leandro Peres</a> aka <i>zschzen</i></p>
          <p className="text-center text-sm text-[#c6c6c6]">
            Visit <a href="http://coliru.stacked-crooked.com" target="_blank" rel="noopener noreferrer" className="text-[#0f62fe] hover:underline">Coliru</a> for more information.
          </p>
        </DialogContent>
      </Dialog>

      <Dialog open={isGistDialogOpen} onOpenChange={setIsGistDialogOpen}>
        <DialogContent className="bg-[#262626] text-[#f4f4f4] border border-[#393939]">
          <DialogHeader>
            <DialogTitle>Load Gist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <label htmlFor="gistInput" className="text-sm font-semibold mb-1 block text-[#f4f4f4]">
              Enter Gist URL or ID
            </label>
            <textarea
              id="gistInput"
              value={gistInput}
              onChange={(e) => setGistInput(e.target.value)}
              className="w-full bg-[#393939] border-[#525252] text-[#f4f4f4] rounded-md p-2"
              rows={3}
            />
            <Button onClick={handleLoadGist} className="w-full bg-[#0f62fe] hover:bg-[#0353e9] text-white">
              Load Gist
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default Header;