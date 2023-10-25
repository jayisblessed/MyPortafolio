// the 'data' must contain an 'audio' property of this format: 
// 'audio': {'id': id, 'url': url}

function createAudioPlayer(data) {
  const audioPlayerDiv = document.createElement("div");
  audioPlayerDiv.classList.add("audioPlayer");

  const audioElement = document.createElement("audio");
  audioElement.id = `audio${data.audio.id}`;
  audioElement.src = data.audio.url;
  audioElement.preload = "auto";
  audioPlayerDiv.appendChild(audioElement);

  const playButton = document.createElement("button");
  playButton.id = `playButton${data.audio.id}`;
  playButton.classList.add("play-audio-btn");
  playButton.textContent = "▶️";
  audioPlayerDiv.appendChild(playButton);

  playButton.addEventListener("click", function () {
    if (audioElement.paused || audioElement.ended) {
      audioElement.play();
      playButton.textContent = "||"; // set the pause icon when playing
    } else {
      audioElement.pause();
      playButton.textContent = "▶️"; // set the play icon when paused
    }
  });

  audioElement.addEventListener("ended", function () {
    playButton.textContent = "▶️"; // set the play icon when finished playing
  });

  return audioPlayerDiv;
}
