/* =========================================================
   SOUNDME
   admin.js
   Admin Panel
========================================================= */

(function(){

  "use strict";


  /* =======================================================
     ELEMENTS
  ======================================================= */

  const uploadForm =
    document.getElementById("uploadForm");

  const audioInput =
    document.getElementById("audioFile");

  const coverInput =
    document.getElementById("coverFile");

  const titleInput =
    document.getElementById("songTitle");

  const artistInput =
    document.getElementById("songArtist");

  const songList =
    document.getElementById("adminSongList");

  const emptyState =
    document.getElementById("adminEmpty");

  const message =
    document.getElementById("adminMessage");


  /* =======================================================
     CHECK REQUIRED ELEMENTS
  ======================================================= */

  if(!uploadForm){

    console.warn(
      "SoundMe Admin: uploadForm not found."
    );

    return;

  }


  /* =======================================================
     MESSAGE
  ======================================================= */

  function showMessage(
    text,
    type = "normal"
  ){

    if(!message){
      return;
    }


    message.textContent =
      text;


    message.dataset.type =
      type;


    message.classList.add(
      "visible"
    );


    clearTimeout(
      showMessage.timer
    );


    showMessage.timer =
      setTimeout(
        () => {

          message.classList.remove(
            "visible"
          );

        },
        4000
      );

  }


  /* =======================================================
     FORMAT FILE SIZE
  ======================================================= */

  function formatSize(
    bytes
  ){

    if(
      window.SoundMeSongs &&
      SoundMeSongs.formatSize
    ){

      return SoundMeSongs.formatSize(
        bytes
      );

    }


    if(bytes < 1024){
      return bytes + " B";
    }


    if(bytes < 1024 * 1024){

      return (
        (bytes / 1024)
          .toFixed(1) +
        " KB"
      );

    }


    return (
      (bytes / 1024 / 1024)
        .toFixed(1) +
      " MB"
    );

  }


  /* =======================================================
     GET AUDIO DURATION
  ======================================================= */

  function getAudioDuration(
    file
  ){

    return new Promise(
      resolve => {

        const audio =
          document.createElement(
            "audio"
          );


        const url =
          URL.createObjectURL(
            file
          );


        audio.preload =
          "metadata";


        audio.onloadedmetadata =
          () => {

            const duration =
              audio.duration;


            URL.revokeObjectURL(
              url
            );


            resolve(
              Number.isFinite(
                duration
              )
                ? duration
                : 0
            );

          };


        audio.onerror =
          () => {

            URL.revokeObjectURL(
              url
            );

            resolve(0);

          };


        audio.src =
          url;

      }
    );

  }


  /* =======================================================
     READ FILE AS DATA URL
  ======================================================= */

  function fileToDataURL(
    file
  ){

    return new Promise(
      (resolve,reject) => {

        if(!file){

          resolve("");

          return;

        }


        const reader =
          new FileReader();


        reader.onload =
          () => {

            resolve(
              reader.result
            );

          };


        reader.onerror =
          () => {

            reject(
              reader.error
            );

          };


        reader.readAsDataURL(
          file
        );

      }
    );

  }


  /* =======================================================
     RENDER ADMIN LIBRARY
  ======================================================= */

  function renderSongs(){

    if(!songList){
      return;
    }


    const songs =
      window.SoundMeSongs
        ? SoundMeSongs.sort(
            SoundMeSongs.getAll(),
            "newest"
          )
        : [];


    songList.innerHTML =
      "";


    if(!songs.length){

      if(emptyState){

        emptyState.style.display =
          "block";

      }

      return;

    }


    if(emptyState){

      emptyState.style.display =
        "none";

    }


    songs.forEach(
      song => {

        const item =
          document.createElement(
            "div"
          );

        item.className =
          "admin-song";


        /* COVER */

        const cover =
          document.createElement(
            "div"
          );

        cover.className =
          "admin-song-cover";


        if(song.coverUrl){

          cover.style.backgroundImage =
            `url("${song.coverUrl}")`;

        }else{

          cover.textContent =
            "♪";

        }


        /* INFO */

        const info =
          document.createElement(
            "div"
          );

        info.className =
          "admin-song-info";


        const title =
          document.createElement(
            "strong"
          );

        title.textContent =
          song.title;


        const artist =
          document.createElement(
            "span"
          );

        artist.textContent =
          song.artist;


        const meta =
          document.createElement(
            "small"
          );

        meta.textContent =
          `${formatSize(song.size)} · ${song.downloads || 0} downloads`;


        info.appendChild(
          title
        );

        info.appendChild(
          artist
        );

        info.appendChild(
          meta
        );


        /* DELETE */

        const deleteButton =
          document.createElement(
            "button"
          );

        deleteButton.type =
          "button";

        deleteButton.className =
          "admin-delete";

        deleteButton.textContent =
          "DELETE";


        deleteButton.addEventListener(
          "click",
          () => {

            deleteSong(
              song.id
            );

          }
        );


        item.appendChild(
          cover
        );

        item.appendChild(
          info
        );

        item.appendChild(
          deleteButton
        );


        songList.appendChild(
          item
        );

      }
    );

  }


  /* =======================================================
     DELETE SONG
  ======================================================= */

  function deleteSong(
    id
  ){

    const song =
      SoundMeSongs.getById(
        id
      );


    if(!song){
      return;
    }


    const confirmed =
      window.confirm(
        `Delete "${song.title}"?`
      );


    if(!confirmed){
      return;
    }


    const removed =
      SoundMeSongs.remove(
        id
      );


    if(removed){

      showMessage(
        "Song deleted.",
        "success"
      );


      renderSongs();

    }else{

      showMessage(
        "Could not delete song.",
        "error"
      );

    }

  }


  /* =======================================================
     UPLOAD
  ======================================================= */

  uploadForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const audioFile =
        audioInput &&
        audioInput.files
          ? audioInput.files[0]
          : null;


      const coverFile =
        coverInput &&
        coverInput.files
          ? coverInput.files[0]
          : null;


      if(!audioFile){

        showMessage(
          "Choose an audio file first.",
          "error"
        );

        return;

      }


      if(
        !audioFile.type.startsWith(
          "audio/"
        ) &&
        !/\.(mp3|wav|m4a|aac|ogg|webm)$/i
          .test(
            audioFile.name
          )
      ){

        showMessage(
          "Please choose a valid audio file.",
          "error"
        );

        return;

      }


      let title =
        titleInput
          ? titleInput.value.trim()
          : "";


      const artist =
        artistInput
          ? artistInput.value.trim()
          : "";


      if(!title){

        title =
          audioFile.name
            .replace(
              /\.[^/.]+$/,
              ""
            )
            .replace(
              /[_-]+/g,
              " "
            )
            .trim();

      }


      try{

        showMessage(
          "Preparing song...",
          "normal"
        );


        const duration =
          await getAudioDuration(
            audioFile
          );


        /*
          IMPORTANT

          This converts the selected files
          into data URLs so the current
          local version can store them.
        */

        const audioUrl =
          await fileToDataURL(
            audioFile
          );


        let coverUrl =
          "";


        if(coverFile){

          if(
            !coverFile.type.startsWith(
              "image/"
            )
          ){

            showMessage(
              "Cover must be an image.",
              "error"
            );

            return;

          }


          coverUrl =
            await fileToDataURL(
              coverFile
            );

        }


        const song =
          SoundMeSongs.add({

            title:

              title ||
              "Untitled",

            artist:

              artist ||
              "SoundMe",

            filename:

              audioFile.name,

            audioUrl,

            coverUrl,

            type:

              audioFile.type ||
              "audio/mpeg",

            size:

              audioFile.size,

            duration

          });


        if(!song){

          showMessage(
            "Could not save the song.",
            "error"
          );

          return;

        }


        showMessage(
          `"${song.title}" added successfully.`,
          "success"
        );


        uploadForm.reset();


        renderSongs();


      }catch(error){

        console.error(
          "SoundMe upload error:",
          error
        );


        showMessage(
          "Something went wrong while uploading.",
          "error"
        );

      }

    }
  );


  /* =======================================================
     INITIALIZE
  ======================================================= */

  renderSongs();


  /* =======================================================
     REFRESH WHEN PAGE BECOMES VISIBLE
  ======================================================= */

  document.addEventListener(
    "visibilitychange",
    () => {

      if(
        !document.hidden
      ){

        renderSongs();

      }

    }
  );


})();
