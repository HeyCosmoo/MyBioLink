document.addEventListener('DOMContentLoaded', () => {
  // 1. Song playlist array
  const songs = [
    { 
      path: 'assets/Sandu Ciorba - Pe cimpoi.mp3', 
      name: 'Sandu Ciorba - Pe cimpoi' 
    },
    { 
      path: 'assets/Nikolas - Campioana.mp3', 
      name: 'Nikolas feat. Weedz - Campioana' 
    },
    { 
      path: 'assets/song3.mp3', 
      name: 'Relaxing Beat' 
    }
  ];

  // 2. Player elements
  const audio = new Audio(songs[0].path);
  const playPauseBtn = document.getElementById('playPauseBtn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const audioToggle = document.getElementById('audioToggle');
  const songTitle = document.getElementById('songTitle');
  const progressBar = document.getElementById('progressBar');
  const currentTimeDisplay = document.getElementById('currentTime');
  const durationDisplay = document.getElementById('duration');
  const loadingScreen = document.getElementById('loadingScreen');

  let isPlaying = false;
  let isMuted = false;
  let currentSongIndex = 0;

  // Handle Click to Continue screen
  loadingScreen.addEventListener('click', () => {
    loadingScreen.classList.add('hidden');
    document.body.classList.add('show-player');
    // Autoplay music after click
    audio.play();
  });

  // Initialize player
  function initPlayer() {
    audio.volume = 0.3;
    audio.loop = false;
    updateSongInfo();
  }

  // Update song info display
  function updateSongInfo() {
    songTitle.textContent = `Now Playing: ${songs[currentSongIndex].name}`;
    durationDisplay.textContent = formatTime(audio.duration);
  }

  // Play next song
  function playNext() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    switchSong();
  }

  // Play previous song
  function playPrevious() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    switchSong();
  }

  // Switch songs
  function switchSong() {
    audio.src = songs[currentSongIndex].path;
    audio.play();
    updateSongInfo();
  }

  // Event listeners
  audio.addEventListener('timeupdate', () => {
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
    currentTimeDisplay.textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener('play', () => {
    isPlaying = true;
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
  });

  audio.addEventListener('pause', () => {
    isPlaying = false;
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
  });

  audio.addEventListener('ended', playNext);

  playPauseBtn.addEventListener('click', () => {
    isPlaying ? audio.pause() : audio.play();
  });

  prevBtn.addEventListener('click', playPrevious);
  nextBtn.addEventListener('click', playNext);

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

  // Initialize
  initPlayer();
});
