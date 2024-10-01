import { editor } from "monaco-editor";
import { MarkerCounts } from "@/types";

interface ParsedError {
  file: string;
  line: number;
  column: number;
  message: string;
  severity: "error" | "warning";
}

export function parseColirusErrors(output: string): ParsedError[] {
  const errors: ParsedError[] = [];
  const lines = output.split('\n');
  let currentFile = "";
  let currentFunction = "";

  for (const line of lines) {
    const fileMatch = line.match(/^(.+):$/);
    if (fileMatch) {
      currentFile = fileMatch[1];
      continue;
    }

    const functionMatch = line.match(/^In function '(.+)':$/);
    if (functionMatch) {
      currentFunction = functionMatch[1];
      continue;
    }

    const errorMatch = line.match(/^(.+):(\d+):(\d+):\s*(error|warning):\s*(.+)$/);
    if (errorMatch) {
      errors.push({
        file: errorMatch[1],
        line: parseInt(errorMatch[2], 10),
        column: parseInt(errorMatch[3], 10),
        severity: errorMatch[4] as "error" | "warning",
        message: `${currentFunction ? `In function '${currentFunction}': ` : ''}${errorMatch[5]}`,
      });
    }
  }

  return errors;
}

export function updateEditorMarkers(
    parsedErrors: ParsedError[],
    monaco: typeof import("monaco-editor"),
    model: editor.ITextModel
  ): MarkerCounts {
    const markerCounts: MarkerCounts = {};
    const markers: editor.IMarkerData[] = [];
  
    parsedErrors.forEach((error) => {
      // Check if the line number is valid before proceeding
      if (error.line > 0 && error.line <= model.getLineCount()) {
        const marker: editor.IMarkerData = {
          severity:
            error.severity === "error"
              ? monaco.MarkerSeverity.Error
              : monaco.MarkerSeverity.Warning,
          startLineNumber: error.line,
          startColumn: error.column,
          endLineNumber: error.line,
          endColumn: model.getLineLength(error.line) + 1,
          message: error.message,
        };
  
        markers.push(marker);
  
        // Update marker counts
        if (!markerCounts[error.file]) {
          markerCounts[error.file] = { errors: 0, warnings: 0 };
        }
        if (error.severity === "error") {
          markerCounts[error.file].errors++;
        } else {
          markerCounts[error.file].warnings++;
        }
      } else {
        console.warn(`Invalid line number: ${error.line} in file ${error.file}`);
      }
    });
  
    // Set the markers only for valid errors
    monaco.editor.setModelMarkers(model, "colirus", markers);
  
    return markerCounts;
  }  

export function validateModel(
  model: editor.ITextModel,
  monaco: typeof import("monaco-editor")
): MarkerCounts {
  const markers: editor.IMarkerData[] = [];
  const markerCounts: MarkerCounts = { [model.uri.toString()]: { errors: 0, warnings: 0 } };

  for (let i = 1; i <= model.getLineCount(); i++) {
    const range = {
      startLineNumber: i,
      startColumn: 1,
      endLineNumber: i,
      endColumn: model.getLineLength(i) + 1,
    };
  }

  monaco.editor.setModelMarkers(model, "validator", markers);
  return markerCounts;
}