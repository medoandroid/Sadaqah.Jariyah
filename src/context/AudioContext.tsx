import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Reciter, SurahMeta, RepeatMode } from '../types';
import { RECITERS, EXPANDED_RECITERS, getSurahAudioUrl, getSurahFallbackAudioUrl } from '../data/reciters';
import { ALL_SURAHS } from '../data/quranMeta';
import { MP3QRadio } from '../types/mp3quran';
import { audioDownloadService } from '../services/audioDownloadService';

export type AudioMode = 'surah' | 'radio' | 'tafsir' | 'custom';
export type RadioConnectionState = 'idle' | 'connecting' | 'reconnecting' | 'connected' | 'error';

export interface AudioTafsirItem {
  title: string;
  surahNumber: number;
  surahName: string;
  url: string;
}

export interface LastListeningSession {
  surahNumber: number;
  surahName: string;
  reciterId: string;
  reciterName: string;
  currentTime: number;
  duration: number;
  savedAt: number;
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
  repeatMode: RepeatMode;
  sleepTimerMinutes: number | null;
  activeAyahNumber: number | null;
  playlistQueue: number[] | null;
  playlistTitle: string | null;
  listeningQueue: number[];
  radioConnectionState: RadioConnectionState;
  radioRetryCount: number;
  lastListeningSession: LastListeningSession | null;
  playSurah: (surahNumber: number, reciter?: Reciter, startTime?: number) => void;
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
  setRepeatMode: (mode: RepeatMode) => void;
  cycleRepeatMode: () => void;
  addToQueue: (surahNumber: number) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setSleepTimer: (minutes: number | null) => void;
  setActiveAyahNumber: (num: number | null) => void;
  playNextSurah: () => void;
  playPreviousSurah: () => void;
  resumeLastSession: () => void;
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
  const [repeatMode, setRepeatModeState] = useState<RepeatMode>('continuous');
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [activeAyahNumber, setActiveAyahNumber] = useState<number | null>(null);
  const [playlistQueue, setPlaylistQueue] = useState<number[] | null>(null);
  const [playlistTitle, setPlaylistTitle] = useState<string | null>(null);
  const [listeningQueue, setListeningQueue] = useState<number[]>([]);
  const [radioConnectionState, setRadioConnectionState] = useState<RadioConnectionState>('idle');
  const [radioRetryCount, setRadioRetryCount] = useState<number>(0);

  // Load last listening session from localStorage
  const [lastListeningSession, setLastListeningSession] = useState<LastListeningSession | null>(() => {
    try {
      const raw = localStorage.getItem('sadaqah_last_listening_session_v1');
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sleepTimerTimeoutRef = useRef<any>(null);
  const currentSurahRef = useRef<SurahMeta | null>(null);
  const currentReciterRef = useRef<Reciter>(currentReciter);
  const currentRadioRef = useRef<MP3QRadio | null>(null);
  const audioModeRef = useRef<AudioMode>(audioMode);
  const playlistQueueRef = useRef<number[] | null>(null);
  const playlistTitleRef = useRef<string | null>(null);
  const listeningQueueRef = useRef<number[]>([]);
  const repeatModeRef = useRef<RepeatMode>('continuous');
  const hasTriedFallbackRef = useRef<boolean>(false);

  // Radio reconnect refs
  const radioRetryCountRef = useRef<number>(0);
  const radioRetryTimeoutRef = useRef<any>(null);
  const radioWatchdogTimeoutRef = useRef<any>(null);
  const lastTimeSaveRef = useRef<number>(0);

  // Keep refs in sync for event callbacks
  useEffect(() => {
    currentSurahRef.current = currentSurah;
  }, [currentSurah]);

  useEffect(() => {
    currentReciterRef.current = currentReciter;
  }, [currentReciter]);

  useEffect(() => {
    currentRadioRef.current = currentRadio;
  }, [currentRadio]);

  useEffect(() => {
    audioModeRef.current = audioMode;
  }, [audioMode]);

  useEffect(() => {
    playlistQueueRef.current = playlistQueue;
  }, [playlistQueue]);

  useEffect(() => {
    playlistTitleRef.current = playlistTitle;
  }, [playlistTitle]);

  useEffect(() => {
    listeningQueueRef.current = listeningQueue;
  }, [listeningQueue]);

  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  // Clean radio timers helper
  const clearRadioTimers = () => {
    if (radioRetryTimeoutRef.current) {
      clearTimeout(radioRetryTimeoutRef.current);
      radioRetryTimeoutRef.current = null;
    }
    if (radioWatchdogTimeoutRef.current) {
      clearTimeout(radioWatchdogTimeoutRef.current);
      radioWatchdogTimeoutRef.current = null;
    }
  };

  // Perform smart radio reconnect attempt
  const attemptRadioReconnect = (radio: MP3QRadio) => {
    if (!audioRef.current) return;
    clearRadioTimers();

    const maxRetries = 3;
    if (radioRetryCountRef.current < maxRetries) {
      radioRetryCountRef.current += 1;
      setRadioRetryCount(radioRetryCountRef.current);
      setRadioConnectionState('reconnecting');
      setIsLoading(true);
      setAudioError(`جاري محاولة الاتصال بالبث تلقائياً (محاولة ${radioRetryCountRef.current} من ${maxRetries})...`);

      const delays = [700, 1600, 2800];
      const delay = delays[radioRetryCountRef.current - 1] || 1500;

      radioRetryTimeoutRef.current = setTimeout(() => {
        if (!audioRef.current || audioModeRef.current !== 'radio' || currentRadioRef.current?.id !== radio.id) {
          return;
        }

        const audio = audioRef.current;
        try {
          audio.pause();
          audio.removeAttribute('src');
          audio.load();

          // Add subtle timestamp query to prevent cached stale icecast socket
          const connector = radio.url.includes('?') ? '&' : '?';
          const freshUrl = `${radio.url}${connector}t=${Date.now()}`;
          audio.src = freshUrl;
          audio.load();

          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              clearRadioTimers();
              radioRetryCountRef.current = 0;
              setRadioRetryCount(0);
              setRadioConnectionState('connected');
              setIsLoading(false);
              setIsPlaying(true);
              setAudioError(null);
            }).catch((err) => {
              if (err.name === 'AbortError') return;
              attemptRadioReconnect(radio);
            });
          }
        } catch {
          attemptRadioReconnect(radio);
        }
      }, delay);
    } else {
      setRadioConnectionState('error');
      setIsLoading(false);
      setIsPlaying(false);
      setAudioError('تعذر الاتصال بالبث الإذاعي حالياً، يمكنك المحاولة مرة أخرى أو اختيار إذاعة أخرى');
    }
  };

