// src/utils/mockData.ts
import { Song, Album, User } from "@/types";
import { getStorageItem, setStorageItem } from "./storage";

export const mockArtists: User[] = [
  {
    id: "artist_1",
    username: "the_weeknd_mock",
    displayName: "The Weeknd",
    email: "weeknd@mock.com",
    role: "ARTIST",
    subscription: "GOLD",
    followersCount: 1500000,
    followingCount: 12,
    profileImage: "https://i.pravatar.cc/150?u=artist_1",
  },
  {
    id: "artist_2",
    username: "daft_punk_mock",
    displayName: "Daft Punk",
    email: "daft@mock.com",
    role: "ARTIST",
    subscription: "SILVER",
    followersCount: 800000,
    followingCount: 0,
    profileImage: "https://i.pravatar.cc/150?u=artist_2",
  },
];

export const mockAlbums: Album[] = [
  {
    id: "album_1",
    title: "After Hours (Mock)",
    artistId: "artist_1",
    coverImage: "https://picsum.photos/seed/album1/300/300",
    releaseDate: "2020-03-20",
    songIds: ["song_1", "song_2"],
  },
  {
    id: "album_2",
    title: "Discovery (Mock)",
    artistId: "artist_2",
    coverImage: "https://picsum.photos/seed/album2/300/300",
    releaseDate: "2001-03-12",
    songIds: ["song_3"],
  },
];

export const mockSongs: Song[] = [
  {
    id: "song_1",
    title: "Blinding Lights",
    artistId: "artist_1",
    albumId: "album_1",
    coverImage: "https://picsum.photos/seed/album1/300/300",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    streamsCount: 2500000,
    listenersCount: 1200000,
  },
  {
    id: "song_2",
    title: "Save Your Tears",
    artistId: "artist_1",
    albumId: "album_1",
    coverImage: "https://picsum.photos/seed/album1/300/300",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    streamsCount: 1800000,
    listenersCount: 900000,
  },
  {
    id: "song_3",
    title: "Harder, Better, Faster, Stronger",
    artistId: "artist_2",
    albumId: "album_2",
    coverImage: "https://picsum.photos/seed/album2/300/300",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    streamsCount: 3000000,
    listenersCount: 1500000,
  },
];

// این تابع چک می‌کنه که آیا قبلاً داده‌ها تو استوریج ریخته شدن یا نه. اگر نبودن، تزریقشون می‌کنه.
export const initializeMockDatabase = () => {
  const existingSongs = getStorageItem<Song[]>("songs");
  if (!existingSongs || existingSongs.length === 0) {
    setStorageItem("artists", mockArtists);
    setStorageItem("albums", mockAlbums);
    setStorageItem("songs", mockSongs);
    setStorageItem("playlists", []);
    console.log("Mock database initialized successfully.");
  }
};
