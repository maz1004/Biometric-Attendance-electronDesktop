declare module "react-window" {
  import * as React from "react";

  export interface ListChildComponentProps {
    index: number;
    style: React.CSSProperties;
    data?: unknown;
    isScrolling?: boolean;
  }

  export interface FixedSizeListProps {
    height: number;
    width: number | string;
    itemCount: number;
    itemSize: number;
    children: React.ComponentType<ListChildComponentProps>;
    itemData?: unknown;
    overscanCount?: number;
  }

  export const FixedSizeList: React.ComponentType<FixedSizeListProps>;
}
