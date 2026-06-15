"use client";

import React from "react";
import Link from "next/link";
import { TocItem } from "@/lib/slugs";
import { cn } from "@/lib/utils";
import { List, X, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TocProps {
  items: TocItem[];
  dict?: any;
}

export function Toc({ items, dict }: TocProps) {
  const [activeId, setActiveId] = React.useState<string>("");
  const [isOpen, setIsOpen] = React.useState(false);

  const filteredItems = React.useMemo(() => {
    return (items || []).filter(item => item.level === 2 || item.level === 3);
  }, [items]);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    filteredItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [filteredItems]);

  if (filteredItems.length === 0) {
    return null;
  }

  const tocContent = (
    <div className="space-y-5">
      <h4 className="font-bold uppercase text-[11px] tracking-wider text-muted-foreground/80 select-none">
        {dict?.toc?.onThisPage || "En esta página"}
      </h4>
      <nav className="flex flex-col space-y-2 border-l border-border/50">
        {filteredItems.map((item, index) => (
          <Link
            key={index}
            href={`#${item.id}`}
            onClick={() => setIsOpen(false)}
            className={cn(
              "transition-all duration-200 py-1.5 pr-3.5 -ml-px border-l block leading-normal text-left",
              activeId === item.id 
                ? [
                    "text-primary font-semibold border-primary bg-primary/5",
                    item.level === 2 ? "text-[13.5px] pl-6" : "pl-10 text-[12.5px]"
                  ]
                : item.level === 2
                  ? "text-foreground/85 hover:text-primary border-transparent font-medium text-[13.5px] pl-6"
                  : "text-muted-foreground/70 hover:text-primary border-transparent pl-10 text-[12.5px] font-normal"
            )}
          >
            {item.text}
          </Link>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Trigger - Right */}
      <div className="xl:hidden fixed bottom-6 right-6 z-50">
        <Button 
          onClick={() => setIsOpen(true)} 
          size="icon" 
          className="rounded-full shadow-lg h-12 w-12 bg-secondary text-secondary-foreground hover:scale-110 transition-transform"
        >
          <List className="h-6 w-6" />
        </Button>
      </div>

      {/* Mobile Drawer - Right */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] xl:hidden">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-72 bg-background border-l p-6 shadow-xl animate-in slide-in-from-right duration-300 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <span className="font-bold text-lg">{dict?.toc?.content || "Contenido"}</span>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            {tocContent}
          </div>
        </div>
      )}

      {/* Desktop TOC */}
      <aside className="w-72 xl:w-80 hidden xl:block py-6 pl-0 pr-6 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar shrink-0">
        {tocContent}
      </aside>
    </>
  );
}
