"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

interface SelectProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value?: string
  onValueChange?: (value: string) => void
}

function Select({ className, children, value, onValueChange, ...props }: SelectProps) {
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const [isOpen, setIsOpen] = React.useState(false)

  const handleItemClick = (itemValue: string) => {
    onValueChange?.(itemValue)
    setIsOpen(false)
  }

  const modifiedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<{ onSelectItemClick?: (value: string) => void }>, {
        onSelectItemClick: handleItemClick,
      })
    }
    return child
  })

  return (
    <div className="relative">
      <button
        type="button"
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:truncate",
          className
        )}
        data-state={isOpen ? "open" : "closed"}
        {...props}
      >
        <span>{value}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 max-h-96 min-w-[8rem] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md mt-1"
          )}
        >
          <div className="max-h-96 overflow-y-auto p-1">{modifiedChildren}</div>
        </div>
      )}
    </div>
  )
}

function SelectValue({
  value,
  placeholder,
}: {
  value?: string
  placeholder?: string
}) {
  return <span>{value || placeholder}</span>
}

function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:truncate",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function SelectContent({
  className,
  children,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  )
}

interface SelectItemProps {
  children: React.ReactNode
  value?: string
  onSelectItemClick?: (value: string) => void
}

function SelectItem({ children, value, onSelectItemClick, ...props }: SelectItemProps) {
  return (
    <div
      role="option"
      onClick={() => onSelectItemClick?.(value || "")}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
      )}
      data-value={value}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      </span>
      {children}
    </div>
  )
}

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
}