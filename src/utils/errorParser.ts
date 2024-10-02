import { editor } from "monaco-editor";
import { MarkerCounts } from "@/types";

interface ParsedError {
  file: string;
  line: number;
  startColumn: number;
  endColumn: number;
  message: string;
  severity: "error" | "warning";
}

export function parseColirusErrors(output: string): ParsedError[] {
  const errors: ParsedError[] = [];
  const lines = output.split('\n');
  let currentFile = "";
  let currentFunction = "";
  let pendingError: Partial<ParsedError> | null = null;

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

    const errorMatch = line.match(/^(.+):(\d+):(\d+):\s*(error|warning|fatal error):\s*(.+)$/);
    if (errorMatch) {
      if (pendingError) {
        errors.push(pendingError as ParsedError);
      }
      pendingError = {
        file: errorMatch[1],
        line: parseInt(errorMatch[2], 10),
        startColumn: parseInt(errorMatch[3], 10),
        endColumn: parseInt(errorMatch[3], 10), // Initially set to startColumn, will be updated if caret line is found
        severity: errorMatch[4] === "fatal error" ? "error" : errorMatch[4] as "error" | "warning",
        message: `${currentFunction ? `In function '${currentFunction}': ` : ''}${errorMatch[5]}`,
      };
    } else if (pendingError) {
      const caretMatch = line.match(/^\s*\^+~/);
      if (caretMatch) {
        const caretStart = line.indexOf('^');
        const caretEnd = line.lastIndexOf('^') + 1;
        pendingError.startColumn = caretStart + 1; // +1 because editor columns are 1-indexed
        pendingError.endColumn = caretEnd + 1;
        errors.push(pendingError as ParsedError);
        pendingError = null;
      }
    }
  }

  // Add any remaining pending error
  if (pendingError) {
    errors.push(pendingError as ParsedError);
  }

  return errors;
}

// The updateEditorMarkers function needs to be updated to use the new startColumn and endColumn
export function updateEditorMarkers(
  parsedErrors: ParsedError[],
  monaco: typeof import("monaco-editor"),
  model: editor.ITextModel
): MarkerCounts {
  const markerCounts: MarkerCounts = {};
  const markers: editor.IMarkerData[] = [];

  parsedErrors.forEach((error) => {
    if (error.line > 0 && error.line <= model.getLineCount()) {
      const marker: editor.IMarkerData = {
        severity:
          error.severity === "error"
            ? monaco.MarkerSeverity.Error
            : monaco.MarkerSeverity.Warning,
        startLineNumber: error.line,
        startColumn: error.startColumn,
        endLineNumber: error.line,
        endColumn: error.endColumn,
        message: error.message,
      };

      markers.push(marker);

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