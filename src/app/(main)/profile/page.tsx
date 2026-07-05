// src/app/(main)/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getStorageItem } from '@/utils/storage';
import { Playlist } from '@/types';
import PlaylistCard from '@/components/ui/PlaylistCard';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  // استیت‌های مودال ویرایش پروفایل
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [imageError, setImageError] = useState('');
  
  // استیت‌های مربوط به تغییر عکس پروفایل
  const [tempProfileImage, setTempProfileImage] = useState('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');

  // استیت‌های نمایشی (mock) برای آمار
  const dailyStreams = 142;

  useEffect(() => {
    const loadPlaylists = async () => {
      const storedPlaylists = getStorageItem<Playlist[]>('playlists') || [];
      setUserPlaylists(storedPlaylists);
    };
    loadPlaylists();
  }, []);

  useEffect(() => {
    const initForm = async () => {
      if (user) {
        setEditName(user.displayName);
        setEditUsername(user.username);
        setTempProfileImage(user.profileImage || '');
      }
    };
    initForm();
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Profile successfully updated:\nName: ${editName}\nUsername: ${editUsername}`);
    setIsEditing(false);
  };

  const handleImageUploadClick = () => {
    if (user?.subscription === 'BASE') {
      setImageError('Users with a BASE subscription cannot change their profile picture.');
      setTimeout(() => setImageError(''), 5000);
      return;
    }
    
    // باز کردن مودال برای کاربران مجاز
    setIsImageModalOpen(true);
  };

  const handleSaveImage = () => {
    if (newImageUrl.trim()) {
      setTempProfileImage(newImageUrl);
      // در یک سیستم واقعی، اینجا یک درخواست به بک‌اند برای آپدیت دیتابیس ارسال می‌شود
    }
    setIsImageModalOpen(false);
    setNewImageUrl('');
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Please log in to view your profile</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 pb-10 transition-colors max-w-6xl mx-auto w-full relative">
      
      {/* هدر پروفایل */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 pb-8 border-b border-gray-200 dark:border-gray-800">
        
        {/* بخش عکس پروفایل */}
        <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden shadow-2xl flex-shrink-0 bg-gradient-to-tr from-green-400 to-green-600 border-4 border-white dark:border-gray-900 flex items-center justify-center group">
          {tempProfileImage ? (
            <Image 
              src={tempProfileImage} 
              alt={user.displayName} 
              fill 
              className="object-cover" 
              unoptimized 
            />
          ) : (
            <span className="text-6xl md:text-7xl font-bold text-white uppercase shadow-sm">
              {user.displayName?.[0] || 'U'}
            </span>
          )}
          
          {/* لایه هاور برای تغییر عکس */}
          {isEditing && (
            <div 
              onClick={handleImageUploadClick}
              className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="w-8 h-8 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              <span className="text-white text-xs font-bold">Change Photo</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2 flex-1 text-center md:text-left min-w-0 w-full mt-4 md:mt-0">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Profile • @{user.username}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-gray-900 dark:text-white truncate">
            {user.displayName}
          </h1>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
            <span className="font-bold text-yellow-600 dark:text-yellow-500 text-xs bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full border border-yellow-200 dark:border-yellow-800/50">
              {user.subscription} PLAN
            </span>
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
              {user.followersCount.toLocaleString()} <span className="text-gray-500 font-normal">Followers</span>
            </span>
            <span className="text-gray-300 dark:text-gray-600 hidden sm:inline">•</span>
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
              {user.followingCount.toLocaleString()} <span className="text-gray-500 font-normal">Following</span>
            </span>
            <span className="text-gray-300 dark:text-gray-600 hidden sm:inline">•</span>
            <span className="text-green-600 dark:text-green-400 text-sm font-bold">
              {dailyStreams} <span className="text-gray-500 font-normal text-xs">Daily Streams</span>
            </span>
          </div>
        </div>

        <div className="mt-4 md:mt-0 flex-shrink-0 flex gap-2 items-center">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-6 py-2 rounded-full font-bold text-sm bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-white dark:hover:bg-gray-200 dark:text-black transition-colors"
          >
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
          
          <button
            onClick={handleLogout}
            className="p-2 rounded-full border-2 border-gray-200 dark:border-gray-700 text-gray-500 hover:text-red-500 hover:border-red-500 transition-colors"
            title="Log out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </button>
        </div>
      </div>

      {isEditing && (
        <section className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm animate-fade-in">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Edit Profile Details</h2>
          
          {imageError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded-lg text-sm font-medium">
              {imageError}
            </div>
          )}

          <form onSubmit={handleEditSubmit} className="flex flex-col gap-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
              <input 
                type="text" 
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
              <input 
                type="text" 
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                required
              />
            </div>
            
            <div className="pt-2">
              <button type="submit" className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full transition-colors w-full">
                Save Changes
              </button>
            </div>
          </form>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Public Playlists</h2>
        
        {userPlaylists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
            <svg className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
            </svg>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No playlists yet</h3>
            <p className="text-gray-500 dark:text-gray-400">Head over to the playlists tab to create your first mix.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {userPlaylists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        )}
      </section>

      {/* مودال تغییر عکس پروفایل */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fade-in p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Update Profile Picture</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Please enter the URL of your new profile image.
            </p>
            <input
              type="url"
              placeholder="https://example.com/my-photo.jpg"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
            />
            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={() => {
                  setIsImageModalOpen(false);
                  setNewImageUrl('');
                }}
                className="px-4 py-2 rounded-lg font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveImage}
                className="px-4 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                Save Photo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}