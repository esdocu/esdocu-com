"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SidebarItem } from "@/lib/docs";
import { Menu, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  currentSlug: string[];
  items: SidebarItem[];
  root: string;
  dict?: any;
}

export function Sidebar({ currentSlug, items, root, dict }: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const asideRef = React.useRef<HTMLDivElement | null>(null);

  // Restore scroll position when slug or root changes
  React.useEffect(() => {
    try {
      const savedScroll = sessionStorage.getItem(`sidebar-scroll-${root}`);
      if (savedScroll && asideRef.current) {
        asideRef.current.scrollTop = parseInt(savedScroll, 10);
      }
    } catch (e) {
      console.warn("Could not restore sidebar scroll position", e);
    }
  }, [root, currentSlug]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    try {
      const scrollTop = e.currentTarget.scrollTop;
      sessionStorage.setItem(`sidebar-scroll-${root}`, String(scrollTop));
    } catch (e) {
      // Ignore storage errors in private browsing modes
    }
  };

  const sidebarContent = (
    <div className="space-y-4">
      <div>
        <h4 className="font-bold mb-4 uppercase text-xs tracking-wider text-muted-foreground flex items-center gap-2">
          <ChevronRight className="h-3 w-3 text-primary" />
          {root}
        </h4>
        <nav className="flex flex-col space-y-1">
          {items.map((item, index) => (
            <SidebarNavItem key={index} item={item} currentSlug={currentSlug} onClick={() => setIsOpen(false)} />
          ))}
        </nav>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Trigger - Left */}
      <div className="lg:hidden fixed bottom-6 left-6 z-50">
        <Button 
          onClick={() => setIsOpen(true)} 
          size="icon" 
          className="rounded-full shadow-lg h-12 w-12 bg-primary text-primary-foreground hover:scale-110 transition-transform"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Mobile Drawer - Left */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-72 bg-background border-r p-6 shadow-xl animate-in slide-in-from-left duration-300 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <span className="font-bold text-lg">{dict?.sidebar?.navigation || "Navegación"}</span>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside 
        ref={asideRef}
        onScroll={handleScroll}
        className="w-72 xl:w-80 hidden lg:block border-r h-[calc(100vh-4rem)] p-6 overflow-y-auto sticky top-16 custom-scrollbar shrink-0"
      >
        {sidebarContent}
      </aside>
    </>
  );
}

function SidebarNavItem({ 
  item, 
  currentSlug, 
  onClick 
}: { 
  item: SidebarItem, 
  currentSlug: string[],
  onClick?: () => void
}) {
  const currentPath = currentSlug.join("/");
  const isActive = item.slug === currentPath;

  if (item.items) {
    return (
      <div className="space-y-1 mb-4 last:mb-0">
        {item.label && (
          <div className="text-xs font-semibold text-muted-foreground px-3 py-2 uppercase tracking-tight">
            {item.label}
          </div>
        )}
        <div className="flex flex-col space-y-1 pl-2 border-l ml-3">
          {item.items.map((subItem, index) => (
            <SidebarNavItem key={index} item={subItem} currentSlug={currentSlug} onClick={onClick} />
          ))}
        </div>
      </div>
    );
  }

  if (item.slug) {
    return (
      <Link
        href={`/${item.slug}`}
        onClick={onClick}
        className={cn(
          "text-sm py-2 px-3 rounded-md transition-colors block flex items-start gap-2.5",
          isActive
            ? "bg-primary/10 text-primary font-semibold"
            : "hover:bg-muted text-muted-foreground hover:text-foreground"
        )}
      >
        {item.order !== undefined && (
          <span className={cn(
            "font-mono text-xs mt-0.5 shrink-0 transition-colors",
            isActive ? "text-primary/70" : "text-muted-foreground/45"
          )}>
            {String(item.order).padStart(2, '0')}
          </span>
        )}
        <span className="flex-1">{item.label}</span>
      </Link>
    );
  }

  return null;
}
