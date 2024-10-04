export interface Tab {
  id: string;
  content: string;
}

export interface OutputEntry {
  timestamp: string;
  content: string;
}

export interface GistFile {
  filename: string;
  content: string;
}

export interface GistResponse {
  files: {
      [key: string]: GistFile;
  };
}

export interface MarkerCounts {
  [tabId: string]: { errors: number; warnings: number };
}

export interface AppState {
  tabs: Tab[];
  activeTab: string;
  output: string;
  outputHistory: OutputEntry[];
  isCompiling: boolean;
  compileArgs: string;
  executionCmd: string;
  stdinInput: string;
  markerCounts: MarkerCounts;

  isOutputCollapsed: boolean;
  isVimModeEnabled: boolean;
}

export type AppAction =
  | { type: "SET_TABS"; payload: Tab[] }
  | { type: "SET_ACTIVE_TAB"; payload: string }
  | { type: "SET_OUTPUT"; payload: string }
  | { type: "ADD_OUTPUT_HISTORY"; payload: OutputEntry }
  | { type: "CLEAR_OUTPUT_HISTORY"; payload: [] }
  | { type: "SET_IS_COMPILING"; payload: boolean }
  | { type: "SET_COMPILE_ARGS"; payload: string }
  | { type: "SET_EXECUTION_CMD"; payload: string }
  | { type: "SET_STDIN_INPUT"; payload: string }
  | { type: "SET_MARKER_COUNTS"; payload: MarkerCounts }

  | { type: "SET_IS_OUTPUT_COLLAPSED"; payload: boolean }
  | { type: "SET_IS_VIM_MODE_ENABLED"; payload: boolean };