declare module "react-resizable-panels" {
  import * as React from "react";

  export interface PanelGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    direction?: "horizontal" | "vertical";
  }

  export const PanelGroup: React.FC<PanelGroupProps>;

  export const Panel: React.FC<any>;

  export const PanelResizeHandle: React.FC<any>;
}