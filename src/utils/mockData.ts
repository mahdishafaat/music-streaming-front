// src/utils/mockData.ts
import { Song, Album, Notification, Artist } from "@/types";
import { getStorageItem, setStorageItem } from "./storage";

export const mockArtists: Artist[] = [
  {
    id: "artist_1",
    name: "The Weeknd",
    bio: "Abel Makkonen Tesfaye, known professionally as The Weeknd, is a Canadian singer, songwriter, and record producer. Known for his sonic versatility and dark lyricism, his music explores escapism, romance, and melancholia.",
    imageUrl: "https://i.pravatar.cc/150?u=artist_1",
    isVerified: true,
  },
  {
    id: "artist_2",
    name: "Daft Punk",
    bio: "Daft Punk were a French electronic music duo formed in 1993 in Paris by Guy-Manuel de Homem-Christo and Thomas Bangalter.",
    imageUrl: "https://i.pravatar.cc/150?u=artist_2",
    isVerified: false,
  },
];

export const mockAlbums: Album[] = [
  {
    id: "album_1",
    title: "After Hours (Mock)",
    artistId: "artist_1",
    coverImage: "https://picsum.photos/seed/album1/300/300",
    releaseDate: "2020-03-20",
    songIds: ["song_1", "song_2", "song_4"],
  },
  {
    id: "album_2",
    title: "Discovery (Mock)",
    artistId: "artist_2",
    coverImage: "https://picsum.photos/seed/album2/300/300",
    releaseDate: "2001-03-12",
    songIds: ["song_3", "song_5"],
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
    lyrics: `I've been tryna call
I've been on my own for long enough
Maybe you can show me how to love, maybe
I'm going through withdrawals
You don't even have to do too much
You can turn me on with just a touch, baby

I look around and
Sin City's cold and empty (oh)
No one's around to judge me (oh)
I can't see clearly when you're gone

I said, ooh, I'm blinded by the lights
No, I can't sleep until I feel your touch`,
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
    lyrics: `I saw you dancing in a crowded room
You look so happy when I'm not with you
But then you saw me, caught you by surprise
A single teardrop falling from your eye

I don't know why I run away
I'm sure you could have made me stay
But I ran away`,
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
    lyrics: `Work it, make it, do it, makes us
Harder, better, faster, stronger
More than, hour, hour, never
Ever, after, work is, over

Work it, make it, do it, makes us
Harder, better, faster, stronger`,
  },
  {
    id: "song_4",
    title: "Starboy (Mock Version)",
    artistId: "artist_1",
    albumId: "album_1",
    coverImage: "https://picsum.photos/seed/album1/300/300",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    streamsCount: 4500000,
    listenersCount: 2200000,
    lyrics: `I'm tryna put you in the worst mood, ah
P1 cleaner than your church shoes, ah
Milli point two just to hurt you, ah
All red Lamb' just to tease you, ah
None of these toys on lease too, ah
Made your whole year in a week too, yeah

Look what you've done
I'm a motherfuckin' starboy`,
  },
  {
    id: "song_5",
    title: "Get Lucky (Mock Version)",
    artistId: "artist_2",
    albumId: "album_2",
    coverImage: "https://picsum.photos/seed/album2/300/300",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    streamsCount: 5500000,
    listenersCount: 3200000,
    lyrics: `Like the legend of the phoenix
All ends with beginnings
What keeps the planet spinning
The force from the beginning

We've come too far
To give up who we are
So let's raise the bar
And our cups to the stars`,
  },
  {
    id: "song_6",
    title: "Shape of You (Single)",
    artistId: "artist_1",
    albumId: "", 
    coverImage: "https://picsum.photos/seed/single1/300/300",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    streamsCount: 6500000,
    listenersCount: 4000000,
    lyrics: `The club isn't the best place to find a lover
So the bar is where I go
Me and my friends at the table doing shots
Drinking fast and then we talk slow`,
  },
];

export const mockNotifications: Notification[] = [
  {
    id: 'notif_1',
    userId: 'user_1',
    title: 'Subscription Expiring Soon',
    message: 'Your GOLD subscription will expire in 3 days. Please renew your plan to avoid losing access to premium features.',
    isRead: false,
    type: 'WARNING',
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    targetRole: 'USER',
  },
  {
    id: 'notif_2',
    userId: 'user_1',
    title: 'New Release Available!',
    message: 'Your favorite artist The Weeknd just dropped a new album. Listen to it now!',
    isRead: true,
    type: 'INFO',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    link: '/albums/album_1',
    targetRole: 'USER',
  },
  {
    id: 'notif_3',
    userId: 'artist_1',
    title: 'Account Verified',
    message: 'Congratulations! Your account has been approved as an artist. You now have the "Verified Artist" badge.',
    isRead: false,
    type: 'SUCCESS',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    targetRole: 'ARTIST',
  },
  {
    id: 'notif_4',
    userId: 'admin_1',
    title: 'New Verification Request',
    message: 'User Daft Punk has requested an artist account upgrade. Please review their submitted documents.',
    isRead: false,
    type: 'INFO',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    targetRole: 'ADMIN',
  }
];

export const initializeMockDatabase = () => {
  setStorageItem("artists", mockArtists);
  setStorageItem("albums", mockAlbums);
  setStorageItem("songs", mockSongs);

  const existingNotifs = getStorageItem("notifications");
  if (!existingNotifs) {
    setStorageItem("notifications", mockNotifications);
  }

  const existingPlaylists = getStorageItem("playlists");
  if (!existingPlaylists) {
    setStorageItem("playlists", []);
  }
  console.log("Mock database forcibly updated.");
};