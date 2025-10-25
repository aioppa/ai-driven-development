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
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <div className="w-8 h-8 relative">
                  {/* 간단한 AIPixels 아이콘 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-sm opacity-80"></div>
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
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
