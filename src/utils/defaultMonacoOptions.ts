import * as Monaco from 'monaco-editor';

export const defaultOptions: Monaco.editor.IEditorOptions = {
  selectOnLineNumbers: true,
  roundedSelection: false,
  readOnly: false,
  automaticLayout: true,
  scrollBeyondLastLine: true, // WARN: False seems to buggy the seacrh window
  wordWrap: 'on',
  wrappingStrategy: 'advanced',
  minimap: {
    enabled: true,
    renderCharacters: false,
    side: 'right',
  },
  overviewRulerLanes: 0,
  useShadowDOM: true,
  acceptSuggestionOnCommitCharacter: true,
  acceptSuggestionOnEnter: "on",
  accessibilitySupport: "auto",
  autoIndent: "advanced",
  codeLens: true,
  colorDecorators: true,
  contextmenu: true,
  cursorBlinking: "blink",
  cursorSmoothCaretAnimation: "on",
//  cursorStyle: "line",
  disableLayerHinting: false,
  disableMonospaceOptimizations: false,
  dragAndDrop: false,
  fixedOverflowWidgets: false,
  folding: true,
  foldingStrategy: "auto",
  fontLigatures: false,
  formatOnPaste: false,
  formatOnType: false,
  hideCursorInOverviewRuler: false,
  links: true,
  mouseWheelZoom: false,
  multiCursorMergeOverlapping: true,
  multiCursorModifier: "alt",
  overviewRulerBorder: true,
  quickSuggestions: true,
  quickSuggestionsDelay: 100,
  renderControlCharacters: false,
  renderFinalNewline: "on",
  renderLineHighlight: "all",
  renderWhitespace: "none",
  revealHorizontalRightPadding: 30,
  rulers: [],
  scrollBeyondLastColumn: 5,
  selectionClipboard: true,
  selectionHighlight: true,
  showFoldingControls: "mouseover",
  smoothScrolling: false,
  suggestOnTriggerCharacters: true,
  wordSeparators: "~!@#$%^&*()-=+[{]}|;:'\",.<>/?",
  wordWrapBreakAfterCharacters: "\t})]?|&,;",
  wordWrapBreakBeforeCharacters: "{([+",
  wordWrapColumn: 80,
  "wrappingIndent": "none",
};
