import React, {
  useMemo,
  useRef,
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  memo,
} from "react";
import styled from "styled-components";
import Button from "../../ui/Button";

export type Option = { id: string; label: string; meta?: string };

type Props = {
  options: Option[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  placeholder?: string;
  height?: number; // px
  itemSize?: number; // px
  // Optional: controlled focus index for parent sync (not required)
  initialFocusIndex?: number;
};

const Wrap = styled.div`
  display: grid;
  gap: 0.6rem;
`;

const SearchRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.6rem;
`;

const Search = styled.input`
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--color-toolbar-input-border);
  background: var(--color-toolbar-input-bg);
  color: var(--color-text-strong);
  border-radius: var(--border-radius-sm);
  outline: none;
`;

const Viewport = styled.div`
  position: relative;
  border: 1px solid var(--color-border-card);
  border-radius: var(--border-radius-sm);
  overflow: auto;
  background: var(--color-bg-0, transparent);
`;

const Rail = styled.div<{ $height: number }>`
  position: relative;
  height: ${(p) => p.$height}px; /* total virtual height */
`;

const Spacer = styled.div<{ $height: number }>`
  height: ${(p) => p.$height}px;
`;

const RowButton = styled.button<{ $sel?: boolean; $focused?: boolean }>`
  /* Full-width invisible button for a11y + selection */
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.8rem;
  box-sizing: border-box;
  width: 100%;
  padding: 0.55rem 0.75rem;
  text-align: left;
  border: 1px solid transparent;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  background: ${(p) =>
    p.$focused
      ? "var(--color-toolbar-bg)"
      : p.$sel
      ? "var(--color-bg-elevated)"
      : "transparent"};
  color: var(--color-text-strong);

  &:hover {
    background: var(--color-toolbar-bg);
  }
`;

const LeftCol = styled.span`
  display: grid;
  line-height: 1.2;
  > strong {
    font-weight: 600;
  }
  > small {
    opacity: 0.72;
  }
`;

const RightCol = styled.small`
  opacity: 0.75;
