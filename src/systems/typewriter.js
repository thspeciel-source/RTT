import { useEffect, useMemo, useRef, useState } from 'react';

const CHARS_PER_LINE = 32;
const LINES_PER_PAGE = 3;
const MAX_PAGE_CHARS = CHARS_PER_LINE * LINES_PER_PAGE;

/**
 * Splits dialogue text into Pokemon-style pages that fit within
 * LINES_PER_PAGE lines, breaking on word boundaries.
 */
export function paginateText(text) {
  const words = (text || '').split(/\s+/).filter(Boolean);
  const pages = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > MAX_PAGE_CHARS && current) {
      pages.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) pages.push(current);
  return pages.length ? pages : [''];
}

/**
 * Drives Pokemon/Undertale-style char-by-char text reveal with paging.
 * - tap() while a page is still animating completes it instantly.
 * - tap() once a page is fully shown advances to the next page, or
 *   signals completion via isFinished when there are no more pages.
 */
export function useTypewriter(fullText, { speed = 40, onTick } = {}) {
  const pages = useMemo(() => paginateText(fullText), [fullText]);
  const [pageIndex, setPageIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    setPageIndex(0);
    setCharCount(0);
  }, [fullText]);

  useEffect(() => {
    clearInterval(intervalRef.current);
    const pageText = pages[pageIndex] ?? '';
    if (charCount >= pageText.length) return undefined;

    intervalRef.current = setInterval(() => {
      setCharCount((c) => {
        const next = c + 1;
        if (onTick) onTick();
        if (next >= pageText.length) clearInterval(intervalRef.current);
        return next;
      });
    }, speed);

    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pages, speed]);

  const pageText = pages[pageIndex] ?? '';
  const displayedText = pageText.slice(0, charCount);
  const isPageComplete = charCount >= pageText.length;
  const isLastPage = pageIndex >= pages.length - 1;

  function tap() {
    if (!isPageComplete) {
      clearInterval(intervalRef.current);
      setCharCount(pageText.length);
      return { action: 'complete-page' };
    }
    if (!isLastPage) {
      setPageIndex((i) => i + 1);
      setCharCount(0);
      return { action: 'next-page' };
    }
    return { action: 'finished' };
  }

  return { displayedText, isPageComplete, isLastPage, tap, pageCount: pages.length, pageIndex };
}
