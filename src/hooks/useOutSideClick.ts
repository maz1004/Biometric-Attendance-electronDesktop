import { useEffect, useRef, RefObject } from "react";

function useOutSideClick<T extends HTMLElement = HTMLElement>(
  handler: () => void,
  listenCapturing: boolean = true
): RefObject<T> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const node = ref.current;
      const target = e.target as Node | null;
      if (node && target && !node.contains(target)) handler();
    }

    document.addEventListener("click", handleClick, listenCapturing);
    return () => {
      document.removeEventListener("click", handleClick, listenCapturing);
    };
  }, [handler, listenCapturing]);

  return ref;
}

export default useOutSideClick;