`;

/** Utility: clamp number between [min,max] */
const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

function VirtualizedSelector({
  options,
  selected,
  onToggle,
  placeholder = "Search…",
  height = 280,
  itemSize = 42,
  initialFocusIndex = 0,
}: Props) {
  const viewportRef = useRef<HTMLDivElement | null>(null);

  // ---- Search & filter ----
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    if (!q) return options;
    const qq = q.toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(qq) ||
        (o.meta ? o.meta.toLowerCase().includes(qq) : false)
    );
  }, [options, q]);

  // ---- Virtualization state ----
  const [scrollTop, setScrollTop] = useState(0);
  const totalHeight = filtered.length * itemSize;
  const visibleCount = Math.ceil(height / itemSize);
  const overscan = 8;

  const startIndex = clamp(
    Math.floor(scrollTop / itemSize) - overscan,
    0,
    Math.max(0, filtered.length - 1)
  );
  const endIndex = clamp(
    startIndex + visibleCount + overscan * 2,
    0,
    filtered.length
  );

  const topPad = startIndex * itemSize;
  const bottomPad = (filtered.length - endIndex) * itemSize;

  // ---- Focus & keyboard navigation ----
  const [focusIndex, setFocusIndex] = useState(() =>
    clamp(initialFocusIndex, 0, Math.max(0, filtered.length - 1))
  );
  useEffect(() => {
    // When results change, keep focus in range
    setFocusIndex((f) => clamp(f, 0, Math.max(0, filtered.length - 1)));
  }, [filtered.length]);

  const ensureIndexVisible = useCallback(
    (idx: number) => {
      const vp = viewportRef.current;
      if (!vp) return;
      const viewTop = vp.scrollTop;
      const viewBottom = viewTop + height;
      const rowTop = idx * itemSize;
      const rowBottom = rowTop + itemSize;

      if (rowTop < viewTop) {
        vp.scrollTop = rowTop;
      } else if (rowBottom > viewBottom) {
        vp.scrollTop = rowBottom - height;
      }
    },
    [height, itemSize]
  );

  // Clamp scrollTop when list shrinks (avoids blank space)
  useLayoutEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const maxScrollTop = Math.max(0, totalHeight - height);
    if (vp.scrollTop > maxScrollTop) {
      vp.scrollTop = maxScrollTop;
      setScrollTop(maxScrollTop);
    }
  }, [totalHeight, height]);

  const onViewportScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop((e.target as HTMLDivElement).scrollTop);
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!filtered.length) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = clamp(focusIndex + 1, 0, filtered.length - 1);
        setFocusIndex(next);
        ensureIndexVisible(next);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = clamp(focusIndex - 1, 0, filtered.length - 1);
        setFocusIndex(prev);
        ensureIndexVisible(prev);
      } else if (e.key === "Home") {
        e.preventDefault();
        setFocusIndex(0);
        ensureIndexVisible(0);
      } else if (e.key === "End") {
        e.preventDefault();
        const last = filtered.length - 1;
        setFocusIndex(last);
        ensureIndexVisible(last);
      } else if (e.key === "PageDown") {
        e.preventDefault();
        const jump = clamp(focusIndex + visibleCount, 0, filtered.length - 1);
        setFocusIndex(jump);
        ensureIndexVisible(jump);
      } else if (e.key === "PageUp") {
        e.preventDefault();
        const jump = clamp(focusIndex - visibleCount, 0, filtered.length - 1);
        setFocusIndex(jump);
        ensureIndexVisible(jump);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const o = filtered[focusIndex];
        if (o) onToggle(o.id);
      }
    },
    [filtered, focusIndex, visibleCount, ensureIndexVisible, onToggle]
  );

  // ---- Render window slice ----
  const slice = filtered.slice(startIndex, endIndex);

  // ---- Bulk select visible (nice UX for large lists) ----
  const toggleAllVisible = useCallback(() => {
    // If any visible item is unselected -> select all visible; otherwise unselect all visible
    const anyUnselected = slice.some((o) => !selected.has(o.id));
    slice.forEach((o) => {
      const shouldToggle =
        (anyUnselected && !selected.has(o.id)) ||
        (!anyUnselected && selected.has(o.id));
      if (shouldToggle) onToggle(o.id);
    });
  }, [slice, selected, onToggle]);

  return (
    <Wrap onKeyDown={onKeyDown}>
      <SearchRow>
        <Search
          placeholder={placeholder}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search options"
        />
        <Button onClick={toggleAllVisible}>
          {slice.some((o) => !selected.has(o.id))
            ? "Select visible"
            : "Unselect visible"}
        </Button>
      </SearchRow>

      <Viewport
        ref={viewportRef}
        style={{ height }}
        role="listbox"
        aria-multiselectable="true"
        tabIndex={0}
        onScroll={onViewportScroll}
      >
        <Rail $height={totalHeight}>
          <Spacer $height={topPad} />
          {/* Visible rows */}
          {slice.map((o, i) => {
            const absoluteIndex = startIndex + i;
            const isSel = selected.has(o.id);
            const isFocused = absoluteIndex === focusIndex;

            return (
              <RowButton
                key={o.id}
                $sel={isSel}
                $focused={isFocused}
                role="option"
                aria-selected={isSel}
                onClick={() => onToggle(o.id)}
                style={{ height: itemSize }}
              >
                <LeftCol>
                  <strong>{o.label}</strong>
                  {o.meta ? <small>{o.meta}</small> : null}
                </LeftCol>
                {isSel ? <RightCol>Selected</RightCol> : null}
              </RowButton>
            );
          })}
          <Spacer $height={bottomPad} />
        </Rail>
      </Viewport>
    </Wrap>
  );
}

export default memo(VirtualizedSelector);
