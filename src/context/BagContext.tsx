"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";

export interface BagItem {
  id: string;
  title: string;
  slug: string;
  price: number;
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
  setIsDrawerOpen: (isOpen: boolean) => void;
  addItem: (item: BagItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
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

  const addItem = (newItem: BagItem) => {
    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.id === newItem.id);
      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        const existingItem = updatedItems[existingItemIndex];
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + newItem.quantity,
          notes: newItem.notes !== undefined ? newItem.notes : existingItem.notes,
        };
        return updatedItems;
      }
      return [...prevItems, newItem];
    });
  };

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearBag = () => {
    setItems([]);
  };

  const toggleDrawer = () => {
    setIsDrawerOpen((prev) => !prev);
  };

  const totalCount = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  return (
    <BagContext.Provider
      value={{
        items,
        totalCount,
        isDrawerOpen,
        setIsDrawerOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearBag,
        toggleDrawer,
      }}
    >
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
