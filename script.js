document.addEventListener('DOMContentLoaded', () => {
  const audio = new Audio('assets/fallback-music.mp3');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const audioToggle = document.getElementById('audioToggle');
  const songTitle = document.getElementById('songTitle');
  const progressBar = document.getElementById('progressBar');
  const currentTimeDisplay = document.getElementById('currentTime');
  const durationDisplay = document.getElementById('duration');

  let isPlaying = false;
  let isMuted = false;

  audio.loop = true;
  audio.volume = 0.3;
  audio.autoplay = true;
  audio.addEventListener('canplay', () => {
    durationDisplay.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('timeupdate', () => {
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
    currentTimeDisplay.textContent = formatTime(audio.currentTime);
    durationDisplay.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('play', () => {
    isPlaying = true;
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
  });

  audio.addEventListener('pause', () => {
    isPlaying = false;
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
  });

  playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  });

  prevBtn.addEventListener('click', () => {
    audio.currentTime = 0;
  });

  nextBtn.addEventListener('click', () => {
    audio.currentTime = audio.duration - 0.1;
  });

  audioToggle.addEventListener('click', () => {
    isMuted = !isMuted;
    audio.volume = isMuted ? 0 : 0.3;
    audioToggle.innerHTML = isMuted
      ? '<i class="fas fa-volume-mute"></i>'
      : '<i class="fas fa-volume-up"></i>';
  });

  document.querySelector('.progress-container').addEventListener('click', (e) => {
    const width = e.currentTarget.offsetWidth;
    const clickX = e.offsetX;
    const seekTime = (clickX / width) * audio.duration;
    audio.currentTime = seekTime;
  });

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60) || 0;
    const secs = Math.floor(seconds % 60) || 0;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Try auto play after user interaction fallback
  document.body.addEventListener('click', () => {
    if (!isPlaying) audio.play();
  }, { once: true });
});
