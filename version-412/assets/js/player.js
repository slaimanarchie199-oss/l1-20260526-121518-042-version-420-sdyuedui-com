import { H as Hls } from "./video-vendor-dru42stk.js";

document.querySelectorAll(".player-card[data-src]").forEach(function (player) {
  const video = player.querySelector("video");
  const button = player.querySelector(".play-mask");
  const source = player.getAttribute("data-src");
  let initialized = false;
  let hls = null;

  function initVideo() {
    if (initialized || !video || !source) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }

    initialized = true;
  }

  function startVideo() {
    initVideo();
    player.classList.add("is-playing");
    const playResult = video.play();

    if (playResult && typeof playResult.catch === "function") {
      playResult.catch(function () {
        player.classList.remove("is-playing");
      });
    }
  }

  if (button && video) {
    button.addEventListener("click", startVideo);
    video.addEventListener("click", function () {
      if (!initialized) {
        startVideo();
      }
    });
    video.addEventListener("play", function () {
      player.classList.add("is-playing");
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        player.classList.add("is-playing");
      }
    });
    video.addEventListener("ended", function () {
      player.classList.remove("is-playing");
    });
  }

  window.addEventListener("pagehide", function () {
    if (hls && typeof hls.destroy === "function") {
      hls.destroy();
      hls = null;
    }
  });
});
