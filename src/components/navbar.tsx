"use client";

import * as React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Sun, Moon, ExternalLink, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next-image-export-optimizer";
import { cn } from "@/lib/utils";

interface NavbarProps {
  categoriesWithBooks?: any[];
  wide?: boolean;
}

export function Navbar({ categoriesWithBooks = [], wide = false }: NavbarProps) {
  const { setTheme, theme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full glass border-b">
      <div className={cn(
        "mx-auto px-4 h-16 flex items-center justify-between",
        wide ? "w-full max-w-none md:px-6" : "container"
      )}>
        <Link href="/" className="flex items-center space-x-2">
          <div className="relative h-8 w-32">
            <Image
              src="/logos/light-logo.svg"
              alt="Esdocu"
              fill
              className="dark:hidden object-contain"
              priority
            />
            <Image
              src="/logos/dark-logo.svg"
              alt="Esdocu"
              fill
              className="hidden dark:block object-contain"
              priority
            />
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {categoriesWithBooks.map((category) => (
            category.books?.length > 0 && (
              <div key={category.slug} className="relative group">
                <button className="flex items-center hover:text-primary/80 transition-colors py-2">
                  {category.shortTitle ?? category.title} <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                <div className="absolute top-full left-0 w-48 rounded-md shadow-lg bg-background border hidden group-hover:block transition-all z-50">
                  <div className="py-2">
                    {category.books.map((book: any) => (
                      <Link
                        key={book.slug}
                        href={`/${book.slug}/${book.chapters?.[0]?.slug || 'comenzando'}`}
                        className="block px-4 py-2 hover:bg-muted transition-colors"
                      >
                        {book.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )
          ))}
        </nav>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <a href="https://github.com/esdocu/esdocu-com" target="_blank" rel="noreferrer">
              <ExternalLink className="h-5 w-5" />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background p-4 animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col space-y-4">
            {categoriesWithBooks.map((category) => (
              category.books?.length > 0 && (
                <div key={category.slug} className="space-y-2">
                  <div className="font-semibold text-muted-foreground">{category.title}</div>
                  <div className="flex flex-col pl-4 space-y-2 border-l">
                    {category.books.map((book: any) => (
                      <Link
                        key={book.slug}
                        href={`/${book.slug}/${book.chapters?.[0]?.slug || 'comenzando'}`}
                        onClick={() => setIsMenuOpen(false)}
                        className="hover:text-primary transition-colors py-1"
                      >
                        {book.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
