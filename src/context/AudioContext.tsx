import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Reciter, SurahMeta } from '../types';
import { RECITERS, EXPANDED_RECITERS, getSurahAudioUrl, getSurahFallbackAudioUrl } from '../data/reciters';
import { ALL_SURAHS } from '../data/quranMeta';
import { MP3QRadio } from '../types/mp3quran';

export type AudioMode = 'surah' | 'radio' | 'tafsir' | 'custom';

export interface AudioTafsirItem {
  title: string;
  surahNumber: number;
  surahName: string;
  url: string;
}

interface AudioContextType {
  audioMode: AudioMode;
  isPlaying: boolean;
  currentSurah: SurahMeta | null;
  currentReciter: Reciter;
  currentRadio: MP3QRadio | null;
  currentTafsir: AudioTafsirItem | null;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isPlayerVisible: boolean;
  isLoading: boolean;
  audioError: string | null;
  playbackSpeed: number;
  isLooping: boolean;
  sleepTimerMinutes: number | null;
  activeAyahNumber: number | null;
  playlistQueue: number[] | null;
  playlistTitle: string | null;
  playSurah: (surahNumber: number, reciter?: Reciter) => void;
  playPlaylist: (surahNumbers: number[], title?: string, reciter?: Reciter) => void;
  playRadio: (radio: MP3QRadio) => void;
  playTafsir: (tafsir: AudioTafsirItem) => void;
  togglePlay: () => void;
  seekTo: (seconds: number) => void;
  setVolumeLevel: (vol: number) => void;
  toggleMute: () => void;
  setReciter: (reciter: Reciter) => void;
  setPlaybackSpeed: (speed: number) => void;
  toggleLoop: () => void;
  setSleepTimer: (minutes: number | null) => void;
  setActiveAyahNumber: (num: number | null) => void;
  playNextSurah: () => void;
  playPreviousSurah: () => void;
  closePlayer: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial preferred reciter if saved
  const getInitialReciter = (): Reciter => {
    try {
      const savedId = localStorage.getItem('sadaqah_preferred_reciter_id');
      if (savedId) {
        const found = EXPANDED_RECITERS.find((r) => r.id === savedId);
        if (found) return found;
      }
    } catch (e) {}
    return RECITERS[0];
  };

