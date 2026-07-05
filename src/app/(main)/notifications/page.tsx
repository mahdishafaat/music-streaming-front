// src/app/(main)/notifications/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getStorageItem, setStorageItem } from '@/utils/storage';
import { Notification } from '@/types';
import Link from 'next/link';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // دریافت اعلانات با ساختار استاندارد برای رفع خطای ESLint
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      
      const allNotifs = getStorageItem<Notification[]>('notifications') || [];
      
      // در محیط توسعه برای اینکه بتوانیم پنل را تست کنیم، فعلاً تمام اعلانات را نمایش می‌دهیم.
      const userNotifs = [...allNotifs]; 

      userNotifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setNotifications(userNotifs);
    };

    fetchNotifications();
  }, [user]);

  const saveToStorage = (updatedUserNotifs: Notification[]) => {
    setNotifications(updatedUserNotifs);
    const allNotifs = getStorageItem<Notification[]>('notifications') || [];
    
    const updatedAllNotifs = allNotifs.map(notif => {
      const updatedMatch = updatedUserNotifs.find(un => un.id === notif.id);
      return updatedMatch ? updatedMatch : notif;
    });
    
    const finalAllNotifs = updatedAllNotifs.filter(notif => {
      // چون فعلاً همه را نشان می‌دهیم، اگر در لیست آپدیت‌شده نبود یعنی حذف شده است
      const existsInView = updatedUserNotifs.find(un => un.id === notif.id);
      return existsInView !== undefined;
    });

    setStorageItem('notifications', finalAllNotifs);
  };

  const handleMarkAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    saveToStorage(updated);
  };

  const handleMarkAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    saveToStorage(updated);
  };

  const handleDelete = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    saveToStorage(updated);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Please log in to view notifications.</h2>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full pb-10 transition-colors">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}.
          </p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
          <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">You&apos;re all caught up!</h2>
          <p className="text-gray-500 dark:text-gray-400">No new notifications at the moment.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`relative p-5 rounded-xl border transition-all ${
                notif.isRead 
                  ? 'bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700' 
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50 shadow-sm'
              }`}
            >
              {!notif.isRead && (
                <div className="absolute top-6 left-5 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
              )}
              
              <div className="flex flex-col sm:flex-row justify-between gap-4 pl-6">
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-bold text-lg ${notif.isRead ? 'text-gray-800 dark:text-gray-200' : 'text-gray-900 dark:text-white'}`}>
                      {notif.title}
                    </h3>
                    {notif.type === 'WARNING' && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">Important</span>}
                    {notif.type === 'SUCCESS' && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Success</span>}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-2">
                    {notif.message}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-gray-400 dark:text-gray-500">{formatDate(notif.createdAt)}</span>
                    
                    {notif.link && (
                      <Link href={notif.link} className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                        View Details →
                      </Link>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col justify-end gap-2 shrink-0">
                  {!notif.isRead && (
                    <button 
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:hover:bg-blue-900/60 rounded-lg transition-colors"
                    >
                      Mark as Read
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(notif.id)}
                    className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-red-600 bg-gray-100 hover:bg-red-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
      
    </div>
  );
}