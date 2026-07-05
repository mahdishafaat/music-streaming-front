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
  // استیت برای نگه‌داری تنظیمات کاربر
  const [notificationSetting, setNotificationSetting] = useState('all');

  // خواندن تنظیمات کاربر از لوکال استوریج
  useEffect(() => {
    const loadSettings = async () => {
      const savedSetting = localStorage.getItem('app_notifications');
      if (savedSetting) {
        setNotificationSetting(savedSetting);
      }
    };

    loadSettings();
  }, []);

  // دریافت و فیلتر کردن اعلانات
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      
      const allNotifs = getStorageItem<Notification[]>('notifications') || [];
      const userNotifs = [...allNotifs]; 

      userNotifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // اعمال فیلتر بر اساس تنظیمات کاربر
      let filteredNotifs = userNotifs;
      
      if (notificationSetting === 'none') {
        // اگر کلا قطع کرده باشه، هیچی نشون نمی‌دیم
        filteredNotifs = [];
      } else if (notificationSetting === 'mentions') {
        // اگر فقط مهم‌ها رو بخواد، مثلاً فقط WARNING ها و ERROR ها رو نشون می‌دیم
        filteredNotifs = userNotifs.filter(n => n.type === 'WARNING' || n.type === 'ERROR');
      }
      
      setNotifications(filteredNotifs);
    };

    fetchNotifications();
  }, [user, notificationSetting]); // اضافه کردن notificationSetting به دپندنسی‌ها

  const saveToStorage = (updatedUserNotifs: Notification[]) => {
    setNotifications(updatedUserNotifs);
    const allNotifs = getStorageItem<Notification[]>('notifications') || [];
    
    const updatedAllNotifs = allNotifs.map(notif => {
      const updatedMatch = updatedUserNotifs.find(un => un.id === notif.id);
      return updatedMatch ? updatedMatch : notif;
    });
    
    const finalAllNotifs = updatedAllNotifs.filter(notif => {
      // فقط در صورتی چک می‌کنیم که در لیست نمایشی بوده باشه (برای جلوگیری از حذف اشتباهی در حالت فیلتر)
      const existsInView = updatedUserNotifs.find(un => un.id === notif.id);
      
      // اگر تنظیمات فیلتر روشنه و این اعلان تو نمای فعلی نیست، نباید پاکش کنیم!
      if (notificationSetting !== 'all' && !existsInView) {
          // اگر این اعلان شرایط فیلتر فعلی رو داره و تو لیست نیست، یعنی کاربر حذفش کرده
          if (
            (notificationSetting === 'mentions' && (notif.type === 'WARNING' || notif.type === 'ERROR')) ||
            notificationSetting === 'none'
          ) {
              return false;
          }
          // در غیر این صورت، نگهش می‌داریم چون تو یه فیلتر دیگه ممکنه باشه
          return true;
      }
      
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
            {notificationSetting === 'none' 
              ? 'Notifications are currently muted.'
              : `You have ${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}.`
            }
          </p>
        </div>
        {unreadCount > 0 && notificationSetting !== 'none' && (
          <button 
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notificationSetting === 'none' ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
           <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.114 5.636a9 9 0 011.83 2.14M5.057 5.636A9 9 0 003.227 7.776M19.114 5.636l-14.057 12.728M19.114 5.636L5.057 18.364M3.227 7.776A9 9 0 005.057 18.364" />
          </svg>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Notifications Muted</h2>
          <p className="text-gray-500 dark:text-gray-400">You can change this in your Settings.</p>
        </div>
      ) : notifications.length === 0 ? (
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