"use client";

import { createContext, useContext, useEffect, useState } from "react";

const RecentlyViewedContext = createContext();

export function RecentlyViewedProvider({ children }) {
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("eleos-recently-viewed");

    if (saved) {
      setRecentlyViewed(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "eleos-recently-viewed",
      JSON.stringify(recentlyViewed)
    );
  }, [recentlyViewed]);

  function addRecentlyViewed(product) {
    setRecentlyViewed((current) => {
      const filtered = current.filter((item) => item.id !== product.id);

      return [
        {
          id: product.id,
          title: product.title,
          price: product.price,
          image_url: product.image_url,
          description: product.description,
        },
        ...filtered,
      ].slice(0, 6);
    });
  }

  return (
    <RecentlyViewedContext.Provider
      value={{
        recentlyViewed,
        addRecentlyViewed,
      }}
    >
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  return useContext(RecentlyViewedContext);
}