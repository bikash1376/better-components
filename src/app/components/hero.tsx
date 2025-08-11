"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Github, Copy, Eye, Code2, Zap } from "lucide-react";
import Image from "next/image";
import { Instrument_Serif } from "next/font/google";
import { useState, useEffect } from "react";

interface HeroProps {
  activePattern?: string | null;
  setActivePattern?: (pattern: string | null) => void;
  theme: "light" | "dark";
}
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-instrument-serif",
});

const handleBrowsePatternsClick = () => {
  document.getElementById("pattern-showcase")?.scrollIntoView({
    behavior: "smooth",
  });
};

export default function Hero({ theme }: HeroProps) {
  const isPatternDark = theme === "dark";
  const [blurIndex, setBlurIndex] = useState(0);
  const [blurIntensity, setBlurIntensity] = useState(0);

  // Company names for the blur effect
  const companies = ["vercel", "yc", "a16z"];

  // Blur intensities for different effects
  const blurLevels = [0, 2, 4, 8, 12, 8, 4, 2, 0];

  useEffect(() => {
    // Change blur intensity every 2 seconds
    const blurInterval = setInterval(() => {
      setBlurIntensity((prev) => (prev + 1) % blurLevels.length);
    }, 2000);

    // Change company name every 3 seconds
    const companyInterval = setInterval(() => {
      setBlurIndex((prev) => (prev + 1) % companies.length);
    }, 3000);

    return () => {
      clearInterval(blurInterval);
      clearInterval(companyInterval);
    };
  }, []);

  return (
    <section className="container py-8 sm:py-12 md:py-16 lg:py-18 text-center relative overflow-hidden px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="mx-auto max-w-6xl relative z-10">
        {/* Badge */}
        <div className="mb-6 sm:mb-8 md:mb-10 flex justify-center">
          <a
            href="https://github.com/bikash-bari/better-components"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex"
          >
            <Badge
              variant="secondary"
              className={`gap-2 py-2 px-3 sm:px-4 text-xs sm:text-sm rounded-full shadow-lg backdrop-blur-md transition-all duration-300 border ${isPatternDark
                  ? "bg-black/40 border-white/20 text-white hover:bg-black/50"
                  : "bg-white/80 border-gray-200/50 text-gray-900 hover:bg-white/90"
                }`}
            >
              <div className="relative flex justify-center items-center h-2 w-2">
                <span className="">🎉</span>
              </div>
              <span className="font-medium">Not Backed By</span>
              <span className="inline-flex items-center">
                <p
                  className="transition-all duration-1000 ease-in-out w-16 text-center"
                  style={{
                    filter: `blur(${blurLevels[blurIntensity]}px)`,
                    opacity: blurLevels[blurIntensity] > 6 ? 0.3 : 1
                  }}
                >
                  {companies[blurIndex]}
                </p>
              </span>
              <ArrowRight className="h-3 w-3" />
            </Badge>
          </a>
        </div>

        {/* Main heading */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-5xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-1 sm:mb-3">
            <span
              className={`font-medium transition-colors duration-300 font-serif ${isPatternDark ? "text-white" : "text-gray-900 dark:text-gray-50"
                }`}
              style={{ fontFamily: 'var(--font-instrument-serif)' }}
            >
              Better <i className="px-[8px] bg-gradient-to-l from-indigo-500 via-red-500 to-blue-500 text-transparent bg-clip-text">Components</i>
              
            </span>
          </h1>
          <h2 className="text-[2.9rem] sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-1 sm:mb-3">
            <span
              className={`font-medium transition-colors duration-300 font-serif ${isPatternDark ? "text-white" : "text-gray-900 dark:text-gray-50"
                }`}
              style={{ fontFamily: 'var(--font-instrument-serif)' }}
            >
              for a Better Frontend
            </span>
          </h2>
        </div>

        {/* Description */}
        <p
          className={`text-base font-normal sm:text-lg mb-6 sm:mb-8 max-w-lg mx-auto leading-relaxed transition-colors duration-300 px-4 sm:px-0 ${isPatternDark ? "text-gray-400" : "text-gray-600 dark:text-gray-200"
            }`}
        >
          Streamline your frontend with elegant components that just work.

          Crafted with modern CSS and Tailwind
        </p>

        {/* Feature highlights */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mb-10 sm:mb-2 max-w-4xl mx-auto px-4 sm:px-0">
          {/* One-Click Copy Badge */}
          {/* <div
    className={`flex items-center gap-3 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full transition-all duration-300 border w-full sm:w-auto ${
      isPatternDark
        ? "bg-black/20 border-white/10"
        : "bg-gray-100 border-gray-200"
    }`}
  >
    <div
      className={`p-1.5 rounded-md transition-colors duration-300 ${
        isPatternDark ? "bg-violet-500/10" : "bg-violet-200"
      }`}
    >
      <Copy
        className={`h-4 sm:h-5 w-4 sm:w-5 transition-colors duration-300 ${
          isPatternDark ? "text-violet-300" : "text-violet-700"
        }`}
      />
    </div>
    <div className="text-left">
      <h3
        className={`font-medium text-sm transition-colors duration-300 ${
          isPatternDark ? "text-white" : "text-gray-800"
        }`}
      >
        One-Click Copy
      </h3>
      <p
        className={`text-xs transition-colors duration-300 ${
          isPatternDark ? "text-gray-300" : "text-gray-600"
        }`}
      >
        Ready-to-use CSS code
      </p>
    </div>
  </div> */}

          {/* Live Preview Badge */}
          {/* <div
    className={`flex items-center gap-3 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full transition-all duration-300 border w-full sm:w-auto ${
      isPatternDark
        ? "bg-black/20 border-white/10"
        : "bg-gray-100 border-gray-200"
    }`}
  >
    <div
      className={`p-1.5 rounded-md transition-colors duration-300 ${
        isPatternDark ? "bg-pink-500/10" : "bg-pink-200"
      }`}
    >
      <Eye
        className={`h-4 sm:h-5 w-4 sm:w-5 transition-colors duration-300 ${
          isPatternDark ? "text-pink-300" : "text-pink-700"
        }`}
      />
    </div>
    <div className="text-left">
      <h3
        className={`font-medium text-sm transition-colors duration-300 ${
          isPatternDark ? "text-white" : "text-gray-800"
        }`}
      >
        Live Preview
      </h3>
      <p
        className={`text-xs transition-colors duration-300 ${
          isPatternDark ? "text-gray-300" : "text-gray-600"
        }`}
      >
        See patterns in action
      </p>
    </div>
  </div> */}
        </div>


        {/* CTA buttons */}
        <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0 ${instrumentSerif.className}`}>
          <Button
            size="lg"
            className={`cursor-pointer gap-2 px-16 sm:px-8 sm:py-6 py-3 text-base sm:text-lg font-medium rounded-2xl shadow-lg transition-all duration-300 flex-1 sm:flex-none   ${isPatternDark
                ? "bg-white text-black hover:bg-gray-100"
                : "bg-slate-950 hover:bg-slate-900 dark:bg-white dark:text-black dark:hover:bg-gray-100"
              }`}
            onClick={() => {
              window.open(
                "https://github.com/bikash-bari/better-components#contributing",
                "_blank"
              );
            }}
          >
                  <Code2 className="h-4 sm:h-5 w-4 sm:w-5" />
              Get Started  
          </Button>
          <Button
            size="lg"
            className={`cursor-pointer gap-2 px-4 sm:px-8 sm:py-6 py-3 text-base sm:text-lg font-medium shadow-lg   transition-all duration-300 rounded-2xl flex-1 sm:flex-none ${isPatternDark
                ? "bg-slate-950 text-white hover:bg-slate-900"
                : "bg-white text-black hover:bg-gray-100"
              }`}
            onClick={handleBrowsePatternsClick}
          >
            <Github className="h-4 sm:h-5 w-4 sm:w-5" />
      
            Contribute
          </Button>
        </div>

        {/* Stats */}
        <div
          className={`flex items-center justify-center gap-6 sm:gap-8 md:gap-12 mt-12 sm:mt-16 md:mt-18 pt-6 sm:pt-8 border-t transition-all duration-300 ${isPatternDark
              ? "border-white/20"
              : "border-gray-300 dark:border-gray-700"
            }`}
        >
          {/* <div className="text-center">
            <div
              className={`text-xl sm:text-2xl font-bold transition-colors duration-300 ${isPatternDark ? "text-white" : ""
                }`}
            >
              100+
            </div>
            <div
              className={`text-xs sm:text-sm transition-colors duration-300 ${isPatternDark ? "text-gray-300" : ""
                }`}
            >
              Patterns
            </div>
          </div> */}
          <div className="text-center">
            <div
              className={`text-xl sm:text-2xl font-bold transition-colors duration-300 ${isPatternDark ? "text-white" : ""
                }`}
            >
              {/* 100% */}
            </div>
            <div
              className={`text-xs sm:text-sm transition-colors duration-300 ${isPatternDark ? "text-gray-300" : ""
                }`}
            >
              scroll
              <br />
              <span className="mt-2 inline-block animate-bounce">
📜
              </span>
              
            </div>
          </div>
          {/* <div className="text-center">
            <div
              className={`text-xl sm:text-2xl font-bold transition-colors duration-300 ${isPatternDark ? "text-white" : ""
                }`}
            >
              CSS
            </div>
            <div
              className={`text-xs sm:text-sm transition-colors duration-300 ${isPatternDark ? "text-gray-300" : ""
                }`}
            >
              & Tailwind
            </div>
          </div> */}
        </div>
      </div>
    </section>
  );
}
