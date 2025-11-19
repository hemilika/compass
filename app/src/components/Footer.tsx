export const Footer = () => {
  return (
    <footer className="relative border-t border-zinc-200/50 bg-white/50 backdrop-blur-xs dark:border-zinc-800/50 dark:bg-zinc-900/50">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            © 2025 Honeycomb. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <a
              href="/terms"
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="/privacy"
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/support"
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
