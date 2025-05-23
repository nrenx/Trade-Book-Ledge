
import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile()

  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        isMobile ? "overflow-x-auto scrollbar-hide w-full" : "",
        className
      )}
      {...props}
    />
  )
})
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    icon?: React.ReactNode
  }
>(({ className, icon, children, ...props }, ref) => {
  const isMobile = useIsMobile()
  const isActive = props["data-state"] === "active"

  // Check if parent TabsList has the force-show-text attribute
  const forceShowText = document.querySelector('[data-force-show-text="true"]') !== null

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "relative inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        isMobile && "min-w-[40px]",
        isMobile && !isActive && icon && "px-2 py-1",
        className
      )}
      {...props}
    >
      {icon && (
        <span className={cn(
          "transition-all duration-200",
          isActive || !isMobile ? "mr-2" : "mr-0"
        )}>
          {icon}
        </span>
      )}
      <span className={cn(
        "transition-all duration-200 whitespace-nowrap",
        // Always show text for settings tabs or if force-show-text is set
        (props.className && typeof props.className === 'string' && props.className.includes('settings-tab')) || forceShowText
          ? "inline-block"
          : (isMobile && !isActive && icon ? "sr-only" : "inline-block")
      )}>
        {children}
      </span>

      {/* Add active indicator for consistency with TabNavigation */}
      {isActive && (
        <span className="tab-active-indicator absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
      )}
    </TabsPrimitive.Trigger>
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
