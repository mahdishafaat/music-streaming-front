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
];

export const initializeMockDatabase = () => {
  // نکته مهم: برای اینکه دیتای جدید و لیریکس‌ها حتماً اعمال بشن،
  // اینجا دیتای مربوط به آهنگ‌ها و آلبوم‌ها رو با مقادیر جدید بازنویسی (Override) می‌کنیم.
  setStorageItem("artists", mockArtists);
  setStorageItem("albums", mockAlbums);
  setStorageItem("songs", mockSongs);

  // پلی‌لیست‌ها رو فقط اگر وجود نداشتن می‌سازیم تا دیتای کاربر پاک نشه
  const existingPlaylists = getStorageItem("playlists");
  if (!existingPlaylists) {
    setStorageItem("playlists", []);
  }
  console.log("Mock database forcibly updated with lyrics and 5 songs.");
};
