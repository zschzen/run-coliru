import React, { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useAppContext } from "@/context/AppContext";
import { parseColirusErrors, updateEditorMarkers, validateModel } from "@/utils/errorParser";
import { defaultOptions } from '@/utils/defaultMonacoOptions';

const loadingText = () => {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <p>Loading Editor...</p>
    </div>
  );
};

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: loadingText,
});

const Editor: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const editorRef = useRef<any>(null);
  const [isClient, setIsClient] = useState<boolean>(false);
  const monacoRef = useRef<typeof import("monaco-editor")>();
  const [monacoOptions, setMonacoOptions] = useState(defaultOptions);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleEditorChange = useCallback(
    (value: string | undefined, event: any) => {
      if (value !== undefined) {
        const updatedTabs = state.tabs.map((tab) =>
          tab.id === state.activeTab ? { ...tab, content: value } : tab
        );
        dispatch({ type: "SET_TABS", payload: updatedTabs });
      }
    },
    [state.activeTab, state.tabs, dispatch]
  );

  const handleEditorDidMount = (editor: any, monaco: typeof import("monaco-editor")) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    // Initial validation
    const model = editor.getModel();
    const markerCounts = validateModel(model, monaco);
    dispatch({ type: "SET_MARKER_COUNTS", payload: markerCounts });
  };

  useEffect(() => {
    if (editorRef.current && monacoRef.current && state.output) {
      const parsedErrors = parseColirusErrors(state.output);
      const model = editorRef.current.getModel();
      const markerCounts = updateEditorMarkers(parsedErrors, monacoRef.current, model);
      dispatch({ type: "SET_MARKER_COUNTS", payload: markerCounts });
    }
  }, [state.output, dispatch]);

  const activeTab = state.tabs.find((tab) => tab.id === state.activeTab);
  const activeTabPath = activeTab?.id || '';
  const activeTabContent = activeTab?.content || '';

  if (!isClient) {
    return loadingText();
  }

  return (
    <div className="relative w-screen h-full select-none">
      <MonacoEditor
        width="100%"
        height="100%"
        className="w-full h-full"
        defaultLanguage="cpp"
        theme="vs-dark"
        path={activeTabPath}
        defaultValue={activeTabContent}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={monacoOptions}
      />
    </div>
  );
};

export default Editor;
