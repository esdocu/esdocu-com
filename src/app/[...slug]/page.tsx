import { getAllDocSlugs, getDocBySlug, getFirstArticleSlug, getSidebarForRoot, getCategoriesWithBooks, getFlatChapterSlugs } from "@/lib/docs";
import { getDictionary } from "@/lib/i18n";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { generateSlug } from "@/lib/slugs";
import { notFound, redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { Toc } from "@/components/toc";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Metadata } from "next";
import { cn } from "@/lib/utils";
import * as MdxUI from "@/components/mdx-components";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";



interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = getAllDocSlugs();
  if (slugs.length === 0) {
    return [{ slug: ['__empty__'] }];
  }
  return slugs.map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocBySlug(slug);

  const title = doc?.title || "Documentación";
  const description = doc?.data?.description || "Documentación técnica en español.";
  const path = `/${slug.join("/")}`;

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: path,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

const getTextContent = (children: any): string => {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(getTextContent).join("");
  if (children?.props?.children) return getTextContent(children.props.children);
  return "";
};

const mdxComponents: any = {
  ...MdxUI,
  code: MdxUI.CodeBlock,
  h1: (props: any) => <h1 className="text-4xl font-display font-bold mt-16 mb-8" {...props} />,
  h2: ({ children, ...props }: any) => {
    const text = getTextContent(children);
    const id = generateSlug(text);
    const cleanText = text.replace(/\\?\{#.*?\}/g, "").trim();
    return <h2 id={id} className="text-2xl font-display font-bold mt-16 mb-6 pb-2 border-b scroll-mt-24" {...props}>{cleanText}</h2>;
  },
  h3: ({ children, ...props }: any) => {
    const text = getTextContent(children);
    const id = generateSlug(text);
    const cleanText = text.replace(/\\?\{#.*?\}/g, "").trim();
    return <h3 id={id} className="text-xl font-display font-bold mt-12 mb-4 scroll-mt-24" {...props}>{cleanText}</h3>;
  },
  p: (props: any) => <p className="leading-relaxed xl:leading-[1.8] mb-6 text-[1.05rem] md:text-[1.1rem]" {...props} />,
  ul: (props: any) => <ul className="list-disc pl-6 mb-6 space-y-3 xl:space-y-4" {...props} />,
  ol: (props: any) => <ol className="list-decimal pl-6 mb-6 space-y-3 xl:space-y-4" {...props} />,
  li: (props: any) => <li className="leading-relaxed xl:leading-[1.8] text-[1.05rem] md:text-[1.1rem] mb-2" {...props} />,
  blockquote: (props: any) => <blockquote className="border-l-4 border-primary/20 pl-6 pr-4 py-4 italic my-8 bg-muted/30 rounded-r-lg" {...props} />,
  a: (props: any) => <a className="text-primary font-medium underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-all" {...props} />,
  table: (props: any) => (
    <div className="my-8 w-full overflow-hidden rounded-xl border border-muted shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left" {...props} />
      </div>
    </div>
  ),
  thead: (props: any) => <thead className="bg-muted/50 border-b border-muted" {...props} />,
  tbody: (props: any) => <tbody className="divide-y divide-muted/50" {...props} />,
  tr: (props: any) => <tr className="hover:bg-muted/20 transition-colors" {...props} />,
  th: (props: any) => <th className="px-4 py-3 text-sm font-bold text-foreground/80" {...props} />,
  td: (props: any) => <td className="px-4 py-3 text-sm leading-relaxed text-muted-foreground" {...props} />,
};



export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;

  // If it's a root path (e.g., /momentjs), redirect to the first article
  if (slug.length === 1) {
    const firstArticle = getFirstArticleSlug(slug[0]);
    if (firstArticle && firstArticle !== slug[0]) {
      redirect(`/${firstArticle}`);
    }
  }

  const doc = getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  const root = slug[0];
  const sidebarItems = getSidebarForRoot(root);
  const categoriesWithBooks = getCategoriesWithBooks();

  // Compute prev / next chapter navigation
  const currentSlugStr = slug.join("/");
  const flatChapters = getFlatChapterSlugs(root);
  const currentIndex = flatChapters.findIndex((c) => c.slug === currentSlugStr);
  const prevChapter = currentIndex > 0 ? flatChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex >= 0 && currentIndex < flatChapters.length - 1 ? flatChapters[currentIndex + 1] : null;
  const dict = getDictionary();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar categoriesWithBooks={categoriesWithBooks} wide />
      <div className="w-full max-w-none px-4 md:px-6 flex gap-6 xl:gap-8">
        <Sidebar currentSlug={slug} items={sidebarItems} root={root} dict={dict} />
        <main className="flex-1 py-6 px-2 md:py-12 md:px-4 xl:py-16 xl:px-4 max-w-none overflow-hidden">
          <div className="mb-12">
            <div className="text-sm font-medium text-primary mb-2 uppercase tracking-wider">{slug[0]}</div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 tracking-tight">{doc.title}</h1>
            {doc.data.description && (
              <p className="text-xl text-muted-foreground leading-relaxed">{doc.data.description}</p>
            )}
          </div>

          <div className="prose-custom">
            <MDXRemote
              source={doc.content}
              components={mdxComponents}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm, remarkMath],
                  rehypePlugins: [rehypeKatex],
                }
              }}
            />

          </div>

          {/* Previous / Next chapter navigation */}
          {(prevChapter || nextChapter) && (
            <nav className="mt-16 pt-8 border-t grid grid-cols-1 sm:grid-cols-2 gap-4" aria-label={dict.docPage.chapterNavAria}>
              {prevChapter ? (
                <Link
                  href={`/${prevChapter.slug}`}
                  className="group flex flex-col gap-1 p-5 rounded-xl border bg-card hover:border-primary/50 hover:shadow-md transition-all duration-300"
                >
                  <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    {dict.docPage.prevChapter}
                  </span>
                  <span className="text-sm font-medium line-clamp-2 mt-1">{prevChapter.label}</span>
                </Link>
              ) : (
                <div />
              )}

              {nextChapter && (
                <Link
                  href={`/${nextChapter.slug}`}
                  className="group flex flex-col gap-1 p-5 rounded-xl border bg-card hover:border-primary/50 hover:shadow-md transition-all duration-300 sm:items-end sm:text-right"
                >
                  <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors sm:flex-row-reverse">
                    <ArrowRight className="h-3.5 w-3.5" />
                    {dict.docPage.nextChapter}
                  </span>
                  <span className="text-sm font-medium line-clamp-2 mt-1">{nextChapter.label}</span>
                </Link>
              )}
            </nav>
          )}

          <div className="mt-10 pt-8 border-t flex justify-between items-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} {dict.docPage.footerText}</p>
            <a href={`https://github.com/esdocu/esdocu-com/edit/main/${doc.filePath}`} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
              {dict.docPage.editPage}
            </a>
          </div>
        </main>
        <Toc items={doc.toc} dict={dict} />
      </div>
    </div>
  );
}
