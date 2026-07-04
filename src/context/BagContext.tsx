"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";

export interface BagItem {
  id: string;
  title: string;
  slug: string;
  sku: string;
  fabric: string;
  image: string;
  quantity: number;
  notes?: string;
}

export interface BagContextType {
  items: BagItem[];
  totalCount: number;
  isDrawerOpen: boolean;
  isLoaded: boolean;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  addItem: (item: BagItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateNotes: (id: string, notes: string) => void;
  clearBag: () => void;
  toggleDrawer: () => void;
}

const BagContext = createContext<BagContextType | undefined>(undefined);

export const BagProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<BagItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load items from localStorage on mount (client-side only to avoid hydration mismatch)
  useEffect(() => {
    const savedBag = localStorage.getItem("todi_creation_bag");
    if (savedBag) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems(JSON.parse(savedBag));
      } catch (e) {
        console.error("Failed to parse bag from localStorage:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save items to localStorage when they change, but only after initial load is complete
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("todi_creation_bag", JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addItem = useCallback((newItem: BagItem) => {
    // Sanitization & coercion
    const addedQuantity = Math.floor(Number(newItem.quantity));
    if (isNaN(addedQuantity) || addedQuantity <= 0) return;

    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.id === newItem.id);
      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        const existingItem = updatedItems[existingItemIndex];
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + addedQuantity,
          notes: newItem.notes !== undefined ? newItem.notes : existingItem.notes,
        };
        return updatedItems;
      }
      return [...prevItems, { ...newItem, quantity: addedQuantity }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    const parsedQuantity = Math.floor(Number(quantity));
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: parsedQuantity } : item
      )
    );
  }, []);

  const updateNotes = useCallback((id: string, notes: string) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, notes } : item
      )
    );
  }, []);

  const clearBag = useCallback(() => {
    setItems([]);
  }, []);

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  const totalCount = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  // Memoize context value to prevent unnecessary re-renders of consuming components
  const contextValue = useMemo(() => ({
    items,
    totalCount,
    isDrawerOpen,
    isLoaded,
    setIsDrawerOpen,
    addItem,
    removeItem,
    updateQuantity,
    updateNotes,
    clearBag,
    toggleDrawer,
  }), [
    items,
    totalCount,
    isDrawerOpen,
    isLoaded,
    addItem,
    removeItem,
    updateQuantity,
    updateNotes,
    clearBag,
    toggleDrawer
  ]);

  return (
    <BagContext.Provider value={contextValue}>
      {children}
    </BagContext.Provider>
  );
};

export const useBag = () => {
  const context = useContext(BagContext);
  if (context === undefined) {
    throw new Error("useBag must be used within a BagProvider");
  }
  return context;
};
