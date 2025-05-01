import React, { useState } from 'react';


interface TooltipProps {
  children: React.ReactNode;
  content: string;
}

const Tooltip: React.FC<TooltipProps> = ({ children, content }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}

      {isVisible && (
        <div className="rounded-2xl border text-card-foreground bg-[rgb(255,255,255)]">
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
