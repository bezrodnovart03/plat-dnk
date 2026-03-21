"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Select = ({ value, onValueChange, children }: { value?: string; onValueChange?: (value: string) => void; children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false)
  
  return (
    <div className="relative">
      <div
        onClick={() => setOpen(!open)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer"
      >
        <span>{value || "Выберите..."}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </div>
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
          {React.Children.map(children, child => {
            if (React.isValidElement(child) && child.type === SelectItem) {
              return React.cloneElement(child, { 
                onSelect: () => {
                  onValueChange?.(child.props.value)
                  setOpen(false)
                }
              })
            }
            return child
          })}
        </div>
      )}
    </div>
  )
}

const SelectTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background", className)} {...props}>
    {children}
  </div>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  return <span>{placeholder}</span>
}

const SelectContent = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const SelectItem = ({ value, children, onSelect }: { value: string; children: React.ReactNode; onSelect?: () => void }) => {
  return (
    <div
      onClick={onSelect}
      className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
    >
      {children}
    </div>
  )
}

const SelectGroup = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup }
