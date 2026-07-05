// src/app/(main)/artists/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { usePlayer } from '@/context/PlayerContext';
import { getStorageItem } from '@/utils/storage';
import { Artist, Album, Song } from '@/types';
import AlbumCard from '@/components/ui/AlbumCard';

export default function ArtistProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { playSong } = usePlayer();

  const [artist, setArtist] = useState<Artist | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [singles, setSingles] = useState<Song[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // استیت جدید برای نگهداری آمار واقعی هنرمند
  const [stats, setStats] = useState({ listeners: 0, streams: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const allArtists = getStorageItem<Artist[]>('artists') || [];
      const currentArtist = allArtists.find(a => a.id === id);

      if (currentArtist) {
        setArtist(currentArtist);

        const allAlbums = getStorageItem<Album[]>('albums') || [];
        const artistAlbums = allAlbums.filter(al => al.artistId === id);
        setAlbums(artistAlbums);

        const allSongs = getStorageItem<Song[]>('songs') || [];
        const artistSongs = allSongs.filter(s => s.artistId === id);
        const artistSingles = artistSongs.filter(s => !s.albumId);
        setSingles(artistSingles);

        // محاسبه آمار واقعی از روی تمام آهنگ‌های این هنرمند
        const totalStreams = artistSongs.reduce((sum, song) => sum + (song.streamsCount || 0), 0);
        const totalListeners = artistSongs.reduce((sum, song) => sum + (song.listenersCount || 0), 0);
        setStats({ streams: totalStreams, listeners: totalListeners });

        setIsFollowing(false); 
      }
      setLoading(false);
    };

    fetchData();
  }, [id]);

  const handleToggleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const handlePlayAll = () => {
    if (singles.length > 0) {
      playSong(singles[0], singles);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]">Loading artist data...</div>;
  }

  if (!artist) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Artist not found</h2>
        <p className="text-gray-500">The artist you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 pb-12 transition-colors max-w-6xl mx-auto w-full">
      
      <div className="relative h-[40vh] md:h-[50vh] min-h-[300px] w-full rounded-3xl overflow-hidden shadow-lg group">
        <Image 
          src={artist.imageUrl || 'https://images.unsplash.com/photo-1516280440502-86927d2c3dfb?auto=format&fit=crop&q=80'} 
          alt={artist.name} 
          fill 
          className="object-cover transition-transform duration-700 group-hover:scale-105" 
          unoptimized 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 flex flex-col md:flex-row items-end justify-between gap-6">
          <div className="flex flex-col gap-3">
            {artist.isVerified && (
              <div className="flex items-center gap-1.5 text-blue-400 bg-blue-500/10 backdrop-blur-md px-3 py-1 rounded-full w-fit">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                <span className="text-sm font-bold tracking-wide">Verified Artist</span>
              </div>
            )}
            
            <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-lg tracking-tight">
              {artist.name}
            </h1>
            
            <p className="text-gray-300 max-w-2xl text-sm md:text-base line-clamp-2 md:line-clamp-3">
              {artist.bio}
            </p>
          </div>
          
          <div className="flex items-center gap-4 shrink-0 w-full md:w-auto">
            <button 
              onClick={handlePlayAll}
              className="w-14 h-14 bg-green-500 hover:bg-green-400 hover:scale-105 text-white rounded-full flex items-center justify-center shadow-xl transition-all"
            >
              <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </button>
            <button 
              onClick={handleToggleFollow}
              className={`px-6 py-2.5 rounded-full font-bold text-sm border-2 transition-colors ${
                isFollowing 
                  ? 'border-gray-500 text-gray-300 hover:border-white hover:text-white' 
                  : 'border-white text-white hover:bg-white hover:text-black'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        
        <div className="flex-1 flex flex-col gap-10">
          
          {singles.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Popular Singles</h2>
              <div className="flex flex-col gap-2">
                {singles.map((song, index) => (
                  <div 
                    key={song.id}
                    onClick={() => playSong(song, singles)}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group"
                  >
                    <span className="w-5 text-center text-gray-400 font-medium group-hover:hidden">{index + 1}</span>
                    <button className="w-5 hidden group-hover:block text-green-500"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></button>
                    
                    {song.coverImage && (
                      <div className="relative w-10 h-10 rounded shrink-0 overflow-hidden">
                        <Image src={song.coverImage} alt={song.title} fill className="object-cover" unoptimized />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-gray-900 dark:text-white font-medium truncate">{song.title}</h4>
                      <p className="text-sm text-gray-500 truncate">{artist.name}</p>
                    </div>
                    
                    <span className="text-sm text-gray-400 shrink-0">{song.streamsCount?.toLocaleString()} streams</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {albums.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Albums</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {albums.map((album) => (
                  <AlbumCard key={album.id} album={album} artistName={artist.name} />
                ))}
              </div>
            </section>
          )}

        </div>

        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 sticky top-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Artist Stats</h3>
            
            {user?.subscription === 'GOLD' ? (
              <div className="flex flex-col gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Monthly Listeners</p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white">
                    {stats.listeners.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Streams</p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white">
                    {stats.streams.toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-center border border-dashed border-gray-300 dark:border-gray-600">
                <svg className="w-10 h-10 text-yellow-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">Premium Insight</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Upgrade to GOLD to see detailed listener statistics and streaming data.</p>
                <button className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs rounded-full transition-colors w-full">
                  Upgrade Plan
                </button>
              </div>
            )}
            
          </div>
        </div>

      </div>
    </div>
  );
}