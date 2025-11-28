import React, { useState, useEffect, RefObject } from 'react';

interface ReadingProgressBarProps {
  targetRef?: RefObject<HTMLElement>;
}

const ReadingProgressBar: React.FC<ReadingProgressBarProps> = ({ targetRef }) => {
  const [width, setWidth] = useState(0);

  const scrollListener = () => {
    // If a target ref is provided and it's attached to an element
    if (targetRef?.current) {
      const element = targetRef.current;
      
      const elementTopInViewport = element.getBoundingClientRect().top;
      
      // The total scrollable distance for the progress bar is the height of the element
      // minus the height of the viewport. This is how far you can scroll from the
      // point where the top of the element hits the top of the screen to the point
      // where the bottom of the element hits the bottom of the screen.
      const scrollableHeight = element.scrollHeight - window.innerHeight;
      
      // The distance scrolled within the element is the negative of its top position
      // relative to the viewport.
      const scrollDistanceInElement = -elementTopInViewport;

      if (scrollableHeight <= 0) {
        // Handle cases where the element is shorter than the viewport
        if (elementTopInViewport < 0) {
            setWidth(100);
        } else {
            setWidth(0);
        }
        return;
      }
      
      const progress = (scrollDistanceInElement / scrollableHeight) * 100;
      
      // Clamp the value between 0 and 100
      setWidth(Math.min(Math.max(progress, 0), 100));

    } else {
      // Fallback to original behavior: track whole page scroll
      const element = document.documentElement;
      const totalHeight = element.scrollHeight - element.clientHeight;
      const windowScroll = element.scrollTop;
      
      if (totalHeight > 0) {
        const progress = (windowScroll / totalHeight) * 100;
        setWidth(progress);
      } else {
        setWidth(0);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", scrollListener);
    window.addEventListener("resize", scrollListener); 
    
    // Initial calculation after mount
    scrollListener();

    return () => {
        window.removeEventListener("scroll", scrollListener);
        window.removeEventListener("resize", scrollListener);
    };
  }, [targetRef]); // Dependency on targetRef ensures this effect re-runs if the ref changes

  return (
    <div className="fixed top-[80px] left-0 w-full h-1 z-50 bg-transparent">
      <div 
        className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-150 ease-out" 
        style={{ width: `${width}%` }}
      ></div>
    </div>
  );
};

export default ReadingProgressBar;
