import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className = "" }: CardProps) => {
  return (
    <div
      className={`
        bg-white dark:bg-zinc-900 
        border border-zinc-200 dark:border-zinc-800 
        rounded-xl shadow-sm 
        ${className}
      `.trim()}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader = ({ children, className = "" }: CardHeaderProps) => {
  return <div className={`p-6 pb-4 ${className}`.trim()}>{children}</div>;
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent = ({ children, className = "" }: CardContentProps) => {
  return <div className={`px-6 pb-6 ${className}`.trim()}>{children}</div>;
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter = ({ children, className = "" }: CardFooterProps) => {
  return (
    <div
      className={`px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-b-xl border-t border-zinc-200 dark:border-zinc-800 ${className}`.trim()}
    >
      {children}
    </div>
  );
};