  const [audioMode, setAudioMode] = useState<AudioMode>('surah');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSurah, setCurrentSurah] = useState<SurahMeta | null>(null);
  const [currentReciter, setCurrentReciterState] = useState<Reciter>(getInitialReciter);
  const [currentRadio, setCurrentRadio] = useState<MP3QRadio | null>(null);
  const [currentTafsir, setCurrentTafsir] = useState<AudioTafsirItem | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeedState] = useState<number>(1);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [activeAyahNumber, setActiveAyahNumber] = useState<number | null>(null);
  const [playlistQueue, setPlaylistQueue] = useState<number[] | null>(null);
  const [playlistTitle, setPlaylistTitle] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sleepTimerTimeoutRef = useRef<any>(null);
  const currentSurahRef = useRef<SurahMeta | null>(null);
  const currentReciterRef = useRef<Reciter>(currentReciter);
  const playlistQueueRef = useRef<number[] | null>(null);
  const playlistTitleRef = useRef<string | null>(null);
  const hasTriedFallbackRef = useRef<boolean>(false);

  // Keep refs in sync for event callbacks
  useEffect(() => {
    currentSurahRef.current = currentSurah;
  }, [currentSurah]);

  useEffect(() => {
    currentReciterRef.current = currentReciter;
  }, [currentReciter]);

  useEffect(() => {
    playlistQueueRef.current = playlistQueue;
  }, [playlistQueue]);

  useEffect(() => {
    playlistTitleRef.current = playlistTitle;
  }, [playlistTitle]);

  // Initialize Audio element once
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.preload = 'metadata';

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
      setAudioError(null);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
      setAudioError(null);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      if (audio.loop) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        setIsPlaying(false);
        playNextSurah();
      }
    };

    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);

      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setAudioError('التلاوة الصوتية تتطلب اتصالاً بالإنترنت — المصحف والأذكار والسبحة متاحة بالكامل بدون إنترنت');
        return;
      }

      // Attempt fallback URL if not already tried for this surah
      if (!hasTriedFallbackRef.current && currentSurahRef.current) {
        hasTriedFallbackRef.current = true;
        const fallbackUrl = getSurahFallbackAudioUrl(currentSurahRef.current.number);
        if (audio.src !== fallbackUrl) {
          audio.src = fallbackUrl;
          audio.load();
          audio.play().then(() => {
            setIsPlaying(true);
            setAudioError(null);
          }).catch(() => {
            setAudioError('تعذر تشغيل الصوت، انقر على زر التشغيل للمحاولة');
          });
          return;
        }
      }

      setAudioError('تعذر تشغيل الصوت من المصدر الحالي');
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      if (sleepTimerTimeoutRef.current) {
        clearTimeout(sleepTimerTimeoutRef.current);
      }
    };
  }, []);

  const playSurah = (surahNumber: number, reciter?: Reciter) => {
    const surah = ALL_SURAHS.find(s => s.number === surahNumber);
    if (!surah) return;

    const chosenReciter = reciter || currentReciterRef.current;
    setAudioMode('surah');
    setCurrentRadio(null);
    setCurrentTafsir(null);
    setCurrentSurah(surah);
    currentSurahRef.current = surah;
    setCurrentReciterState(chosenReciter);
    currentReciterRef.current = chosenReciter;
    setIsPlayerVisible(true);
    setIsLoading(true);
    setAudioError(null);
    hasTriedFallbackRef.current = false;

    const audioUrl = getSurahAudioUrl(chosenReciter, surah.number);
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.loop = isLooping;
      audioRef.current.load();

      // Configure native OS / lock screen media controls
      if (typeof navigator !== 'undefined' && 'mediaSession' in navigator && window.MediaMetadata) {
        try {
          navigator.mediaSession.metadata = new window.MediaMetadata({
            title: `سورة ${surah.name}`,
            artist: chosenReciter.name,
            album: 'صدقة جارية | القرآن الكريم',
            artwork: [
              { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
              { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            ],
          });
          navigator.mediaSession.setActionHandler('play', () => togglePlay());
          navigator.mediaSession.setActionHandler('pause', () => togglePlay());
          navigator.mediaSession.setActionHandler('previoustrack', () => playPreviousSurah());
          navigator.mediaSession.setActionHandler('nexttrack', () => playNextSurah());
        } catch {}
      }

      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
          setIsLoading(false);
          setAudioError(null);
        }).catch(err => {
          // If aborted because of new load request, do NOT override with fallback!
          if (err.name === 'AbortError') {
            return;
          }
          if (err.name === 'NotAllowedError') {
            setIsPlaying(false);
            setIsLoading(false);
            setAudioError('انقر على زر التشغيل لبدء الاستماع');
            return;
          }
          console.warn('Play error:', err);
          setIsPlaying(false);
          setIsLoading(false);
        });
      }
    }
  };

  const playRadio = (radio: MP3QRadio) => {
    setAudioMode('radio');
    setCurrentRadio(radio);
    setCurrentTafsir(null);
    setCurrentSurah(null);
    setIsPlayerVisible(true);
    setIsLoading(true);
    setAudioError(null);
    hasTriedFallbackRef.current = false;

    if (audioRef.current) {
      audioRef.current.src = radio.url;
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.playbackRate = 1;
      audioRef.current.loop = false;
      audioRef.current.load();

      if (typeof navigator !== 'undefined' && 'mediaSession' in navigator && window.MediaMetadata) {
        try {
          navigator.mediaSession.metadata = new window.MediaMetadata({
            title: radio.name,
            artist: 'إذاعات القرآن الكريم المباشرة 24/7',
            album: 'صدقة جارية | إذاعات القرآن',
            artwork: [
              { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
              { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            ],
          });
          navigator.mediaSession.setActionHandler('play', () => togglePlay());
          navigator.mediaSession.setActionHandler('pause', () => togglePlay());
        } catch {}
      }

      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setIsLoading(false);
        setAudioError(null);
      }).catch(err => {
        if (err.name === 'AbortError') return;
        setIsPlaying(false);
        setIsLoading(false);
        setAudioError('تعذر الاتصال بالبث الإذاعي، حاول مرة أخرى');
      });
    }
  };

  const playTafsir = (tafsir: AudioTafsirItem) => {
    setAudioMode('tafsir');
    setCurrentTafsir(tafsir);
    setCurrentRadio(null);
    setCurrentSurah(null);
    setIsPlayerVisible(true);
    setIsLoading(true);
    setAudioError(null);
    hasTriedFallbackRef.current = false;

    if (audioRef.current) {
      audioRef.current.src = tafsir.url;
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.loop = isLooping;
      audioRef.current.load();

      if (typeof navigator !== 'undefined' && 'mediaSession' in navigator && window.MediaMetadata) {
        try {
          navigator.mediaSession.metadata = new window.MediaMetadata({
            title: tafsir.title,
            artist: `تفسير سورة ${tafsir.surahName}`,
            album: 'صدقة جارية | التفاسير الصوتية',
            artwork: [
              { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
              { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            ],
          });
          navigator.mediaSession.setActionHandler('play', () => togglePlay());
          navigator.mediaSession.setActionHandler('pause', () => togglePlay());
        } catch {}
      }

      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setIsLoading(false);
        setAudioError(null);
      }).catch(err => {
        if (err.name === 'AbortError') return;
        setIsPlaying(false);
        setIsLoading(false);
        setAudioError('تعذر تشغيل الملف الصوتي للتفسير');
      });
    }
  };

  const playPlaylist = (surahNumbers: number[], title?: string, reciter?: Reciter) => {
    if (!surahNumbers || surahNumbers.length === 0) return;
    setPlaylistQueue(surahNumbers);
    playlistQueueRef.current = surahNumbers;
    setPlaylistTitle(title || null);
    playlistTitleRef.current = title || null;

    const chosenReciter = reciter || currentReciterRef.current;
    playSurah(surahNumbers[0], chosenReciter);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (audioMode === 'radio') {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else if (currentRadio) {
        playRadio(currentRadio);
      }
      return;
    }

    if (audioMode === 'tafsir') {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
      return;
    }

    if (!currentSurah) {
      playSurah(1, currentReciter);
      return;
    }

    // Ensure audio has a valid source URL assigned
    const currentSrc = audioRef.current.src;
    if (!currentSrc || currentSrc === '' || currentSrc === window.location.href) {
      playSurah(currentSurah.number, currentReciter);
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setAudioError(null);
      }).catch(err => {
        console.warn('Play attempt failed, reloading source:', err);
        playSurah(currentSurah.number, currentReciter);
      });
    }
  };

  const seekTo = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  const setVolumeLevel = (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolume(clamped);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : clamped;
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioRef.current) {
      audioRef.current.volume = nextMuted ? 0 : volume;
    }
  };

  const setReciter = (reciter: Reciter) => {
    setCurrentReciterState(reciter);
    currentReciterRef.current = reciter;
    try {
      localStorage.setItem('sadaqah_preferred_reciter_id', reciter.id);
    } catch (e) {}

    // Instantly switch current surah with the new reciter seamlessly
    const activeSurah = currentSurahRef.current;
    if (activeSurah) {
      const currentPos = audioRef.current?.currentTime || 0;
      playSurah(activeSurah.number, reciter);
      if (audioRef.current && currentPos > 0) {
        audioRef.current.currentTime = currentPos;
      }
    }
  };

  const setPlaybackSpeed = (speed: number) => {
    setPlaybackSpeedState(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const toggleLoop = () => {
    const nextLoop = !isLooping;
    setIsLooping(nextLoop);
    if (audioRef.current) {
      audioRef.current.loop = nextLoop;
    }
  };

  const setSleepTimer = (minutes: number | null) => {
    setSleepTimerMinutes(minutes);
    if (sleepTimerTimeoutRef.current) {
      clearTimeout(sleepTimerTimeoutRef.current);
      sleepTimerTimeoutRef.current = null;
    }
    if (minutes && minutes > 0) {
      sleepTimerTimeoutRef.current = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
        setSleepTimerMinutes(null);
      }, minutes * 60 * 1000);
    }
  };

  const playNextSurah = () => {
    const cur = currentSurahRef.current;
    if (!cur) return;

    // Check if in playlist queue
    if (playlistQueueRef.current && playlistQueueRef.current.length > 0) {
      const q = playlistQueueRef.current;
      const idx = q.indexOf(cur.number);
      if (idx !== -1 && idx < q.length - 1) {
        playSurah(q[idx + 1], currentReciterRef.current);
        return;
      } else if (idx === q.length - 1) {
        if (isLooping) {
          playSurah(q[0], currentReciterRef.current);
        } else {
          setIsPlaying(false);
        }
        return;
      }
    }

    const nextNum = cur.number < 114 ? cur.number + 1 : 1;
    playSurah(nextNum, currentReciterRef.current);
  };

  const playPreviousSurah = () => {
    const cur = currentSurahRef.current;
    if (!cur) return;

    // Check if in playlist queue
    if (playlistQueueRef.current && playlistQueueRef.current.length > 0) {
      const q = playlistQueueRef.current;
      const idx = q.indexOf(cur.number);
      if (idx > 0) {
        playSurah(q[idx - 1], currentReciterRef.current);
        return;
      } else if (idx === 0) {
        playSurah(q[q.length - 1], currentReciterRef.current);
        return;
      }
    }

    const prevNum = cur.number > 1 ? cur.number - 1 : 114;
    playSurah(prevNum, currentReciterRef.current);
  };

  const closePlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setIsPlayerVisible(false);
  };

  return (
    <AudioContext.Provider
      value={{
        audioMode,
        isPlaying,
        currentSurah,
        currentReciter,
        currentRadio,
        currentTafsir,
        currentTime,
        duration,
        volume,
        isMuted,
        isPlayerVisible,
        isLoading,
        audioError,
        playbackSpeed,
        isLooping,
        sleepTimerMinutes,
        activeAyahNumber,
        playlistQueue,
        playlistTitle,
        playSurah,
        playPlaylist,
        playRadio,
        playTafsir,
        togglePlay,
        seekTo,
        setVolumeLevel,
        toggleMute,
        setReciter,
        setPlaybackSpeed,
        toggleLoop,
        setSleepTimer,
        setActiveAyahNumber,
        playNextSurah,
        playPreviousSurah,
        closePlayer,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
