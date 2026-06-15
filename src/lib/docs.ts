import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface SidebarItem {
  label?: string;
  slug?: string;
  items?: SidebarItem[];
  order?: number;
}

import { getLocale } from "./i18n";

const DOCS_PATH = path.join(process.cwd(), "content", getLocale());
const BOOKS_PATH = path.join(DOCS_PATH, "books");

import { TocItem, generateSlug } from "./slugs";

export interface Doc {
  slug: string[];
  title: string;
  content: string;
  data: { [key: string]: any };
  toc: TocItem[];
  filePath: string;
}

export interface Category {
  slug: string;
  locale: string;
  title: string;
  shortTitle?: string;
  description: string;
  icon?: string;
  order: number;
}

export interface BookMetadata {
  slug: string;
  locale: string;
  title: string;
  subtitle: string;
  author: string;
  description: string;
  cover: string;
  category: string;
  tags: string[];
  featured: boolean;
  publishedAt: string;
  language: string;
}

export interface OfficialTranslation {
  title: string;
  url: string;
  description: string;
  color: string;
  gradient: string;
}

export function getOfficialTranslations(): OfficialTranslation[] {
  const filePath = path.join(DOCS_PATH, "translations.json");
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (error) {
    console.error("Error reading translations.json:", error);
    return [];
  }
}

export function getAllCategories(): Category[] {
  const categoriesPath = path.join(DOCS_PATH, "categories");
  if (!fs.existsSync(categoriesPath)) return [];
  const files = fs.readdirSync(categoriesPath);
  return files
    .filter(f => f.endsWith('.json'))
    .map(file => JSON.parse(fs.readFileSync(path.join(categoriesPath, file), "utf-8")))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

export function getAllBooks(): BookMetadata[] {
  if (!fs.existsSync(BOOKS_PATH)) return [];
  const dirs = fs.readdirSync(BOOKS_PATH);
  const books: BookMetadata[] = [];
  
  for (const dir of dirs) {
    const bookJsonPath = path.join(BOOKS_PATH, dir, "book.json");
    if (fs.existsSync(bookJsonPath)) {
      books.push(JSON.parse(fs.readFileSync(bookJsonPath, "utf-8")));
    }
  }
  return books;
}

export function getCategoriesWithBooks() {
  const categories = getAllCategories();
  const books = getAllBooks();
  
  return categories.map(category => ({
    ...category,
    books: books.filter(book => book.category === category.slug)
  }));
}

export function getAllDocSlugs(dirPath: string = BOOKS_PATH, slugs: string[][] = []): string[][] {
  if (!fs.existsSync(dirPath)) return slugs;
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllDocSlugs(filePath, slugs);
    } else if (file.endsWith(".md") || file.endsWith(".mdx")) {
      const relativePath = path.relative(BOOKS_PATH, filePath);
      const slugParts = relativePath.replace(/\.mdx?$/, "").split(path.sep);
      
      const lastPart = slugParts[slugParts.length - 1];
      slugParts[slugParts.length - 1] = lastPart.replace(/^\d+-/, "");
      
      // Handle index files
      if (slugParts[slugParts.length - 1] === "index") {
        slugParts.pop();
      }
      
      if (slugParts.length > 0) {
        slugs.push(slugParts);
      }
    }
  });

  return slugs;
}

