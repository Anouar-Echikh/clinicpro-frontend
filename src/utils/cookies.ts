interface CookieOptions {
  days?: number;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  httpOnly?: boolean;
}

/**
 * Utility functions for iframe detection and handling
 */
export const iframeUtils = {
  /**
   * Check if the current page is being displayed in an iframe
   */
  isInIframe(): boolean {
    try {
      return window.location !== window.parent.location;
    } catch (e) {
      // If we can't access parent.location due to cross-origin restrictions,
      // we're definitely in an iframe from a different domain
      return true;
    }
  },

  /**
   * Check if we're in a cross-origin iframe (different domain)
   */
  isInCrossOriginIframe(): boolean {
    try {
      // Try to access parent origin
      return window.location.origin !== window.parent.location.origin;
    } catch (e) {
      // Cross-origin restriction means we're in a cross-origin iframe
      return true;
    }
  },

  /**
   * Get appropriate cookie settings for the current context
   */
  getCookieSettings(): { secure: boolean; sameSite: 'strict' | 'lax' | 'none' } {
    const isHTTPS = window.location.protocol === 'https:';
    const isInCrossOriginIframe = this.isInCrossOriginIframe();

    if (isInCrossOriginIframe) {
      // For cross-origin iframes, we need SameSite=None and Secure
      return {
        secure: true, // Required for SameSite=None
        sameSite: 'none'
      };
    } else {
      // For same-origin or top-level contexts, use more restrictive settings
      return {
        secure: isHTTPS,
        sameSite: 'lax'
      };
    }
  }
};

export const cookieUtils = {
  /**
   * Set a cookie with optional configuration
   */
  set(name: string, value: string, options: CookieOptions = {}): void {
    const defaultSettings = iframeUtils.getCookieSettings();
    const {
      days = 7, // Default to 7 days
      secure = defaultSettings.secure,
      sameSite = defaultSettings.sameSite
    } = options;

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      cookieString += `; expires=${date.toUTCString()}`;
    }

    cookieString += `; path=/`;
    
    if (secure) {
      cookieString += '; secure';
    }
    
    cookieString += `; samesite=${sameSite}`;

    console.log(`🍪 Setting cookie ${name} with settings:`, { secure, sameSite, isInIframe: iframeUtils.isInIframe() });
    document.cookie = cookieString;
  },

  /**
   * Get a cookie value by name
   */
  get(name: string): string | null {
    const nameEQ = encodeURIComponent(name) + '=';
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }
    
    return null;
  },

  /**
   * Remove a cookie by setting its expiration to the past
   */
  remove(name: string): void {
    this.set(name, '', { days: -1 });
  },

  /**
   * Check if a cookie exists
   */
  exists(name: string): boolean {
    return this.get(name) !== null;
  }
};

// Fallback storage utilities for iframe contexts
export const fallbackStorage = {
  /**
   * Set value in sessionStorage as fallback
   */
  set(key: string, value: string): void {
    try {
      sessionStorage.setItem(key, value);
      console.log(`💾 Fallback storage - Set ${key} in sessionStorage`);
    } catch (e) {
      console.warn(`💾 Fallback storage - Failed to set ${key} in sessionStorage:`, e);
    }
  },

  /**
   * Get value from sessionStorage
   */
  get(key: string): string | null {
    try {
      return sessionStorage.getItem(key);
    } catch (e) {
      console.warn(`💾 Fallback storage - Failed to get ${key} from sessionStorage:`, e);
      return null;
    }
  },

  /**
   * Remove value from sessionStorage
   */
  remove(key: string): void {
    try {
      sessionStorage.removeItem(key);
      console.log(`💾 Fallback storage - Removed ${key} from sessionStorage`);
    } catch (e) {
      console.warn(`💾 Fallback storage - Failed to remove ${key} from sessionStorage:`, e);
    }
  },

  /**
   * Check if value exists in sessionStorage
   */
  exists(key: string): boolean {
    try {
      return sessionStorage.getItem(key) !== null;
    } catch (e) {
      return false;
    }
  }
};

