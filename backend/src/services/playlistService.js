const { supabaseAdmin } = require("../config/supabaseAdmin");

/**
 * ✅ Fetch playlists for a user
 */
async function getUserPlaylists(userId) {
  const { data: playlists, error } = await supabaseAdmin
    .from("playlists")
    .select(`
      id, 
      user_id, 
      name, 
      created_at, 
      playlist_songs (song_id, songs (id, title))
    `) // ✅ Correctly join `playlist_songs` with `songs`
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Supabase Error:", error);
    throw new Error(error.message);
  }

  return playlists.map(playlist => ({
    ...playlist,
    songs: playlist.playlist_songs 
      ? playlist.playlist_songs.map(song => ({
          id: song.songs.id,  // ✅ Get song ID from `songs` table
          title: song.songs.title // ✅ Get song title
        }))
      : [],
  }));
}

/**
 * ✅ Create a new playlist
 */
async function createPlaylist(userId, name) {
  try {
    console.log("📌 Creating playlist for:", { userId, name });

    // ✅ Check if a playlist with the same name already exists
    const { data: existingPlaylists } = await supabaseAdmin
      .from("playlists")
      .select("name")
      .eq("user_id", userId);

    let newName = name.trim();
    let count = 1;

    while (existingPlaylists.some(p => p.name === newName)) {
      newName = `${name.trim()} (${count++})`;
    }

    const { data, error } = await supabaseAdmin
      .from("playlists")
      .insert([{ user_id: userId, name: newName }])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    console.log("✅ Playlist created:", data);
    return data;
  } catch (err) {
    console.error("❌ Unexpected Error in createPlaylist:", err.message);
    throw err;
  }
}


/**
 * ✅ Add a song to a playlist
 */
async function addSongToPlaylist(playlistId, songId) {
  const { error } = await supabase
    .from("playlist_songs")
    .insert([{ playlist_id: playlistId, song_id: songId }]);

  if (error) {
    throw new Error(error.message);
  }

  return { message: "Song added successfully." };
}

/**
 * ✅ Remove a song from a playlist
 */
async function removeSongFromPlaylist(playlistId, songId) {
  const { error } = await supabase
    .from("playlist_songs")
    .delete()
    .eq("playlist_id", playlistId)
    .eq("song_id", songId);

  if (error) {
    throw new Error(error.message);
  }

  return { message: "Song removed successfully." };
}

/**
 * ✅ Rename a playlist
 */
async function renamePlaylist(playlistId, newName) {
  const { error } = await supabase
    .from("playlists")
    .update({ name: newName })
    .eq("id", playlistId);

  if (error) {
    throw new Error(error.message);
  }

  return { message: "Playlist renamed successfully." };
}

/**
 * ✅ Delete a playlist
 */
async function deletePlaylist(playlistId) {
  const { error } = await supabase
    .from("playlists")
    .delete()
    .eq("id", playlistId);

  if (error) {
    throw new Error(error.message);
  }

  return { message: "Playlist deleted successfully." };
}

// ✅ Export service functions
module.exports = {
  getUserPlaylists,
  createPlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  renamePlaylist,
  deletePlaylist,
};
