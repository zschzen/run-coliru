import { GistFile, GistResponse, AppState, Tab } from "@/types";

interface FileData {
    [filename: string]: string;
}

const buildCommand = (files: FileData, args: string) => {
    let fileEcho = "";
    let cppFiles = "";
    for (const [filename, content] of Object.entries(files)) {
        const escapedContent = escapeShellContent(content);
        const escapedFilename = escapeShellArg(filename);
        fileEcho += `echo ${escapedContent} > ${escapedFilename} && `;
        if (filename.endsWith(".cpp")) {
            cppFiles += `${escapedFilename} `;
        }
    }
    const finalArgs = args.replace("${cppFiles}", cppFiles);
    return { cmd: `${fileEcho}${finalArgs}` };
};

const escapeShellContent = (content: string) => {
    return `$'${content.replace(/[\\']/g, '\\$&')}'`;
};

const escapeShellArg = (arg: string) => {
    return `'${arg.replace(/'/g, "'\\''")}'`;
};

export const compileCode = async (state: AppState, dispatch: React.Dispatch<any>) => {
    dispatch({ type: "SET_IS_COMPILING", payload: true });
    dispatch({ type: "SET_IS_OUTPUT_COLLAPSED", payload: false });

    const files: FileData = {};
    state.tabs.forEach((tab) => {
        files[tab.id] = tab.content;
    });

    const payload = buildCommand(files, state.compileArgs);

    fetch("https://coliru.stacked-crooked.com/compile", {
        method: "POST",
        body: JSON.stringify(payload),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Compilation failed");
            }
            return response.text();
        })
        .then((result) => {
            dispatch({ type: "SET_OUTPUT", payload: result });

            const newEntry = {
                timestamp: new Date().toLocaleString(),
                content: result,
            };
            dispatch({ type: "ADD_OUTPUT_HISTORY", payload: newEntry });
        })
        .catch((error) => {
            const errorMessage = `Error: Failed to compile or run the code. ${error}`;
            dispatch({ type: "SET_OUTPUT", payload: errorMessage });

            const newEntry = {
                timestamp: new Date().toLocaleString(),
                content: errorMessage,
            };
            dispatch({ type: "ADD_OUTPUT_HISTORY", payload: newEntry });
        })
        .finally(() => {
            dispatch({ type: "SET_IS_COMPILING", payload: false });
        });
};

// Type guard function
function isGistResponse(data: unknown): data is GistResponse {
    return (
        typeof data === 'object' &&
        data !== null &&
        'files' in data &&
        typeof (data as GistResponse).files === 'object'
    );
}

export const loadGist = (gistId: string, dispatch: React.Dispatch<any>): Promise<{ success: boolean; message: string }> => {
    return fetch(`https://api.github.com/gists/${gistId}`)
        .then(response => {
            if (!response.ok) {
                if (response.status === 404) {
                    return Promise.reject({ success: false, message: "Gist not found. Please check the ID and try again." });
                }
                return Promise.reject({ success: false, message: `HTTP error! status: ${response.status}` });
            }
            return response.json();
        })
        .then((data: unknown) => {
            // Type guard
            if (!isGistResponse(data)) {
                return Promise.reject({ success: false, message: "Invalid response format from GitHub API." });
            }

            if (!data.files || Object.keys(data.files).length === 0) {
                return { success: false, message: "The Gist is empty or contains no files." };
            }

            const newTabs = Object.entries(data.files).map(([filename, file]) => ({
                id: filename,
                content: file.content,
            }));
            
            dispatch({ type: "SET_TABS", payload: newTabs });

            // Find the appropriate entry point file
            const entryPointFile = newTabs.find(tab => {
                const lowercaseFilename = tab.id.toLowerCase();
                return lowercaseFilename === 'main.c' || 
                       lowercaseFilename === 'main.cpp' || 
                       (lowercaseFilename.endsWith('.c') && lowercaseFilename.includes('main')) ||
                       (lowercaseFilename.endsWith('.cpp') && lowercaseFilename.includes('main'));
            });

            // Set the active tab to the entry point file if found, otherwise use the first tab
            const activeTabId = entryPointFile ? entryPointFile.id : newTabs[0].id;
            dispatch({ type: "SET_ACTIVE_TAB", payload: activeTabId });

            localStorage.setItem("tabs", JSON.stringify(newTabs));
            
            return { success: true, message: "Gist loaded successfully!" };
        })
        .catch(error => {
            console.error("Failed to load gist:", error);
            return { success: false, message: "Failed to load Gist. Please try again later." };
        });
};

export const loadLocalTabs = (dispatch: React.Dispatch<any>) => {
    const savedTabs = localStorage.getItem("tabs");
    if (savedTabs) {
        const tabs = JSON.parse(savedTabs);
        dispatch({ type: "SET_TABS", payload: tabs });
        dispatch({ type: "SET_ACTIVE_TAB", payload: tabs[0].id });
    }
};

export const saveLocalTabs = (tabs: Tab[]) => {
    localStorage.setItem("tabs", JSON.stringify(tabs));
};