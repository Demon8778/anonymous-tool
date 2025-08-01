"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
  searchTerm: string;
}

export const POPULAR_CATEGORIES: Category[] = [
  {
    id: "happy",
    name: "Happy",
    emoji: "😊",
    color: "bg-yellow-500",
    searchTerm: "happy celebration",
  },
  {
    id: "excited",
    name: "Excited",
    emoji: "🎉",
    color: "bg-purple-500",
    searchTerm: "excited party",
  },
  {
    id: "thumbs-up",
    name: "Thumbs Up",
    emoji: "👍",
    color: "bg-green-500",
    searchTerm: "thumbs up approval",
  },
  {
    id: "dancing",
    name: "Dancing",
    emoji: "💃",
    color: "bg-pink-500",
    searchTerm: "dancing party",
  },
  {
    id: "funny",
    name: "Funny",
    emoji: "😂",
    color: "bg-blue-500",
    searchTerm: "funny comedy",
  },
  {
    id: "love",
    name: "Love",
    emoji: "❤️",
    color: "bg-red-500",
    searchTerm: "love heart",
  },
  {
    id: "surprised",
    name: "Surprised",
    emoji: "😲",
    color: "bg-orange-500",
    searchTerm: "surprised shocked",
  },
  {
    id: "cool",
    name: "Cool",
    emoji: "😎",
    color: "bg-indigo-500",
    searchTerm: "cool awesome",
  },
  {
    id: "sad",
    name: "Sad",
    emoji: "😢",
    color: "bg-gray-500",
    searchTerm: "sad crying",
  },
  {
    id: "angry",
    name: "Angry",
    emoji: "😠",
    color: "bg-red-600",
    searchTerm: "angry mad",
  },
];

interface CategoryCarouselProps {
  onCategorySelect: (searchTerm: string) => void;
  className?: string;
}

export function CategoryCarousel({ onCategorySelect, className }: CategoryCarouselProps) {
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [clickedCategory, setClickedCategory] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoScrolling || !scrollContainerRef.current) return;

    const startAutoScroll = () => {
      autoScrollIntervalRef.current = setInterval(() => {
        if (scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          const scrollAmount = 2; // Pixels per interval
          
          // Scroll right
          container.scrollLeft += scrollAmount;
          
          // Reset to beginning when reaching the end
          if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
            container.scrollLeft = 0;
          }
        }
      }, 50); // 50ms interval for smooth animation
    };

    startAutoScroll();

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, [isAutoScrolling]);

  // Stop auto-scroll on hover
  const handleMouseEnter = () => {
    setIsAutoScrolling(false);
  };

  // Resume auto-scroll on mouse leave
  const handleMouseLeave = () => {
    setIsAutoScrolling(true);
  };

  // Handle category click with animation
  const handleCategoryClick = (category: Category) => {
    setClickedCategory(category.id);
    
    // Trigger pulse animation and then call the search
    setTimeout(() => {
      onCategorySelect(category.searchTerm);
      setClickedCategory(null);
    }, 200);
  };

  // Handle category hover
  const handleCategoryHover = (categoryId: string | null) => {
    setHoveredCategory(categoryId);
  };

  return (
    <div 
  className={cn("relative overflow-hidden py-6", className)}
  onMouseEnter={handleMouseEnter}
  onMouseLeave={handleMouseLeave}
  data-testid="category-carousel"
>
  {/* Gradient overlays for scroll fade */}
  <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background via-background/80 to-transparent z-10 pointer-events-none" />
  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none" />

  {/* Scrollable container */}
  <div
    ref={scrollContainerRef}
    className="flex gap-4 overflow-x-auto px-8 scrollbar-hide"
    style={{
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    }}
  >
    {[...POPULAR_CATEGORIES, ...POPULAR_CATEGORIES].map((category, index) => {
      const uniqueKey = `${category.id}-${index}`;
      const isHovered = hoveredCategory === category.id;
      const isClicked = clickedCategory === category.id;

      return (
        <motion.div
          key={uniqueKey}
          className={cn(
            "flex-shrink-0 relative px-6 py-3 rounded-full cursor-pointer select-none transition-all duration-300 font-medium shadow-lg",
            "hover:shadow-xl active:shadow-md focus:outline-none focus:ring-2 focus:ring-ring",
            category.color,
            "text-background" // Supports dark/light theme text
          )}
          initial={{ scale: 1, y: 0 }}
          whileHover={{
            scale: 1.1,
            y: -2,
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            transition: { duration: 0.2 }
          }}
          whileTap={{
            scale: 0.95,
            transition: { duration: 0.1 }
          }}
          animate={isClicked ? {
            scale: [1, 1.2, 1],
            transition: { duration: 0.3, times: [0, 0.5, 1] }
          } : {}}
          onClick={() => handleCategoryClick(category)}
          onMouseEnter={() => handleCategoryHover(category.id)}
          onMouseLeave={() => handleCategoryHover(null)}
        >
          <div className="flex items-center gap-2 z-10 relative">
            <motion.span 
              className="text-lg"
              animate={isHovered ? {
                rotate: [0, -10, 10, -10, 0],
                transition: { duration: 0.5 }
              } : {}}
            >
              {category.emoji}
            </motion.span>
            <span className="text-sm font-semibold whitespace-nowrap">
              {category.name}
            </span>
          </div>

          {/* Hover glow */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="absolute inset-0 rounded-full bg-foreground/10"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      );
    })}
  </div>

  {/* Instructions */}
  <motion.div 
    className="text-center mt-4"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5, duration: 0.3 }}
  >
    <p className="text-sm text-muted-foreground">
      Click a category to search for popular GIFs
    </p>
  </motion.div>
</div>
  );
}

export default CategoryCarousel;