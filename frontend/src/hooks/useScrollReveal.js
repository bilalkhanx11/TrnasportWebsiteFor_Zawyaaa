import { useEffect } from 'react';

export function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Once visible, stop observing — no need to re-trigger
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    // Small delay so elements are painted before we observe them
    const timer = setTimeout(() => {
      const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
      elements.forEach(el => observer.observe(el));
    }, 50);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []); // Run once on mount
}
