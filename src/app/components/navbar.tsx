"use client"

import { Github, Twitter } from "lucide-react"

interface NavbarProps {
  theme: "light" | "dark"
}

export default function Navbar({ theme }: NavbarProps) {
  const isPatternDark = theme === "dark"

  return (
    <nav className="w-full py-6 relative z-50">
      <div className="container flex items-center justify-center mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`w-full max-w-2xl rounded-full px-8 py-5 transition-all duration-500 border ${
          isPatternDark
            ? "bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl shadow-black/20"
            : "bg-white/30 backdrop-blur-xl border-white/40 shadow-2xl shadow-white/20"
        }`}>
          <div className="flex items-center justify-between">
            {/* Brand Name */}
            <div className="flex gap-2">
              <span
                className={`font-serif font-normal tracking-wide transition-colors duration-300 text-xl ${
                  isPatternDark ? "text-white drop-shadow-lg" : "text-gray-800 drop-shadow-sm"
                }`}
                style={{ fontFamily: 'var(--font-instrument-serif' }}
              >
                better components
              </span>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com/bikashtrix"
                target="_blank"
                rel="noopener noreferrer"
                className={`rounded-xl p-3 transition-all duration-300 hover:scale-110 ${
                  isPatternDark 
                    ? "bg-white/10 hover:bg-white/20 text-white border border-white/20" 
                    : "bg-white/30 hover:bg-white/50 text-gray-700 border border-white/40"
                }`}
                aria-label="Twitter"
              >
                <Twitter
                  className={`h-5 w-5 transition-colors duration-300 ${
                    isPatternDark
                      ? "text-white"
                      : "text-gray-700"
                  }`}
                  strokeWidth={2}
                />
              </a>
              <a
                href="https://github.com/bikash-bari"
                target="_blank"
                rel="noopener noreferrer"
                className={`rounded-xl p-3 transition-all duration-300 hover:scale-110 ${
                  isPatternDark 
                    ? "bg-white/10 hover:bg-white/20 text-white border border-white/20" 
                    : "bg-white/30 hover:bg-white/50 text-gray-700 border border-white/40"
                }`}
                aria-label="GitHub"
              >
                <Github
                  className={`h-5 w-5 transition-colors duration-300 ${
                    isPatternDark
                      ? "text-white"
                      : "text-gray-700"
                  }`}
                  strokeWidth={2}
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}