'use client';

import Link from 'next/link';
import { Navigation } from './Navigation';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showNavigation?: boolean;
  className?: string;
  rightContent?: React.ReactNode;
}

export function Header({ 
  title = 'AIPixels', 
  subtitle, 
  showNavigation = true,
  className = '',
  rightContent
}: HeaderProps) {
  return (
    <header className={`relative backdrop-blur-md bg-white/10 border-b border-white/20 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 로고 및 제목 */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#3A6BFF] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <h1 className="text-2xl font-bold text-white">{title}</h1>
              {subtitle && (
                <span className="text-white/70 text-sm">{subtitle}</span>
              )}
            </Link>
          </div>

          {/* 네비게이션 및 우측 콘텐츠 */}
          <div className="flex items-center space-x-4">
            {showNavigation && (
              <div className="hidden md:block">
                <Navigation />
              </div>
            )}
            {rightContent && (
              <div className="flex items-center">
                {rightContent}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
