"use client"

import * as React from "react"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"

import { cn } from "@/lib/utils"

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof PanelGroup> & { direction: "horizontal" | "vertical" }) {
  return (
    <PanelGroup
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className
      )}
      {...props}
    />
  )
}

function ResizablePanel({
  ...props
}: React.ComponentProps<typeof Panel>) {
  return <Panel data-slot="resizable-panel" {...props} />
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof PanelResizeHandle> & {
  withHandle?: boolean
}) {
  return (
    <PanelResizeHandle
      data-slot="resizable-handle"
      className={cn(
        "group/handle relative flex w-1.5 shrink-0 items-center justify-center bg-transparent outline-none data-[panel-group-direction=vertical]:h-1.5 data-[panel-group-direction=vertical]:w-full",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div
          aria-hidden="true"
          className="h-8 w-0.5 rounded-full bg-border-strong transition-colors duration-150 group-hover/handle:bg-primary/70 group-focus-visible/handle:bg-primary group-data-[resize-handle-state=drag]/handle:bg-primary group-data-[panel-group-direction=vertical]/handle:h-0.5 group-data-[panel-group-direction=vertical]/handle:w-8"
        />
      )}
    </PanelResizeHandle>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
