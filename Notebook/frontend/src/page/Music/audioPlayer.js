import { useEffect, useState, useSyncExternalStore } from "react";

const audio = new Audio();

let queue = [];
let state = { songId: null, playing: false };
const listeners = new Set();

function emit() {
    state = { ...state };
    listeners.forEach((listener) => listener());
}

function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function setQueue(songs) {
    queue = songs ?? [];
}

export function playSong(song) {
    if (!song?.fileUrl) return;
    if (audio.getAttribute("src") !== song.fileUrl) audio.src = song.fileUrl;
    // Tell the other Electron windows to go quiet before this one makes sound.
    window.electron?.musicStarted?.();
    audio.play().catch((error) => console.log("Playback failed:", error));
    state = { songId: song._id, playing: true };
    emit();
}

export function pauseSong() {
    audio.pause();
    state = { ...state, playing: false };
    emit();
}

export function toggleSong(song) {
    if (state.songId === song._id && state.playing) {
        pauseSong();
    } else {
        playSong(song);
    }
}

export function stopIfPlaying(id) {
    if (String(state.songId) !== String(id)) return;
    audio.pause();
    audio.removeAttribute("src");
    state = { songId: null, playing: false };
    emit();
}

export function skipTo(offset) {
    const index = queue.findIndex((song) => String(song._id) === String(state.songId));
    const target = queue[index + offset];
    if (target) playSong(target);
}

export function seekTo(value) {
    if (!Number.isFinite(value)) return;
    audio.currentTime = value;
}

export function setVolume(value) {
    audio.volume = value;
}

export function getVolume() {
    return audio.volume;
}

export function usePlayer() {
    return useSyncExternalStore(subscribe, () => state);
}

export function useProgress() {
    const [progress, setProgress] = useState({ current: 0, duration: 0 });

    useEffect(() => {
        const sync = () =>
            setProgress({
                current: audio.currentTime || 0,
                duration: Number.isFinite(audio.duration) ? audio.duration : 0,
            });

        audio.addEventListener("timeupdate", sync);
        audio.addEventListener("loadedmetadata", sync);
        audio.addEventListener("seeked", sync);
        sync();

        return () => {
            audio.removeEventListener("timeupdate", sync);
            audio.removeEventListener("loadedmetadata", sync);
            audio.removeEventListener("seeked", sync);
        };
    }, []);

    return progress;
}

audio.addEventListener("ended", () => {
    const index = queue.findIndex((song) => String(song._id) === String(state.songId));
    const next = queue[index + 1];
    if (next) {
        playSong(next);
        return;
    }
    state = { ...state, playing: false };
    emit();
});

// Another window (sticky player, second app window) started playing.
window.electron?.onMusicStop?.(() => pauseSong());
