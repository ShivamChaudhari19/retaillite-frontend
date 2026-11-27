import { ReactNode } from 'react';
import { Sidebar } from '@/shared/components/Sidebar';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export const Layout = ({ children, title }: LayoutProps) => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        {title && (
          <header className="bg-card border-b border-border px-2xl py-lg">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          </header>
        )}
        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-2xl">{children}</div>
        </div>
      </main>
    </div>
  );
};
