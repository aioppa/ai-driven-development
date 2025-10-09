'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavigationProps {
  className?: string;
}

export function Navigation({ className = '' }: NavigationProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: '메인', icon: '🏠' },
    { href: '/generate', label: '생성', icon: '🎨' },
    { href: '/gallery', label: '갤러리', icon: '🖼️' },
    { href: '/feed', label: '커뮤니티', icon: '👥' },
  ];

  return (
    <nav className={`flex space-x-1 ${className}`}>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
              ${isActive 
                ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm' 
                : 'text-white/70 hover:text-white hover:bg-white/10 backdrop-blur-sm'
              }
            `}
          >
            <span className="text-sm">{item.icon}</span>
            <span className="text-sm">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
