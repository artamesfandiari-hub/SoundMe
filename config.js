/* =========================================================
   SOUNDME
   config.js
   Global Configuration
========================================================= */

"use strict";


const SOUNDMЕ_CONFIG = {

  /* =======================================================
     SITE
  ======================================================= */

  site: {

    name:
      "SoundMe",

    description:
      "Discover and download music.",

    version:
      "1.0.0"

  },


  /* =======================================================
     ADMIN
  ======================================================= */

  admin: {

    /*
      فعلاً برای نسخه اولیه.
      بعداً احراز هویت واقعی را به Backend
      وصل می‌کنیم.
    */

    enabled:
      true

  },


  /* =======================================================
     MUSIC
  ======================================================= */

  music: {

    allowedAudioTypes: [

      "audio/mpeg",
      "audio/wav",
      "audio/x-wav",
      "audio/mp4",
      "audio/aac",
      "audio/ogg",
      "audio/webm"

    ],

    allowedExtensions: [

      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".ogg",
      ".webm"

    ],

    maxFileSize:

      100 * 1024 * 1024

  },


  /* =======================================================
     COVER
  ======================================================= */

  cover: {

    allowedTypes: [

      "image/jpeg",
      "image/png",
      "image/webp"

    ],

    allowedExtensions: [

      ".jpg",
      ".jpeg",
      ".png",
      ".webp"

    ],

    maxFileSize:

      10 * 1024 * 1024

  },


  /* =======================================================
     PLAYER
  ======================================================= */

  player: {

    preload:
      "metadata",

    autoPlay:
      false,

    loop:
      false

  },


  /* =======================================================
     STORAGE
  ======================================================= */

  storage: {

    songsKey:
      "soundme_songs",

    authKey:
      "soundme_auth",

    settingsKey:
      "soundme_settings"

  },


  /* =======================================================
     DOWNLOAD
  ======================================================= */

  downloads: {

    requireLogin:
      true,

    countDownloads:
      true

  },


  /* =======================================================
     ROUTES
  ======================================================= */

  routes: {

    home:
      "index.html",

    login:
      "login.html",

    admin:
      "admin.html"

  }

};


/* =========================================================
   GLOBAL ACCESS
========================================================= */

window.SOUNDME_CONFIG =
  SOUNDMЕ_CONFIG;
