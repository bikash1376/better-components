"use client"

import { Github, Twitter } from "lucide-react"
import Image from "next/image"

interface NavbarProps {
  theme: "light" | "dark"
}

export default function Navbar({ theme }: NavbarProps) {
  const isPatternDark = theme === "dark"

  return (
    <nav className="w-full py-6">
      <div className="container flex items-center justify-center mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`w-full max-w-2xl rounded-full px-6 py-4 shadow-lg backdrop-blur-md transition-all duration-300 border ${
          isPatternDark
            ? "bg-black/40 border-white/20"
            : "bg-white/80 border-gray-200/50"
        }`}>
          <div className="flex items-center justify-between">
            {/* Brand Name */}
        <div className="flex gap-2">

        
            {/* <Image
            src="/images/image.png"
            alt="Better Components Logo"
            width={150}
            height={40}
            className="h-10 w-auto"
          /> */}
            <span
              className={`font-serif font-normal tracking-wide transition-colors duration-300 text-lg ${
                isPatternDark ? "text-white" : "text-gray-700"
              }`}
              style={{ fontFamily: 'var(--font-instrument-serif' }}
            >
              better components
            </span>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-6">
              {/* <a
                href="#"
                className={`font-medium transition-colors duration-300 text-sm ${
                  isPatternDark ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                about
              </a> */}
              <a
            href="https://twitter.com/bikashtrix"
            target="_blank"
            rel="noopener noreferrer"
            className={`rounded-full p-1.5 sm:p-2 transition-all duration-300 ${isPatternDark ? "hover:bg-white/10" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            aria-label="Twitter"
          >
            <Twitter
              className={`h-5 w-5 sm:h-6 sm:w-6 transition-colors duration-300 ${isPatternDark
                ? "text-white hover:text-neutral-300"
                : "text-neutral-800 hover:text-neutral-600 dark:text-neutral-200 dark:hover:text-neutral-400"
                }`}
              strokeWidth={1.5}
            />
          </a>
          <a
            href="https://github.com/bikash-bari"
            target="_blank"
            rel="noopener noreferrer"
            className={`rounded-full p-1.5 sm:p-2 transition-all duration-300 ${isPatternDark ? "hover:bg-white/10" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            aria-label="GitHub"
          >
            <Github
              className={`h-5 w-5 sm:h-6 sm:w-6 transition-colors duration-300 ${isPatternDark
                ? "text-white hover:text-neutral-300"
                : "text-neutral-800 hover:text-neutral-600 dark:text-neutral-200 dark:hover:text-neutral-400"
                }`}
              strokeWidth={1.5}
            />
          </a>
            </div>
          </div>
        </div>

        {/* Social Icons - Positioned outside the navbar container */}
        {/* <div className="absolute right-4 sm:right-6 lg:right-8 flex items-center gap-2">
          <a
            href="https://twitter.com/bikashtrix"
            target="_blank"
            rel="noopener noreferrer"
            className={`rounded-full p-1.5 sm:p-2 transition-all duration-300 ${isPatternDark ? "hover:bg-white/10" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            aria-label="Twitter"
          >
            <Twitter
              className={`h-5 w-5 sm:h-6 sm:w-6 transition-colors duration-300 ${isPatternDark
                ? "text-white hover:text-neutral-300"
                : "text-neutral-800 hover:text-neutral-600 dark:text-neutral-200 dark:hover:text-neutral-400"
                }`}
              strokeWidth={1.5}
            />
          </a>
          <a
            href="https://github.com/bikash-bari"
            target="_blank"
            rel="noopener noreferrer"
            className={`rounded-full p-1.5 sm:p-2 transition-all duration-300 ${isPatternDark ? "hover:bg-white/10" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            aria-label="GitHub"
          >
            <Github
              className={`h-5 w-5 sm:h-6 sm:w-6 transition-colors duration-300 ${isPatternDark
                ? "text-white hover:text-neutral-300"
                : "text-neutral-800 hover:text-neutral-600 dark:text-neutral-200 dark:hover:text-neutral-400"
                }`}
              strokeWidth={1.5}
            />
          </a>
        </div> */}
      </div>
    </nav>
  )
}