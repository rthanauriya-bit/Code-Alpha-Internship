const playlistData = [
    { title: "Midnight Dreams", artist: "Aurora Waves", duration: "3:24", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { title: "City Lights", artist: "Neon Pulse", duration: "4:12", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    { title: "Lost in You", artist: "Echo Valley", duration: "3:45", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
    { title: "Summer Vibes", artist: "Coastal Breeze", duration: "3:58", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
    { title: "Running Free", artist: "Wild Hearts", duration: "3:32", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
    { title: "Ocean Eyes", artist: "Deep Blue", duration: "4:05", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" },
    { title: "Electric Dreams", artist: "Synth Wave", duration: "3:50", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3" },
    { title: "Silent Night", artist: "Piano Keys", duration: "2:58", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" }
];

let currentSongIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let isAutoplay = true;
let currentVolume = 0.7;

const audio = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');
const autoplayToggle = document.getElementById('autoplayToggle');
const songTitle = document.getElementById('songTitle');
const artistName = document.getElementById('artistName');
const currentTimeSpan = document.getElementById('currentTime');
const durationSpan = document.getElementById('duration');
const progressFill = document.getElementById('progressFill');
const progressBar = document.getElementById('progressBar');
const volumeFill = document.getElementById('volumeFill');
const volumeBar = document.getElementById('volumeBar');
const volumePercent = document.getElementById('volumePercent');
const volumeIcon = document.getElementById('volumeIcon');
const albumCircle = document.getElementById('albumCircle');
const equalizer = document.getElementById('equalizer');
const playlistEl = document.getElementById('playlist');
const playlistCount = document.getElementById('playlistCount');

function formatTime(seconds) {
    if(isNaN(seconds)) return '0:00';
    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
}

function loadSong(index) {
    let song = playlistData[index];
    if(!song) return;
    
    songTitle.textContent = song.title;
    artistName.textContent = song.artist;
    audio.src = song.src;
    audio.load();
    
    durationSpan.textContent = song.duration;
    
    document.querySelectorAll('.playlist li').forEach((li, i) => {
        if(i === index) {
            li.classList.add('active');
        } else {
            li.classList.remove('active');
        }
    });
    
    if(isPlaying) {
        audio.play().catch(e => console.log('play error', e));
    }
}

function renderPlaylist() {
    playlistEl.innerHTML = '';
    playlistData.forEach((song, index) => {
        let li = document.createElement('li');
        li.innerHTML = `
            <div class="playlist-song">
                <span class="playlist-title">${song.title}</span>
                <span class="playlist-artist">${song.artist}</span>
            </div>
            <span class="playlist-duration">${song.duration}</span>
        `;
        li.addEventListener('click', () => {
            currentSongIndex = index;
            loadSong(currentSongIndex);
            if(isPlaying) {
                audio.play();
            } else {
                playPause();
            }
        });
        playlistEl.appendChild(li);
    });
    playlistCount.textContent = `${playlistData.length} songs`;
    updateActivePlaylist();
}

function updateActivePlaylist() {
    let items = document.querySelectorAll('.playlist li');
    items.forEach((item, i) => {
        if(i === currentSongIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function playPause() {
    if(isPlaying) {
        audio.pause();
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        albumCircle.classList.remove('playing');
        equalizer.classList.remove('active');
    } else {
        audio.play().catch(e => console.log('autoplay blocked', e));
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        albumCircle.classList.add('playing');
        equalizer.classList.add('active');
    }
    isPlaying = !isPlaying;
}

function nextSong() {
    if(isShuffle) {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * playlistData.length);
        } while(newIndex === currentSongIndex && playlistData.length > 1);
        currentSongIndex = newIndex;
    } else {
        currentSongIndex = (currentSongIndex + 1) % playlistData.length;
    }
    loadSong(currentSongIndex);
    if(isPlaying) {
        audio.play();
    } else {
        playPause();
    }
}

function prevSong() {
    if(audio.currentTime > 3) {
        audio.currentTime = 0;
    } else {
        if(isShuffle) {
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * playlistData.length);
            } while(newIndex === currentSongIndex && playlistData.length > 1);
            currentSongIndex = newIndex;
        } else {
            currentSongIndex = (currentSongIndex - 1 + playlistData.length) % playlistData.length;
        }
        loadSong(currentSongIndex);
        if(isPlaying) {
            audio.play();
        } else {
            playPause();
        }
    }
}

function updateProgress() {
    if(audio.duration && !isNaN(audio.duration)) {
        let percent = (audio.currentTime / audio.duration) * 100;
        progressFill.style.width = percent + '%';
        currentTimeSpan.textContent = formatTime(audio.currentTime);
    }
}

function setProgress(e) {
    let rect = progressBar.getBoundingClientRect();
    let clickX = e.clientX - rect.left;
    let width = rect.width;
    let percent = (clickX / width);
    audio.currentTime = percent * audio.duration;
}

function updateVolumeUI() {
    volumeFill.style.width = (currentVolume * 100) + '%';
    volumePercent.textContent = Math.round(currentVolume * 100) + '%';
    
    let icon = volumeIcon.querySelector('i');
    if(currentVolume === 0) {
        volumeIcon.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else if(currentVolume < 0.3) {
        volumeIcon.innerHTML = '<i class="fas fa-volume-off"></i>';
    } else if(currentVolume < 0.7) {
        volumeIcon.innerHTML = '<i class="fas fa-volume-down"></i>';
    } else {
        volumeIcon.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
}

function setVolume(e) {
    let rect = volumeBar.getBoundingClientRect();
    let clickX = e.clientX - rect.left;
    let width = rect.width;
    let vol = Math.min(1, Math.max(0, clickX / width));
    currentVolume = vol;
    audio.volume = currentVolume;
    updateVolumeUI();
}

function toggleShuffle() {
    isShuffle = !isShuffle;
    if(isShuffle) {
        shuffleBtn.style.background = 'rgba(167, 139, 250, 0.6)';
    } else {
        shuffleBtn.style.background = 'rgba(255,255,255,0.08)';
    }
}

function toggleRepeat() {
    isRepeat = !isRepeat;
    if(isRepeat) {
        repeatBtn.style.background = 'rgba(167, 139, 250, 0.6)';
    } else {
        repeatBtn.style.background = 'rgba(255,255,255,0.08)';
    }
}

function toggleMute() {
    if(audio.volume > 0) {
        audio.volume = 0;
        currentVolume = 0;
    } else {
        audio.volume = 0.7;
        currentVolume = 0.7;
    }
    updateVolumeUI();
}

playPauseBtn.addEventListener('click', playPause);
prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);
shuffleBtn.addEventListener('click', toggleShuffle);
repeatBtn.addEventListener('click', toggleRepeat);

progressBar.addEventListener('click', setProgress);
volumeBar.addEventListener('click', setVolume);
volumeIcon.addEventListener('click', toggleMute);

audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('loadedmetadata', () => {
    durationSpan.textContent = formatTime(audio.duration);
});

audio.addEventListener('ended', () => {
    if(isRepeat) {
        audio.currentTime = 0;
        audio.play();
    } else if(isAutoplay) {
        nextSong();
    } else {
        isPlaying = false;
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        albumCircle.classList.remove('playing');
        equalizer.classList.remove('active');
    }
});

autoplayToggle.addEventListener('change', (e) => {
    isAutoplay = e.target.checked;
});

audio.volume = currentVolume;
updateVolumeUI();

renderPlaylist();
loadSong(0);

let lastScrollTime = 0;
let playlistScroll = document.querySelector('.playlist');
if(playlistScroll) {
    playlistScroll.addEventListener('scroll', () => {
        lastScrollTime = Date.now();
    });
}

console.log('🎵 music player ready! vibe on!');