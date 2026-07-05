// src/components/layout/Topbar.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Link from 'next/link';
import { getStorageItem } from '@/utils/storage';
import { Notification } from '@/types';

export default function Topbar() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const syncQuery = async () => {
      const q = searchParams.get('q') || '';
      setQuery(q);
    };
    syncQuery();
  }, [searchParams]);

  // خواندن تعداد اعلانات خوانده نشده
  useEffect(() => {
    const fetchNotifications = () => {
      const notifs = getStorageItem<Notification[]>('notifications') || [];
      // فیلتر کردن اعلاناتی که برای این کاربر است و خوانده نشده‌اند
      // برای تست، فعلا اعلاناتی که به نقش کاربر می‌خورد یا به آیدی او را حساب می‌کنیم
      const unread = notifs.filter(n => !n.isRead && (n.userId === user?.id || n.targetRole === user?.role)).length;
      setUnreadCount(unread);
    };
    
    if (user) {
      fetchNotifications();
    }
  }, [user, pathname]); // با هر بار تغییر مسیر (مثلا رفتن به صفحه اعلانات) دوباره چک می‌شود

  const handleSearchChange = (value: string) => {
    setQuery(value);
    if (value.trim()) {
      router.push(`/search?q=${encodeURIComponent(value)}`);
    } else {
      router.push('/search');
    }
  };

  return (
    <div className="h-full px-6 flex items-center justify-between transition-colors bg-transparent gap-4">
      
      <div className="flex-1 hidden md:block"></div>
      
      <div className="w-full max-w-md relative flex-shrink-0">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        <input
          type="text"
          placeholder="What do you want to listen to?"
          value={query}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => { if (pathname !== '/search') router.push('/search'); }}
          className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700/50 border border-transparent dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-white focus:border-green-500 transition-all text-sm"
        />
      </div>
      
      <div className="flex-1 flex items-center justify-end gap-5 flex-shrink-0">
        <ThemeToggle />
        
        {/* آیکون زنگوله اعلانات */}
        {user && (
          <Link href="/notifications" className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            {/* نقطه قرمز برای نشان دادن تعداد خوانده‌نشده‌ها */}
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white dark:border-gray-900">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        )}
        
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/profile')}>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block">
            {user?.displayName || 'Guest'}
          </span>
          <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 flex items-center justify-center font-bold text-sm border border-green-200 dark:border-green-800">
            {user?.displayName?.[0]?.toUpperCase() || 'G'}
          </div>
        </div>
      </div>

    </div>
  );
}