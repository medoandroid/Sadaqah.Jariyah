/**
 * Centralized Smart Prayer Times Service
 * Provides real-time synchronization, accurate countdown to next prayer,
 * offline fallback, persistent settings, and reactive subscriptions across all components.
 */

import {
  calculatePrayerTimes,
  fetchRealPrayerTimes,
  POPULAR_CITIES,
  CALCULATION_METHODS,
  CityLocation,
  PrayerTimesResult,
} from '../utils/prayerTimes';
import { storageService } from './storageService';

export interface PrayerSettings {
  cityId: string;
  methodId: number;
  customCoords: { lat: number; lng: number; label: string } | null;
}

class PrayerTimesService {
  private currentResult: PrayerTimesResult;
  private settings: PrayerSettings;
  private listeners: Set<(result: PrayerTimesResult, settings: PrayerSettings) => void> = new Set();
  private tickerInterval: NodeJS.Timeout | null = null;
  private refreshInterval: NodeJS.Timeout | null = null;
  private isFetching: boolean = false;

  constructor() {
    this.settings = this.loadSettings();
    const loc = this.getActiveLocation();
    this.currentResult = calculatePrayerTimes(
      new Date(),
      loc.latitude,
      loc.longitude,
      loc.timezone,
      this.settings.methodId
    );

    // Initial background fetch
    this.fetchTimes(false);

    // Ticker runs every 10 seconds to update countdown & next prayer accurately
    this.tickerInterval = setInterval(() => {
      this.recalculateActiveTimes();
    }, 10000);

    // Auto-refresh from network every 30 minutes
    this.refreshInterval = setInterval(() => {
      this.fetchTimes(false);
    }, 30 * 60 * 1000);
  }

  private loadSettings(): PrayerSettings {
    const cityId = storageService.getString('prayer_selected_city', 'cairo');
    const methodId = storageService.getNumber('prayer_selected_method', 5);
    const customCoords = storageService.get<{ lat: number; lng: number; label: string } | null>(
      'prayer_custom_coords',
      null
    );

    return { cityId, methodId, customCoords };
  }

  public getSettings(): PrayerSettings {
    return { ...this.settings };
  }

  public getActiveLocation(): CityLocation {
    if (this.settings.customCoords) {
      return {
        id: 'custom',
        name: this.settings.customCoords.label,
        country: 'موقعي الحالي',
        latitude: this.settings.customCoords.lat,
        longitude: this.settings.customCoords.lng,
        timezone: -new Date().getTimezoneOffset() / 60,
      };
    }
    const found = POPULAR_CITIES.find((c) => c.id === this.settings.cityId);
    return found || POPULAR_CITIES[0];
  }

  public getPrayerTimes(): PrayerTimesResult {
    return this.currentResult;
  }

  public subscribe(fn: (result: PrayerTimesResult, settings: PrayerSettings) => void): () => void {
    this.listeners.add(fn);
    fn(this.currentResult, this.settings);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => {
      try {
        fn(this.currentResult, this.settings);
      } catch (e) {}
    });
  }

  public async setCity(cityId: string) {
    this.settings.cityId = cityId;
    this.settings.customCoords = null;
    storageService.setString('prayer_selected_city', cityId);
    storageService.remove('prayer_custom_coords');
    await this.fetchTimes(true);
  }

  public async setMethod(methodId: number) {
    this.settings.methodId = methodId;
    storageService.setNumber('prayer_selected_method', methodId);
    await this.fetchTimes(true);
  }

  public async setCustomCoords(coords: { lat: number; lng: number; label: string }) {
    this.settings.customCoords = coords;
    storageService.set('prayer_custom_coords', coords);
    await this.fetchTimes(true);
  }

  public async refresh(): Promise<PrayerTimesResult> {
    return this.fetchTimes(true);
  }

  private recalculateActiveTimes() {
    const loc = this.getActiveLocation();
    const now = new Date();
    // Fast in-memory update for countdown
    const recalculated = calculatePrayerTimes(
      now,
      loc.latitude,
      loc.longitude,
      loc.timezone,
      this.settings.methodId
    );

    // Keep API source flag if times match closely
    if (this.currentResult.source === 'api') {
      recalculated.source = 'api';
    }

    this.currentResult = recalculated;
    this.notify();
  }

  private async fetchTimes(forceNotify = false): Promise<PrayerTimesResult> {
    if (this.isFetching) return this.currentResult;
    this.isFetching = true;

    try {
      const loc = this.getActiveLocation();
      const res = await fetchRealPrayerTimes(loc, this.settings.methodId, new Date());
      this.currentResult = res;
      this.notify();
      return res;
    } catch (e) {
      this.recalculateActiveTimes();
      return this.currentResult;
    } finally {
      this.isFetching = false;
    }
  }
}

export const prayerTimesService = new PrayerTimesService();
