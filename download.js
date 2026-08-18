/* =========================================================
   SOUNDME
   download.js
   Music Download Manager
========================================================= */

"use strict";


(function(){

  /* =======================================================
     CONFIG
  ======================================================= */

  const config =
    window.SOUNDME_CONFIG || {

      downloads: {
        requireLogin: true,
        countDownloads: true
      }

    };


  /* =======================================================
     AUTH CHECK
  ======================================================= */

  function isLoggedIn(){

    /*
      auth.js باید وضعیت ورود را در
      localStorage با کلید soundme_auth
      نگه دارد.
    */

    try{

      const raw =
        localStorage.getItem(
          "soundme_auth"
        );


      if(!raw){
        return false;
      }


      const auth =
        JSON.parse(
          raw
        );


      return !!(
        auth &&
        (
          auth.loggedIn === true ||
          auth.isLoggedIn === true ||
          auth.user
        )
      );

    }catch(error){

      console.error(
        "SoundMe auth check failed:",
        error
      );

      return false;

    }

  }


  /* =======================================================
     LOGIN REDIRECT
  ======================================================= */

  function redirectToLogin(){

    const currentPage =
      window.location.pathname +
      window.location.search;


    const loginPage =
      (
        window.SOUNDME_CONFIG &&
        window.SOUNDME_CONFIG.routes &&
        window.SOUNDME_CONFIG.routes.login
      )
      ||
      "login.html";


    const separator =
      loginPage.includes("?")
        ? "&"
        : "?";


    window.location.href =
      loginPage +
      separator +
      "redirect=" +
      encodeURIComponent(
        currentPage
      );

  }


  /* =======================================================
     GET SONG
  ======================================================= */

  function getSong(
    songId
  ){

    if(
      !window.SoundMeSongs ||
      !SoundMeSongs.getById
    ){

      return null;

    }


    return SoundMeSongs.getById(
      songId
    );

  }


  /* =======================================================
     DOWNLOAD SONG
  ======================================================= */

  async function downloadSong(
    songId
  ){

    const song =
      getSong(
        songId
      );


    if(!song){

      console.error(
        "SoundMe: Song not found.",
        songId
      );

      return false;

    }


    /* -------------------------------------------------------
       LOGIN REQUIRED
    ------------------------------------------------------- */

    if(
      config.downloads &&
      config.downloads.requireLogin &&
      !isLoggedIn()
    ){

      redirectToLogin();

      return false;

    }


    if(!song.audioUrl){

      console.error(
        "SoundMe: Song has no audio file.",
        song
      );

      return false;

    }


    try{

      /*
        Use an anchor when possible.
        This works well with local/data URLs.
      */

      const link =
        document.createElement(
          "a"
        );


      link.href =
        song.audioUrl;


      link.download =
        song.filename ||
        (
          cleanFileName(
            song.title
          ) +
          ".mp3"
        );


      link.style.display =
        "none";


      document.body.appendChild(
        link
      );


      link.click();


      link.remove();


      /* -----------------------------------------------------
         DOWNLOAD COUNTER
      ----------------------------------------------------- */

      if(
        config.downloads &&
        config.downloads.countDownloads &&
        window.SoundMeSongs &&
        SoundMeSongs.incrementDownloads
      ){

        SoundMeSongs.incrementDownloads(
          song.id
        );

      }


      return true;

    }catch(error){

      console.error(
        "SoundMe download failed:",
        error
      );


      return false;

    }

  }


  /* =======================================================
     FILE NAME
  ======================================================= */

  function cleanFileName(
    name
  ){

    return String(
      name ||
      "SoundMe Track"
    )

      .replace(
        /[<>:"/\\|?*\x00-\x1F]/g,
        ""
      )

      .replace(
        /\s+/g,
        " "
      )

      .trim();

  }


  /* =======================================================
     CREATE DOWNLOAD BUTTON
  ======================================================= */

  function createDownloadButton(
    songId,
    options = {}
  ){

    const button =
      document.createElement(
        "button"
      );


    button.type =
      "button";


    button.className =
      options.className ||
      "download-button";


    button.textContent =
      options.text ||
      "DOWNLOAD";


    button.dataset.songId =
      songId;


    button.addEventListener(
      "click",
      event => {

        event.preventDefault();

        event.stopPropagation();


        downloadSong(
          songId
        );

      }
    );


    return button;

  }


  /* =======================================================
     AUTO CONNECT DOWNLOAD BUTTONS
  ======================================================= */

  function bindDownloadButtons(){

    const buttons =
      document.querySelectorAll(
        "[data-download]"
      );


    buttons.forEach(
      button => {

        if(
          button.dataset.downloadBound ===
          "true"
        ){

          return;

        }


        button.dataset.downloadBound =
          "true";


        button.addEventListener(
          "click",
          event => {

            event.preventDefault();

            event.stopPropagation();


            const songId =
              button.dataset.download;


            if(!songId){
              return;
            }


            downloadSong(
              songId
            );

          }
        );

      }
    );

  }


  /* =======================================================
     EXPOSE API
  ======================================================= */

  window.SoundMeDownload = {

    download:
      downloadSong,

    createButton:
      createDownloadButton,

    bind:
      bindDownloadButtons,

    isLoggedIn:
      isLoggedIn

  };


  /* =======================================================
     INITIALIZE
  ======================================================= */

  if(
    document.readyState ===
    "loading"
  ){

    document.addEventListener(
      "DOMContentLoaded",
      bindDownloadButtons
    );

  }else{

    bindDownloadButtons();

  }

})();