// Clinic-specific cookie utilities
export const clinicCookies = {
  /**
   * Set clinic selection data
   */
  setClinicData(clinicId: string, token: string): void {
    // Try to set cookies first
    cookieUtils.set('selected_clinic_id', clinicId, { days: 30 });
    cookieUtils.set('clinic_token', token, { days: 30 });
    
    // Also set in fallback storage for iframe contexts
    fallbackStorage.set('selected_clinic_id', clinicId);
    fallbackStorage.set('clinic_token', token);
  },

  /**
   * Set only the authentication token (without clinic ID)
   */
  setAuthToken(token: string): void {
    cookieUtils.set('clinic_token', token, { days: 30 });
    fallbackStorage.set('clinic_token', token);
  },

  /**
   * Get clinic ID from cookies or fallback storage
   */
  getClinicId(): string | null {
    const cookieValue = cookieUtils.get('selected_clinic_id');
    if (cookieValue) return cookieValue;
    
    // Fallback to sessionStorage
    return fallbackStorage.get('selected_clinic_id');
  },

  /**
   * Get clinic token from cookies or fallback storage
   */
  getClinicToken(): string | null {
    const cookieValue = cookieUtils.get('clinic_token');
    if (cookieValue) return cookieValue;
    
    // Fallback to sessionStorage
    return fallbackStorage.get('clinic_token');
  },

  /**
   * Check if clinic data exists in cookies or fallback storage
   */
  hasClinicData(): boolean {
    const hasInCookies = cookieUtils.exists('selected_clinic_id') && cookieUtils.exists('clinic_token');
    const hasInFallback = fallbackStorage.exists('selected_clinic_id') && fallbackStorage.exists('clinic_token');
    return hasInCookies || hasInFallback;
  },

  /**
   * Clear all clinic data from cookies and fallback storage
   */
  clearClinicData(): void {
    cookieUtils.remove('selected_clinic_id');
    cookieUtils.remove('clinic_token');
    fallbackStorage.remove('selected_clinic_id');
    fallbackStorage.remove('clinic_token');
  },

  /**
   * Check if we have a valid authentication token (regardless of clinic selection)
   */
  hasAuthToken(): boolean {
    return cookieUtils.exists('clinic_token') || fallbackStorage.exists('clinic_token');
  },

  /**
   * Check if the auth token appears to be valid (basic format check)
   */
  isTokenValid(): boolean {
    const token = this.getClinicToken();
    if (!token) return false;
    
    // Basic JWT format check (should have 3 parts separated by dots)
    const parts = token.split('.');
    return parts.length === 3 && parts.every(part => part.length > 0);
  },

  /**
   * Get storage diagnostics for debugging
   */
  getStorageDiagnostics(): {
    isInIframe: boolean;
    isInCrossOriginIframe: boolean;
    cookieSettings: { secure: boolean; sameSite: string };
    tokenInCookies: boolean;
    tokenInFallback: boolean;
    clinicIdInCookies: boolean;
    clinicIdInFallback: boolean;
  } {
    return {
      isInIframe: iframeUtils.isInIframe(),
      isInCrossOriginIframe: iframeUtils.isInCrossOriginIframe(),
      cookieSettings: iframeUtils.getCookieSettings(),
      tokenInCookies: cookieUtils.exists('clinic_token'),
      tokenInFallback: fallbackStorage.exists('clinic_token'),
      clinicIdInCookies: cookieUtils.exists('selected_clinic_id'),
      clinicIdInFallback: fallbackStorage.exists('selected_clinic_id')
    };
  },

  /**
   * Migrate from localStorage to cookies if data exists
   */
  migrateFromLocalStorage(): void {
    const clinicId = localStorage.getItem('selected_clinic_id');
    const clinicToken = localStorage.getItem('clinic_token');

    if (clinicId && clinicToken && !this.hasClinicData()) {
      console.log('🍪 Migrating clinic data from localStorage to cookies/fallback storage');
      this.setClinicData(clinicId, clinicToken);
      
      // Clean up localStorage
      localStorage.removeItem('selected_clinic_id');
      localStorage.removeItem('clinic_token');
    }
  }
}; 