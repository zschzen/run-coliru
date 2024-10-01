"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppProvider, useAppContext } from "@/context/AppContext";
import Header from "@/components/Header";
import Tabs from "@/components/Tabs";
import Editor from "@/components/Editor";
import Output from "@/components/Output";
import { loadGist, loadLocalTabs } from "@/utils/api";

const GistLoader: React.FC = () => {
  const searchParams = useSearchParams();
  const { dispatch } = useAppContext();

  useEffect(() => {
    const gistId = searchParams.get("gist");
    if (gistId) {
      loadGist(gistId, dispatch);
    } else {
      loadLocalTabs(dispatch);
    }
  }, [searchParams, dispatch]);

  return null;
};

const AppContent: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-[#161616] text-[#f4f4f4]">
      <Suspense fallback={<></>}>
        <GistLoader />
      </Suspense>
      <Header />
      <main className="flex-grow flex flex-col overflow-hidden">
        <Tabs />
        <Editor />
      </main>
      <Output />
    </div>
  );
};

export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}