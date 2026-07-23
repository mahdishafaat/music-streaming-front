import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import SongCard from "./SongCard";
import { Song } from "@/types";
import { usePlayer } from "@/context/PlayerContext";

vi.mock("@/context/PlayerContext", () => ({
  usePlayer: vi.fn(),
}));

const mockSong: Song = {
  id: "song-1",
  title: "Test Song",
  artistId: "artist-1",
  audioUrl: "/audio/test.mp3",
  coverImage: "/cover.png",
  streamsCount: 100,
  listenersCount: 50,
};

const mockUsePlayer = usePlayer as unknown as vi.Mock;

describe("SongCard", () => {
  beforeEach(() => {
    mockUsePlayer.mockReturnValue({
      playSong: vi.fn(),
      currentSong: null,
      isPlaying: false,
      togglePlay: vi.fn(),
    });
  });

  it("renders song title and artist name", () => {
    render(<SongCard song={mockSong} artistName="Test Artist" />);

    expect(screen.getByText("Test Song")).toBeInTheDocument();
    expect(screen.getByText("Test Artist")).toBeInTheDocument();
  });

  it("calls playSong when clicking on card for a non-current song", () => {
    const playSong = vi.fn();
    mockUsePlayer.mockReturnValue({
      playSong,
      currentSong: null,
      isPlaying: false,
      togglePlay: vi.fn(),
    });

    render(<SongCard song={mockSong} artistName="Test Artist" />);
    fireEvent.click(screen.getByText("Test Song"));

    expect(playSong).toHaveBeenCalledWith(mockSong, [mockSong]);
  });

  it("opens modal when clicking add button", async () => {
    render(<SongCard song={mockSong} artistName="Test Artist" />);
    const addButton = screen.getByTitle("Add to Playlist");

    fireEvent.click(addButton);

    expect(await screen.findByText("You don't have any playlists yet.")).toBeInTheDocument();
  });
});
