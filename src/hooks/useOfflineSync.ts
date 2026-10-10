import { useState, useEffect } from 'react';
import { offlineSyncService, OfflineStatus } from '../services/offlineSyncService';

export function useOfflineSync() {
  const [status, setStatus] = useState<OfflineStatus>(() => offlineSyncService.getStatus());

  useEffect(() => {
    return offlineSyncService.subscribe((newStatus) => {
      setStatus(newStatus);
    });
  }, []);

  const triggerSync = async () => {
    return await offlineSyncService.triggerAutoSync();
  };

  return {
    ...status,
    triggerSync,
  };
}
