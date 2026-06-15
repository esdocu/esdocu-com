import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Zap, Shield, Globe, ArrowUpRight } from "lucide-react";
import { getCategoriesWithBooks, getOfficialTranslations } from "@/lib/docs";
import { getDictionary } from "@/lib/i18n";

export default function Home() {
  const categories = getCategoriesWithBooks();
  const officialTranslations = getOfficialTranslations();
  const dict = getDictionary();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar categoriesWithBooks={categories} />

      <main className="grow">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,hsl(var(--primary)/0.05)_0%,transparent_100%)]" />

          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-muted text-muted-foreground mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2" />
              {dict.home.heroTag}
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
              {dict.home.heroTitle1} <span className="gradient-text">{dict.home.heroTitleTech}</span> <br />
              {dict.home.heroTitle2}
            </h1>

            <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              {dict.home.heroDescription}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <Button size="lg" asChild className="rounded-full px-8">
                <Link href="/bootstrap/comenzando">
                  {dict.home.exploreDocs} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-full px-8">
                <a href="https://github.com/fabiankaraben/esdocu-com" target="_blank" rel="noreferrer">
                  {dict.home.viewOnGithub}
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Zap className="h-8 w-8 text-primary" />}
                title={dict.home.feature1Title}
                description={dict.home.feature1Desc}
              />
              <FeatureCard
                icon={<BookOpen className="h-8 w-8 text-primary" />}
                title={dict.home.feature2Title}
                description={dict.home.feature2Desc}
              />
              <FeatureCard
                icon={<Globe className="h-8 w-8 text-primary" />}
                title={dict.home.feature3Title}
                description={dict.home.feature3Desc}
              />
            </div>
          </div>
        </section>

        {/* Documentation Grid */}
        <section className="py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-16">{dict.home.docsTitle}</h2>

            {categories.map((category) => (
              category.books?.length > 0 && (
                <div key={category.slug} className="mb-20 last:mb-0">
                  <div className="mb-8 border-b pb-4 text-left">
                    <h3 className="text-2xl font-bold">{category.title}</h3>
                    {category.description && (
                      <p className="mt-2 text-muted-foreground">{category.description}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {category.books.map((book: any) => (
                      <DocCard
                        key={book.slug}
                        title={book.title}
                        href={`/${book.slug}/${book.chapters?.[0]?.slug || 'comenzando'}`}
                        color={book.slug === 'bootstrap' ? "bg-[#7952b3]" : "bg-[#1b2b34]"}
                        description={book.description}
                        dict={dict}
                      />
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </section>

        {/* Official Translations Section */}
        {officialTranslations.length > 0 && (
          <section className="py-24 bg-muted/20 relative overflow-hidden border-t">
            {/* Background elements for rich aesthetics */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(50%_50%_at_50%_50%,hsl(var(--primary)/0.02)_0%,transparent_100%)]" />

            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center mb-16">
                <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-primary/10 text-primary mb-4">
                  <Globe className="h-3.5 w-3.5 mr-1.5 animate-pulse" />
                  {dict.home.officialTranslationsTag}
                </div>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                  {dict.home.officialTranslationsTitle}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {dict.home.officialTranslationsDesc}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {officialTranslations.map((translation) => (
                  <OfficialTranslationCard
                    key={translation.title}
                    title={translation.title}
                    url={translation.url}
                    description={translation.description}
                    color={translation.color}
                    gradient={translation.gradient}
                    dict={dict}
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t py-12 bg-background">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} {dict.home.footerText}</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl border bg-card hover:shadow-lg transition-all duration-300 group">
      <div className="mb-4 inline-block p-3 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function DocCard({ title, href, color, description, dict }: { title: string, href: string, color: string, description: string, dict: any }) {
  return (
    <Link href={href} className="group relative block p-8 rounded-2xl border bg-card hover:shadow-xl transition-all duration-500 overflow-hidden text-left h-full">
      <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`} />
      <div className="relative z-10">
        <h3 className="text-2xl font-bold mb-3">{title}</h3>
        <p className="text-muted-foreground mb-6 line-clamp-2">{description}</p>
        <span className="text-sm font-semibold inline-flex items-center group-hover:translate-x-1 transition-transform">
          {dict.home.readMore} <ArrowRight className="ml-2 h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

function OfficialTranslationCard({ title, url, description, color, gradient, dict }: { title: string, url: string, description: string, color: string, gradient: string, dict: any }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block p-8 rounded-2xl border bg-card hover:shadow-2xl transition-all duration-500 overflow-hidden text-left h-full border-muted/50 hover:border-primary/30"
    >
      {/* Background glow using the gradient custom to each technology */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${gradient} opacity-20 blur-3xl group-hover:opacity-40 transition-opacity duration-500`} />

      {/* Premium subtle corner accent line matching the theme color of the tech */}
      <div className={`absolute top-0 left-0 w-1.5 h-0 ${color} group-hover:h-full transition-all duration-500 rounded-tl-2xl rounded-bl-2xl`} />

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">
              {title}
            </h3>
            <span className="p-2 rounded-xl bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300 transform group-hover:-translate-y-1 group-hover:translate-x-1">
              <ArrowUpRight className="h-5 w-5" />
            </span>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-6 group-hover:text-muted-foreground/80 transition-colors duration-300">
            {description}
          </p>
        </div>

        <div className="pt-2 border-t border-muted/40 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 group-hover:text-primary transition-colors duration-300">
            {dict.home.officialDocsLabel}
          </span>
          <span className="text-sm font-semibold inline-flex items-center text-primary group-hover:translate-x-1 transition-transform duration-300">
            {dict.home.visitSite} <ArrowRight className="ml-1.5 h-4 w-4" />
          </span>
        </div>
      </div>
    </a>
  );
}

