import { useEffect, useState } from "react";

// TODO: not used right now, but maybe useful...
export default function useChangeFlash(dependency: any, timeout = 1250) {
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    setChanged(true);
    const timer = setTimeout(() => {
      setChanged(false);
    }, timeout);
    return () => clearTimeout(timer);
  }, [dependency, timeout]);

  return changed;
}
