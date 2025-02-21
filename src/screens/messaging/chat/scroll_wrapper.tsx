import React, { useState, useRef, useEffect } from 'react';

interface ScrollWrapperProps {
  fetchMoreMessages: () => void;
  hasMore: boolean;
  isFetching: boolean;
  children: React.ReactNode;
  currentPage: number;
}

const ScrollWrapper: React.FC<ScrollWrapperProps> = ({
  fetchMoreMessages,
  hasMore,
  isFetching,
  children,
  currentPage,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
  const [previousScrollHeight, setPreviousScrollHeight] = useState<number>(0);

  const handleScroll = () => {
    const container = containerRef.current;
    if (container) {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;

      // Check if the user is at the top
      if (scrollTop === 0 && !isFetching && hasMore) {
        fetchMoreMessages();
      }

      // Determine if user is at the bottom
      setIsAtBottom(scrollHeight - scrollTop === clientHeight);

      // Track previous scroll height
      setPreviousScrollHeight(scrollHeight);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [fetchMoreMessages, isFetching, hasMore]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;

      // Calculate dynamic scroll adjustment
      const scrollAdjustment = 10 * (currentPage - 1); // Increase scroll adjustment based on page number

      if (isAtBottom) {
        // Scroll to the bottom if the user was at the bottom
        container.scrollTop = container.scrollHeight;
      } else {
        // Move the scrollbar down by calculated amount when new messages are added while scrolling up
        const newScrollTop = Math.max(
          scrollTop + (scrollHeight - previousScrollHeight) + scrollAdjustment,
          scrollTop + scrollAdjustment
        );
        container.scrollTop = newScrollTop;
      }
    }
  }, [children, isAtBottom, previousScrollHeight, currentPage]); // Trigger scroll adjustment when messages change

  return (
    <div
      ref={containerRef}
      className="w-full h-[calc(100%-140px)] max-md:h-[calc(100%-100px)] thin_scrollbar flex flex-col gap-6 overflow-y-auto"
    >
      {isFetching && (
        <div className="w-full flex-center gap-2 pt-8">
          <div className="w-2 h-2 rounded-full bg-primary_comp_active animate-bounce"></div>
          <div className="w-2 h-2 rounded-full bg-primary_comp_active animate-bounce [animation-delay:-.3s]"></div>
          <div className="w-2 h-2 rounded-full bg-primary_comp_active animate-bounce [animation-delay:-.5s]"></div>
        </div>
      )}
      {children}
    </div>
  );
};

export default ScrollWrapper;
