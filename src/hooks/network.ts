import { useCallback, useEffect, useState } from "react";

export const useNetworkState = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [reConnected, setReConnected] = useState(false);

  const networkHandler = useCallback((e: Event) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOnline(e.type === "online");
    if (e.type === "online") {
      setReConnected(true);
      setTimeout(() => {
        setReConnected(false);
        setIsOnline(true);
      }, 1500);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("offline", networkHandler);
    window.addEventListener("online", networkHandler);
    return () => {
      window.removeEventListener("offline", networkHandler);
      window.removeEventListener("online", networkHandler);
    };
  });

  return { isOnline, reConnected };
};
