"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface StoreContextType {
  storeName: string;
  setStoreName: (name: string) => void;
}

const StoreContext = createContext<StoreContextType>({
  storeName: "LUMIÈRE",
  setStoreName: () => {},
});

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [storeName, setStoreName] = useState("LUMIÈRE");

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("store_settings")
        .select("store_name")
        .eq("id", "main")
        .single();
      
      if (data && data.store_name) {
        setStoreName(data.store_name);
      }
    };
    fetchSettings();
  }, []);

  return (
    <StoreContext.Provider value={{ storeName, setStoreName }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStoreSettings = () => useContext(StoreContext);
