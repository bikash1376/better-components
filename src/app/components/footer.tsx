"use client";

interface FooterProps {
  theme: "light" | "dark";
}

export default function Footer({ theme }: FooterProps) {
  const isPatternDark = theme === "dark";

  return (
    <footer
      className={`w-full py-6 transition-colors duration-300 ${
        isPatternDark ? "text-white" : " dark:text-neutral-200"
      }`}
    >
      <div className="container mx-auto text-center">
        <div
          className={`mx-auto max-w-6xl border-t transition-colors duration-300 ${
            isPatternDark
              ? "border-white/20"
              : "border-gray-300 dark:border-gray-700"
          } pt-6`}
        >
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Better Components. All rights reserved.
          </p>
          <p
            className={`mt-2 text-sm italic transition-colors duration-300 ${
              isPatternDark ? "text-white" : ""
            }`}
          >
            Crafting beautiful patterns
          </p>
        </div>
      </div>
    </footer>
  );
}
