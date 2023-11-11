import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import React from "react";
import "./AgGridMod.scss";
import { NoDataOverlay } from "./plugins/overlays";
import { ColumnHeader } from "./plugins/headers";

interface IAgGridModProps extends AgGridReactProps {
  height: number;
}

type AgGridModProps = Omit<
  IAgGridModProps,
  | "rowHeight"
  | "headerHeight"
  | "animateRows"
  | "noRowsOverlayComponent"
  | "defaultColDef"
>;

export default function AgGridMod({ height, ...props }: AgGridModProps) {
  return (
    <div
      className="ag-theme-material mtrace-ag-mod"
      style={{ width: "100%", height }}
    >
      <AgGridReact
        {...props}
        rowHeight={60}
        headerHeight={60}
        animateRows={false}
        noRowsOverlayComponent={NoDataOverlay}
        defaultColDef={{
          flex: 1,
          resizable: true,
          headerComponent: ColumnHeader,
        }}
      />
    </div>
  );
}
