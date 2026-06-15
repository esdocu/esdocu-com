# Esdocu 📖

Esdocu is a high-performance documentation platform dedicated to providing high-quality, professional technical documentation in **Spanish**. Our mission is to break the language barrier for developers in the Hispanic community by translating and improving the documentation of the most popular open-source technologies.

## 🚀 Technologies Included

We currently provide comprehensive documentation for:

- **Bootstrap**: The world's most popular CSS framework.
- **Moment.js**: Parse, validate, manipulate, and display dates and times in JavaScript.
- **Dart**: A client-optimized language for fast apps on any platform.
- **TypeScript**: JavaScript with syntax for types.

## ✨ Features

- **Premium Design**: A modern, clean, and responsive interface built for readability.
- **Dark Mode**: Support for light, dark, and system themes.
- **Static Export**: Built with Next.js static export for lightning-fast performance and SEO.
- **Interactive Demos**: Live examples and iframes to see the code in action.
- **Developer Friendly**: Built with the latest tech stack (Next.js 15, Tailwind CSS 4, MDX).

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Content**: [MDX](https://mdxjs.com/) with `next-mdx-remote`
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

## 💻 Local Development

Follow these steps to run the project locally:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/esdocu/esdocu-com.git
   cd esdocu-com
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Run the development server**:

   ```bash
   pnpm dev
   ```

   The site will be available at `http://localhost:3001`.

4. **Build the static site**:

   ```bash
   pnpm build
   ```

   The static files will be generated in the `/out` directory.

## 🌍 Multi-Language Support

Esdocu supports deploying different languages as completely independent static websites on different subdomains (e.g., `esdocu.com` for Spanish, `fr.esdocu.com` for French). This is achieved using the `BUILD_LOCALE` environment variable at build time.

### Adding a New Language

To add support for a new language (e.g., French `fr`):

1. **Create the content directory:**
   Create a new folder in `content/` with your language code: `content/fr/`.
   Inside this folder, create the required structure (`books/`, `categories/`, and a `translations.json` file).

2. **Add the UI Dictionary:**
   Create a new dictionary file `src/lib/dictionaries/fr.json` containing the translated UI strings.
   Then, import and add your dictionary to the `dictionaries` object in `src/lib/i18n.ts`.

### Running Locally for a Specific Language

By default, running `pnpm dev` will start the Spanish (`es`) version. To run the development server for a specific language, prefix the command with the `BUILD_LOCALE` variable:

```bash
BUILD_LOCALE=fr pnpm dev
```

### Building for Production (Cloudflare Pages)

The project is designed to be exported as purely static files (`output: 'export'`). To generate the build for a specific language, set the `BUILD_LOCALE` environment variable during the build process:

```bash
BUILD_LOCALE=fr pnpm build
```

**In Cloudflare Pages:**

When creating the new project, use the following build configuration:

```text
Framework preset: None
Build command: pnpm build
Build output directory: out
Root directory: (leave empty)
```

After creating the project (or during the setup):

- Go to the project **Settings > Environment variables** and add `BUILD_LOCALE` with the value `fr` (or your target language code).
- Go to **Custom domains** and link your language-specific subdomain (e.g., `fr.esdocu.com`).

The build process will automatically use the `BUILD_LOCALE` variable to generate the static files specifically for that language.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

Made with ❤️ for the Hispanic developer community.
