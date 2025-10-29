'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { ProfileImageModal } from './ProfileImageModal';
import { getUserCredits, UserCredits } from '@/lib/services/creditsService';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [credits, setCredits] = useState<UserCredits | null>(null);

  // 크레딧 정보 로드
  useEffect(() => {
    if (user?.id) {
      const userCredits = getUserCredits(user.id);
      setCredits(userCredits);
    }
  }, [user?.id]);

  // 크레딧 새로고침 (이벤트 리스너)
  useEffect(() => {
    const handleCreditsUpdate = () => {
      if (user?.id) {
        const userCredits = getUserCredits(user.id);
        setCredits(userCredits);
      }
    };

    window.addEventListener('credits-updated', handleCreditsUpdate);
    return () => window.removeEventListener('credits-updated', handleCreditsUpdate);
  }, [user?.id]);

  const navigationItems = [
    {
      name: 'AIPixels',
      href: '/',
      icon: (
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm opacity-80"></div>
          </div>
        </div>
      ),
      isBrand: true,
    },
    {
      name: '생성',
      href: '/generate',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
    },
    {
      name: '갤러리',
      href: '/gallery',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: '커뮤니티',
      href: '/feed',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className={cn("w-64 bg-black/90 backdrop-blur-md border-r border-white/10 h-screen flex flex-col", className)}>
      {/* 로고 및 브랜드 */}
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="flex items-center space-x-3">
          {navigationItems[0].icon}
          <span className="text-xl font-bold text-white">AIPixels</span>
        </Link>
      </div>

      {/* 네비게이션 메뉴 */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.slice(1).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-white/20 text-white"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}
            >
              <span className={cn(
                "transition-colors duration-200",
                isActive ? "text-white" : "text-white/70 group-hover:text-white"
              )}>
                {item.icon}
              </span>
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* 하단 사용자 정보 */}
      <div className="p-4 border-t border-white/10 space-y-3">
        {/* 크레딧 정보 - 심플 버전 */}
        {isSignedIn && credits && (
          <div 
            className="flex items-center justify-start p-3 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors group"
            onClick={() => setShowProfileModal(true)}
          >
            <div className="flex items-center space-x-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                credits.credits > 10 ? "bg-blue-500/20" :
                credits.credits > 5 ? "bg-yellow-500/20" :
                "bg-red-500/20"
              )}>
                <svg className={cn(
                  "w-4 h-4",
                  credits.credits > 10 ? "text-blue-400" :
                  credits.credits > 5 ? "text-yellow-400" :
                  "text-red-400"
                )} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
              </div>
              <span className={cn(
                "text-2xl font-bold",
                credits.credits > 10 ? "text-blue-400" :
                credits.credits > 5 ? "text-yellow-400" :
                "text-red-400"
              )}>
                {credits.credits}
              </span>
            </div>
          </div>
        )}

        {/* 프로필 정보 - 심플 버전 */}
        {!isLoaded ? (
          <div className="flex items-center justify-start p-2">
            <div className="w-10 h-10 bg-gray-700 rounded-full animate-pulse"></div>
          </div>
        ) : !isSignedIn ? (
          <Link
            href="/sign-in"
            className="flex items-center justify-center p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <span className="text-sm font-medium text-white">로그인</span>
          </Link>
        ) : (
          <div className="relative">
            <div 
              className="flex items-center justify-start p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer group"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center relative overflow-hidden ring-2 ring-white/10 group-hover:ring-blue-500/50 transition-all">
                {user?.imageUrl || profileImage ? (
                  <img 
                    src={user?.imageUrl || profileImage || ''} 
                    alt={user?.fullName || '프로필'} 
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 프로필 메뉴 */}
            {showProfileMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 rounded-lg border border-white/20 shadow-xl z-50 overflow-hidden">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      signOut(() => router.push('/'));
                    }}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-red-500/20 transition-colors text-left"
                  >
                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-sm text-red-400">로그아웃</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 프로필 이미지 변경 모달 */}
      <ProfileImageModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        currentImage={profileImage || undefined}
        onImageChange={setProfileImage}
        credits={credits}
      />
    </div>
  );
};
