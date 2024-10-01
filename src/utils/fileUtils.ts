import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Tab } from "@/types";

export const saveAsZip = (tabs: Tab[], compileArgs: string) => {
  const zip = new JSZip();
  const cppFiles: string[] = [];

  tabs.forEach((tab) => {
      zip.file(tab.id, tab.content);
      if (tab.id.endsWith('.cpp') || tab.id.endsWith('.c')) {
          cppFiles.push(tab.id);
      }
  });

  // Create Makefile content
  const makefileContent = generateMakefile(cppFiles, compileArgs);
  zip.file("Makefile", makefileContent);

  zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "coliru_project.zip");
  });
};

function generateMakefile(cppFiles: string[], compileArgs: string): string {
  const objectFiles = cppFiles.map(file => file.replace(/\.(cpp|c)$/, '.o')).join(' ');
  const compiler = cppFiles.some(file => file.endsWith('.cpp')) ? 'g++' : 'gcc';
  
  // Extract flags using regex
  const flagsMatch = compileArgs.match(/(?:g\+\+|gcc)\s+((?:-\w+(?:=\S+)?\s*)+)/);
  const flags = flagsMatch ? flagsMatch[1].trim() : '';

  return `
CC = ${compiler}
CFLAGS = ${flags}
TARGET = main

SRCS = ${cppFiles.join(' ')}
OBJS = ${objectFiles}

$(TARGET): $(OBJS)
\t$(CC) $(CFLAGS) -o $(TARGET) $(OBJS)

%.o: %.cpp
\t$(CC) $(CFLAGS) -c $< -o $@

%.o: %.c
\t$(CC) $(CFLAGS) -c $< -o $@

clean:
\trm -f $(OBJS) $(TARGET)
`.trim();
}