export function getDocBySlug(slug: string[]): Doc | null {
  const dirPath = path.join(BOOKS_PATH, ...slug.slice(0, -1));
  const targetSlug = slug[slug.length - 1] || "index";
  
  let actualFileName = targetSlug;
  
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const nameWithoutExt = file.replace(/\.mdx?$/, "").replace(/\.md$/, "");
      if (nameWithoutExt === targetSlug || nameWithoutExt.replace(/^\d+-/, "") === targetSlug) {
        actualFileName = nameWithoutExt;
        break;
      }
    }
  }

  // Try several possible file paths
  const possiblePaths = [
    path.join(dirPath, actualFileName) + ".mdx",
    path.join(dirPath, actualFileName) + ".md",
    path.join(dirPath, actualFileName, "index.mdx"),
    path.join(dirPath, actualFileName, "index.md"),
  ];

  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      let fileContent = fs.readFileSync(filePath, "utf-8");
      
      // Strip Astro imports
      fileContent = fileContent.replace(/import\s+.*\s+from\s+['"]@astrojs\/starlight\/components['"];?/g, "");
      fileContent = fileContent.replace(/import\s+.*\s+from\s+['"]@components\/.*['"];?/g, "");
      
      // Strip style attributes as they cause React to crash
      fileContent = fileContent.replace(/\sstyle="[^"]*"/g, "");

      const { data, content } = matter(fileContent);
      
      // Extract TOC
      const toc: TocItem[] = [];
      const headingRegex = /^(##|###)\s+(.*)$/gm;
      let match;
      
      while ((match = headingRegex.exec(content)) !== null) {
        const level = match[1].length;
        let text = match[2].trim();
        
        // Remove custom IDs if present in the text like {#id} or \{#id}
        const id = generateSlug(text);
        text = text.replace(/\\?\{#.*?\}/g, "").trim();
        
        toc.push({ id, text, level });
      }

      let finalTitle = data.title;
      let finalDescription = data.description;

      // Fallback to book.json if frontmatter title or description is missing
      if (!finalTitle || !finalDescription) {
        try {
          const root = slug[0];
          const bookJsonPath = path.join(BOOKS_PATH, root, "book.json");
          if (fs.existsSync(bookJsonPath)) {
            const bookData = JSON.parse(fs.readFileSync(bookJsonPath, "utf-8"));
            const targetSlug = slug[slug.length - 1];
            
            if (slug.length === 1 || targetSlug === "index") {
              if (!finalTitle) finalTitle = bookData.title;
              if (!finalDescription) finalDescription = bookData.description;
            } else {
              const chapters = bookData.chapters || [];
              const chapter = chapters.find((c: any) => c.slug === targetSlug);
              if (chapter) {
                if (!finalTitle) finalTitle = chapter.title;
                if (!finalDescription) finalDescription = chapter.description;
              }
            }
          }
        } catch (error) {
          console.error("Error reading book.json for fallback data in getDocBySlug:", error);
        }
      }

      // Ensure data object contains the resolved title and description
      if (!data.title && finalTitle) data.title = finalTitle;
      if (!data.description && finalDescription) data.description = finalDescription;

      return {
        slug,
        title: finalTitle || slug[slug.length - 1],
        content,
        data,
        toc,
        filePath: path.relative(process.cwd(), filePath),
      };
    }
  }

  return null;
}

export function getSidebarForRoot(root: string): SidebarItem[] {
  try {
    const bookJsonPath = path.join(BOOKS_PATH, root, "book.json");
    if (fs.existsSync(bookJsonPath)) {
      const bookData = JSON.parse(fs.readFileSync(bookJsonPath, "utf-8"));
      
      const parts = bookData.parts || [];
      const chapters = bookData.chapters || [];
      
      if (parts.length > 0) {
        return parts.map((part: any) => {
          return {
            label: part.title,
            items: part.chapterSlugs.map((slug: string) => {
              const chapter = chapters.find((c: any) => c.slug === slug);
              return {
                label: chapter ? chapter.title : getLabelForSlug([root, slug]),
                slug: `${root}/${slug}`,
                order: chapter ? chapter.order : undefined
              };
            })
          };
        });
      } else if (chapters.length > 0) {
        return chapters.map((chapter: any) => ({
          label: chapter.title,
          slug: `${root}/${chapter.slug}`,
          order: chapter.order
        }));
      }
    }
  } catch (error) {
    console.error("Error reading book.json for root:", root, error);
  }

  // Fallback to auto-generation if no config for this root
  const slugs = getAllDocSlugs().filter(slug => slug[0] === root);
  return slugs.map(slug => {
    const lastPart = slug[slug.length - 1] || "";
    const match = lastPart.match(/^(\d+)-/);
    const order = match ? parseInt(match[1], 10) : undefined;
    
    return {
      slug: slug.join("/"),
      label: getLabelForSlug(slug),
      order
    };
  });
}

function resolveSidebarItem(item: SidebarItem): SidebarItem {
  if (item.items) {
    return {
      ...item,
      items: item.items.map(subItem => resolveSidebarItem(subItem))
    };
  }
  
  if (item.slug && !item.label) {
    return {
      ...item,
      label: getLabelForSlug(item.slug.split("/"))
    };
  }
  
  return item;
}

function getLabelForSlug(slug: string[]): string {
  const doc = getDocBySlug(slug);
  if (doc && doc.data && doc.data.sidebar && doc.data.sidebar.label) {
    return doc.data.sidebar.label;
  }
  if (doc && doc.title) {
    return doc.title;
  }
  const lastPart = slug[slug.length - 1];
  return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/-/g, " ");
}

export function getSidebar() {
  const slugs = getAllDocSlugs();
  const sidebar: { [key: string]: any } = {};

  slugs.forEach(slug => {
    const root = slug[0];
    if (!sidebar[root]) sidebar[root] = [];
    sidebar[root].push(slug);
  });

  return sidebar;
}

export function getFirstArticleSlug(root: string): string | null {
  const items = getSidebarForRoot(root);
  
  function findFirst(items: SidebarItem[]): string | null {
    for (const item of items) {
      if (item.slug) return item.slug;
      if (item.items) {
        const first = findFirst(item.items);
        if (first) return first;
      }
    }
    return null;
  }
  
  return findFirst(items);
}

/** Returns a flat, ordered list of leaf chapter slugs for a book root. */
export function getFlatChapterSlugs(root: string): Array<{ slug: string; label: string }> {
  const items = getSidebarForRoot(root);
  const result: Array<{ slug: string; label: string }> = [];

  function collect(items: SidebarItem[]) {
    for (const item of items) {
      if (item.slug) {
        result.push({ slug: item.slug, label: item.label ?? item.slug });
      }
      if (item.items) {
        collect(item.items);
      }
    }
  }

  collect(items);
  return result;
}
