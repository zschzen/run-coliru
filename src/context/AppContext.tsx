"use client";

import React, { createContext, useContext, useReducer } from "react";
import { appReducer } from "@/reducers/appReducer";
import { AppState, AppAction } from "@/types";

const initialState: AppState = {
  tabs: [
    {
      id: "main.cpp",
      content: `#include <iostream>
#include <string>
#include <vector>

template<typename T>
std::ostream& operator<<(std::ostream& os, const std::vector<T>& vec)
{
    for (auto& el : vec)
    {
        os << el << ' ';
    }
    return os;
}

int main()
{
    std::vector<std::string> vec = {
        "Hello", "from", "GCC", __VERSION__, "!" 
    };
    std::cout << vec << std::endl;
}
`
    }
  ],
  activeTab: "main.cpp",
  output: "",
  outputHistory: [],
  isCompiling: false,
  compileArgs: "g++ -std=c++20 -O2 -Wall -pedantic -pthread ${cppFiles} && ./a.out; echo Returned: $?",
  stdinInput: "",
  markerCounts: {},

  isOutputCollapsed: true,
  isVimModeEnabled: false,
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};