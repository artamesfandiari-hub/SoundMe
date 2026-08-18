/* =========================================================
   SOUNDME
   songs.js
   Music Library Manager
========================================================= */


/* =========================================================
   STORAGE
========================================================= */

const SOUNDME_SONGS_KEY =
  "soundme_songs";


/* =========================================================
   GET SONGS
========================================================= */

function getSongs(){

  try{

    const data =
      localStorage.getItem(
        SOUNDME_SONGS_KEY
      );

    if(!data){
      return [];
    }

    const songs =
      JSON.parse(data);

    if(!Array.isArray(songs)){
      return [];
    }

    return songs;

  }catch(error){

    console.error(
      "SoundMe: Could not read songs.",
      error
    );

    return [];

  }

}


/* =========================================================
   SAVE SONGS
========================================================= */

function saveSongs(
  songs
){

  try{

    localStorage.setItem(
      SOUNDME_SONGS_KEY,
      JSON.stringify(songs)
    );

    return true;

  }catch(error){

    console.error(
      "SoundMe: Could not save songs.",
      error
    );

    return false;

  }

}


/* =========================================================
   CREATE SONG
========================================================= */

function createSong(
  data = {}
){

  const title =
    String(
      data.title ||
      data.name ||
      "Untitled"
    ).trim();


  const artist =
    String(
      data.artist ||
      "SoundMe"
    ).trim();


  const song = {

    id:
      data.id ||
      generateSongId(),

    title,

    artist,

    filename:
      data.filename ||
      "",

    audioUrl:
      data.audioUrl ||
      "",

    coverUrl:
      data.coverUrl ||
      "",

    type:
      data.type ||
      "audio/mpeg",

    size:
      Number(
        data.size || 0
      ),

    duration:
      Number(
        data.duration || 0
      ),

    downloads:
      Number(
        data.downloads || 0
      ),

    createdAt:
      data.createdAt ||
      Date.now()

  };


  return song;

}


/* =========================================================
   ADD SONG
========================================================= */

function addSong(
  data
){

  const songs =
    getSongs();


  const song =
    createSong(
      data
    );


  songs.push(
    song
  );


  const saved =
    saveSongs(
      songs
    );


  if(!saved){
    return null;
  }


  return song;

}


/* =========================================================
   UPDATE SONG
========================================================= */

function updateSong(
  id,
  changes = {}
){

  const songs =
    getSongs();


  const index =
    songs.findIndex(
      song =>
        song.id === id
    );


  if(index === -1){
    return null;
  }


  songs[index] = {

    ...songs[index],

    ...changes,

    id:
      songs[index].id

  };


  saveSongs(
    songs
  );


  return songs[index];

}


/* =========================================================
   GET SONG BY ID
========================================================= */

function getSongById(
  id
){

  const songs =
    getSongs();


  return (
    songs.find(
      song =>
        song.id === id
    ) ||
    null
  );

}


/* =========================================================
   DELETE SONG
========================================================= */

function deleteSong(
  id
){

  const songs =
    getSongs();


  const filtered =
    songs.filter(
      song =>
        song.id !== id
    );


  if(
    filtered.length ===
    songs.length
  ){

    return false;

  }


  return saveSongs(
    filtered
  );

}


/* =========================================================
   CLEAR ALL SONGS
========================================================= */

function clearSongs(){

  localStorage.removeItem(
    SOUNDME_SONGS_KEY
  );

}


/* =========================================================
   SEARCH
========================================================= */

function searchSongs(
  query
){

  const songs =
    getSongs();


  const text =
    String(
      query || ""
    )
    .trim()
    .toLowerCase();


  if(!text){
    return songs;
  }


  return songs.filter(
    song => {

      const title =
        String(
          song.title || ""
        ).toLowerCase();

      const artist =
        String(
          song.artist || ""
        ).toLowerCase();


      return (
        title.includes(text) ||
        artist.includes(text)
      );

    }
  );

}


/* =========================================================
   SORT
========================================================= */

function sortSongs(
  songs,
  mode = "newest"
){

  const result =
    [...songs];


  switch(mode){

    case "oldest":

      return result.sort(
        (a,b) =>
          a.createdAt -
          b.createdAt
      );


    case "name":

      return result.sort(
        (a,b) =>
          String(
            a.title || ""
          ).localeCompare(
            String(
              b.title || ""
            )
          )
      );


    case "downloads":

      return result.sort(
        (a,b) =>
          Number(
            b.downloads || 0
          ) -
          Number(
            a.downloads || 0
          )
      );


    case "newest":

    default:

      return result.sort(
        (a,b) =>
          b.createdAt -
          a.createdAt
      );

  }

}


/* =========================================================
   DOWNLOAD COUNTER
========================================================= */

function incrementDownloads(
  id
){

  const song =
    getSongById(
      id
    );


  if(!song){
    return null;
  }


  const newCount =
    Number(
      song.downloads || 0
    ) + 1;


  return updateSong(
    id,
    {
      downloads:
        newCount
    }
  );

}


/* =========================================================
   FORMAT FILE SIZE
========================================================= */

function formatSongSize(
  bytes
){

  const size =
    Number(
      bytes || 0
    );


  if(size <= 0){
    return "Unknown size";
  }


  if(size < 1024){

    return (
      size +
      " B"
    );

  }


  if(
    size <
    1024 * 1024
  ){

    return (
      (size / 1024)
        .toFixed(1) +
      " KB"
    );

  }


  if(
    size <
    1024 * 1024 * 1024
  ){

    return (
      (size / 1024 / 1024)
        .toFixed(1) +
      " MB"
    );

  }


  return (
    (size / 1024 / 1024 / 1024)
      .toFixed(1) +
    " GB"
  );

}


/* =========================================================
   FORMAT DURATION
========================================================= */

function formatSongDuration(
  seconds
){

  const value =
    Number(
      seconds
    );


  if(
    !Number.isFinite(value) ||
    value <= 0
  ){

    return "0:00";

  }


  const minutes =
    Math.floor(
      value / 60
    );


  const remainingSeconds =
    Math.floor(
      value % 60
    )
    .toString()
    .padStart(
      2,
      "0"
    );


  return (
    minutes +
    ":" +
    remainingSeconds
  );

}


/* =========================================================
   ID GENERATOR
========================================================= */

function generateSongId(){

  return (
    "song_" +
    Date.now() +
    "_" +
    Math.random()
      .toString(36)
      .substring(
        2,
        10
      )
  );

}


/* =========================================================
   LIBRARY STATS
========================================================= */

function getLibraryStats(){

  const songs =
    getSongs();


  let totalDownloads =
    0;


  let totalSize =
    0;


  let totalDuration =
    0;


  songs.forEach(
    song => {

      totalDownloads +=
        Number(
          song.downloads || 0
        );

      totalSize +=
        Number(
          song.size || 0
        );

      totalDuration +=
        Number(
          song.duration || 0
        );

    }
  );


  return {

    tracks:
      songs.length,

    downloads:
      totalDownloads,

    size:
      totalSize,

    duration:
      totalDuration

  };

}


/* =========================================================
   EXPORT GLOBAL API
========================================================= */

window.SoundMeSongs = {

  getAll:
    getSongs,

  getById:
    getSongById,

  add:
    addSong,

  update:
    updateSong,

  remove:
    deleteSong,

  clear:
    clearSongs,

  search:
    searchSongs,

  sort:
    sortSongs,

  incrementDownloads,

  stats:
    getLibraryStats,

  formatSize:
    formatSongSize,

  formatDuration:
    formatSongDuration

};
