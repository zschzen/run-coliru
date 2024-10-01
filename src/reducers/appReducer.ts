import { AppState, AppAction } from "@/types";

export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "SET_TABS":
      return { ...state, tabs: action.payload };
    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload };
    case "SET_OUTPUT":
      return { ...state, output: action.payload };
    case "ADD_OUTPUT_HISTORY":
      return { ...state, outputHistory: [action.payload, ...state.outputHistory] };
    case "CLEAR_OUTPUT_HISTORY":
      return { ...state, outputHistory: [] };
    case "SET_IS_COMPILING":
      return { ...state, isCompiling: action.payload };
    case "SET_COMPILE_ARGS":
      return { ...state, compileArgs: action.payload };
    case "SET_STDIN_INPUT":
      return { ...state, stdinInput: action.payload };
      case "SET_MARKER_COUNTS":
        return { ...state, markerCounts: action.payload };
    case "SET_IS_OUTPUT_COLLAPSED":
      return { ...state, isOutputCollapsed: action.payload };
    case "SET_IS_VIM_MODE_ENABLED":
      return { ...state, isVimModeEnabled: action.payload };
    default:
      return state;
  }
};