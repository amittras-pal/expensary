import { useCallback, useEffect, useState } from "react";
import { APP_TITLE } from "../constants/app";

export const useTitleMonitor = () => {
  const [title, setTitle] = useState([APP_TITLE, "Dashboard"]);

  const titleHandler = useCallback((entries: MutationRecord[]) => {
    const nodeVal = entries.at(0)?.addedNodes.item(0)?.nodeValue ?? "";
    const pageTitle = nodeVal?.split("|").map((part) => part.trim()) ?? [];
    setTitle(pageTitle);
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(titleHandler);
    observer.observe(document.querySelector("title")!, {
      childList: true,
      subtree: false,
    });
    return () => {
      observer.disconnect();
    };
  }, [titleHandler]);

  return title;
};