  // Initialize Audio element once
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.preload = 'metadata';

    const handleTimeUpdate = () => {
      const cur = audio.currentTime;
      setCurrentTime(cur);

      // Periodically persist last listening session for Surah mode (every 4 seconds)
      const now = Date.now();
      if (
        audioModeRef.current === 'surah' &&
        currentSurahRef.current &&
        now - lastTimeSaveRef.current > 4000 &&
        cur > 2
      ) {
        lastTimeSaveRef.current = now;
        const session: LastListeningSession = {
          surahNumber: currentSurahRef.current.number,
          surahName: currentSurahRef.current.name,
          reciterId: currentReciterRef.current.id,
          reciterName: currentReciterRef.current.name,
          currentTime: Math.floor(cur),
          duration: Math.floor(audio.duration || 0),
          savedAt: now,
        };
        setLastListeningSession(session);
        try {
          localStorage.setItem('sadaqah_last_listening_session_v1', JSON.stringify(session));
        } catch {}
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
      if (audioModeRef.current !== 'radio') {
        setAudioError(null);
      }
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handlePlaying = () => {
      clearRadioTimers();
      setIsLoading(false);
      setIsPlaying(true);
      setAudioError(null);
      if (audioModeRef.current === 'radio') {
        setRadioConnectionState('connected');
        radioRetryCountRef.current = 0;
        setRadioRetryCount(0);
      }
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

      // Handle radio error automatically with smart progressive retry
      if (audioModeRef.current === 'radio' && currentRadioRef.current) {
        attemptRadioReconnect(currentRadioRef.current);
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

    // Auto resume radio when coming back online
    const handleOnline = () => {
      if (audioModeRef.current === 'radio' && currentRadioRef.current) {
        attemptRadioReconnect(currentRadioRef.current);
      }
    };

    window.addEventListener('online', handleOnline);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      clearRadioTimers();
      window.removeEventListener('online', handleOnline);
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

  const playSurah = async (surahNumber: number, reciter?: Reciter, startTime?: number) => {
    clearRadioTimers();
    const surah = ALL_SURAHS.find(s => s.number === surahNumber);
    if (!surah) return;

    const chosenReciter = reciter || currentReciterRef.current;
    setAudioMode('surah');
    audioModeRef.current = 'surah';
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
    setRadioConnectionState('idle');

    // Check if downloaded offline copy is available
    let audioUrl = getSurahAudioUrl(chosenReciter, surah.number);
    try {
      const offlineBlobUrl = await audioDownloadService.getOfflineAudioUrl(surah.number, chosenReciter.id);
      if (offlineBlobUrl) {
        audioUrl = offlineBlobUrl;
      }
    } catch {}

    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.loop = isLooping;
      audioRef.current.load();

      if (startTime && startTime > 0) {
        audioRef.current.currentTime = startTime;
      }

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
          if (err.name === 'AbortError') return;
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
    clearRadioTimers();
    setAudioMode('radio');
    audioModeRef.current = 'radio';
    setCurrentRadio(radio);
    currentRadioRef.current = radio;
    setCurrentTafsir(null);
    setCurrentSurah(null);
    setIsPlayerVisible(true);
    setIsLoading(true);
    setAudioError(null);
    hasTriedFallbackRef.current = false;
    setRadioConnectionState('connecting');
    radioRetryCountRef.current = 0;
    setRadioRetryCount(0);

    if (audioRef.current) {
      const audio = audioRef.current;
      audio.pause();
      audio.removeAttribute('src');
      audio.load();

      audio.src = radio.url;
      audio.volume = isMuted ? 0 : volume;
      audio.playbackRate = 1;
      audio.loop = false;
      audio.load();

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

      // Start watchdog: if stalled for more than 7.5 seconds without playing, reconnect
      radioWatchdogTimeoutRef.current = setTimeout(() => {
        if (audioModeRef.current === 'radio' && currentRadioRef.current?.id === radio.id && !audio.paused && audio.readyState < 2) {
          attemptRadioReconnect(radio);
        }
      }, 7500);

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          clearRadioTimers();
          setIsPlaying(true);
          setIsLoading(false);
          setAudioError(null);
          setRadioConnectionState('connected');
        }).catch(err => {
          if (err.name === 'AbortError') return;
          console.warn('Initial radio play rejected, attempting smart reconnect:', err);
          attemptRadioReconnect(radio);
        });
      }
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
    setRepeatModeState(nextLoop ? 'repeat-one' : 'continuous');
    repeatModeRef.current = nextLoop ? 'repeat-one' : 'continuous';
    if (audioRef.current) {
      audioRef.current.loop = nextLoop;
    }
  };

  const setRepeatMode = (mode: RepeatMode) => {
    setRepeatModeState(mode);
    repeatModeRef.current = mode;
    const looping = mode === 'repeat-one';
    setIsLooping(looping);
    if (audioRef.current) {
      audioRef.current.loop = looping;
    }
  };

  const cycleRepeatMode = () => {
    const modes: RepeatMode[] = ['continuous', 'repeat-one', 'repeat-all', 'shuffle'];
    const currentIdx = modes.indexOf(repeatModeRef.current);
    const nextMode = modes[(currentIdx + 1) % modes.length];
    setRepeatMode(nextMode);
  };

  const addToQueue = (surahNumber: number) => {
    setListeningQueue((prev) => [...prev, surahNumber]);
  };

  const removeFromQueue = (index: number) => {
    setListeningQueue((prev) => prev.filter((_, i) => i !== index));
  };

  const clearQueue = () => {
    setListeningQueue([]);
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

    // 1. Check if user has explicit surahs in listeningQueue
    if (listeningQueueRef.current && listeningQueueRef.current.length > 0) {
      const nextSurahNum = listeningQueueRef.current[0];
      setListeningQueue((prev) => prev.slice(1));
      playSurah(nextSurahNum, currentReciterRef.current);
      return;
    }

    // 2. Check if in active playlistQueue
    if (playlistQueueRef.current && playlistQueueRef.current.length > 0) {
      const q = playlistQueueRef.current;
      const idx = q.indexOf(cur.number);
      if (idx !== -1 && idx < q.length - 1) {
        playSurah(q[idx + 1], currentReciterRef.current);
        return;
      } else if (idx === q.length - 1) {
        if (repeatModeRef.current === 'repeat-all' || isLooping) {
          playSurah(q[0], currentReciterRef.current);
        } else {
          setIsPlaying(false);
        }
        return;
      }
    }

    // 3. Normal sequential playback according to repeatMode
    if (repeatModeRef.current === 'shuffle') {
      let randomNum = Math.floor(Math.random() * 114) + 1;
      if (randomNum === cur.number) {
        randomNum = (randomNum % 114) + 1;
      }
      playSurah(randomNum, currentReciterRef.current);
      return;
    }

    if (repeatModeRef.current === 'repeat-all') {
      const nextNum = cur.number < 114 ? cur.number + 1 : 1;
      playSurah(nextNum, currentReciterRef.current);
      return;
    }

    // Default 'continuous' mode
    if (cur.number < 114) {
      playSurah(cur.number + 1, currentReciterRef.current);
    } else {
      setIsPlaying(false);
    }
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

  const resumeLastSession = () => {
    if (!lastListeningSession) return;
    const targetReciter = EXPANDED_RECITERS.find((r) => r.id === lastListeningSession.reciterId) || currentReciterRef.current;
    playSurah(lastListeningSession.surahNumber, targetReciter, lastListeningSession.currentTime);
  };

  const closePlayer = () => {
    clearRadioTimers();
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setIsPlayerVisible(false);
    setRadioConnectionState('idle');
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
        repeatMode,
        listeningQueue,
        sleepTimerMinutes,
        activeAyahNumber,
        playlistQueue,
        playlistTitle,
        radioConnectionState,
        radioRetryCount,
        lastListeningSession,
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
        setRepeatMode,
        cycleRepeatMode,
        addToQueue,
        removeFromQueue,
        clearQueue,
        setSleepTimer,
        setActiveAyahNumber,
        playNextSurah,
        playPreviousSurah,
        resumeLastSession,
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
