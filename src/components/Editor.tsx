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
    (value: string | undefined) => {
      if (value !== undefined) {
        const updatedTabs = state.tabs.map((tab) =>
          tab.id === state.activeTab ? { ...tab, content: value } : tab
        );
        dispatch({ type: "SET_TABS", payload: updatedTabs });

        /*
        // Validate the model on content change
        if (editorRef.current && monacoRef.current) {
          const model = editorRef.current.getModel();
          const markerCounts = validateModel(model, monacoRef.current);
          dispatch({ type: "SET_MARKER_COUNTS", payload: markerCounts });
        }
        */
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

  const activeTabContent = state.tabs.find((tab) => tab.id === state.activeTab)?.content || "";

  if (!isClient) {
    return loadingText();
  }

  return (
    <div className="h-full relative">
      <MonacoEditor
        height="100%"
        defaultLanguage="cpp"
        theme="vs-dark"
        value={activeTabContent}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={monacoOptions}
      />
    </div>
  );
};

export default Editor;