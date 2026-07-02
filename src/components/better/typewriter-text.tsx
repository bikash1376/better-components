"use client"

import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

interface TypewriterTextProps {
  /** One or more strings typed (and deleted) in sequence. */
  words: string[]
  className?: string
  /** Milliseconds per typed character. */
  typeSpeed?: number
  /** Milliseconds per deleted character. */
  deleteSpeed?: number
  /** Pause after a word is fully typed, in ms. */
  holdMs?: number
  /** Loop through the words forever (otherwise stop on the last). */
  loop?: boolean
  /** Hide the blinking caret. */
  hideCaret?: boolean
}

/**
 * TypewriterText — types out words character by character with a blinking
 * caret, deleting between words. Part of the Better Component library.
 */
export function TypewriterText({
  words,
  className,
  typeSpeed = 70,
  deleteSpeed = 40,
  holdMs = 1400,
  loop = true,
  hideCaret = false,
}: TypewriterTextProps) {
  const [index, setIndex] = useState(0)
  const [count, setCount] = useState(0)
  const [deleting, setDeleting] = useState(false)

  const word = words[index % words.length] ?? ""
  const done = !loop && index === words.length - 1 && count === word.length

  useEffect(() => {
    if (!word || done) return
    let delay: number
    if (!deleting) {
      if (count < word.length) delay = typeSpeed
      else {
        delay = holdMs
        // Single word without looping: stay put.
        if (words.length === 1 && !loop) return
      }
    } else {
      delay = deleteSpeed
    }

    const id = setTimeout(() => {
      if (!deleting) {
        if (count < word.length) setCount((c) => c + 1)
        else setDeleting(true)
      } else {
        if (count > 0) setCount((c) => c - 1)
        else {
          setDeleting(false)
          setIndex((i) => (loop ? (i + 1) % words.length : Math.min(i + 1, words.length - 1)))
        }
      }
    }, delay)
    return () => clearTimeout(id)
  }, [count, deleting, word, words.length, typeSpeed, deleteSpeed, holdMs, loop, done])

  return (
    <span className={cn("inline-flex items-baseline", className)}>
      <span className="whitespace-pre">{word.slice(0, count)}</span>
      {!hideCaret && (
        <span
          aria-hidden
          className="ml-px inline-block w-[2px] self-stretch animate-[typewriter-caret_1s_steps(2)_infinite] bg-current"
        />
      )}
      <style>{`@keyframes typewriter-caret { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }`}</style>
    </span>
  )
}
