/**
 * ERROR TRACKER - Auto-capture frontend errors
 * Sends errors to backend for monitoring
 */

const ErrorTracker = {
  recent: new Set(),
  initialized: false,

  init() {
    if (this.initialized) return;
    this.initialized = true;

    // Capture window errors
    window.onerror = (msg, url, line, col, error) => {
      this.logError({
        message: String(msg),
        stack: error?.stack || `at ${url}:${line}:${col}`,
        url: window.location.href,
        severity: 'error',
      });
      return false; // Let default handler run too
    };

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (e) => {
      this.logError({
        message: e.reason?.message || String(e.reason) || 'Unhandled Promise Rejection',
        stack: e.reason?.stack || '',
        url: window.location.href,
        severity: 'warning',
      });
    });

    console.log('%c✅ ErrorTracker initialized', 'color: #22c55e; font-weight: bold');
  },

  async logError(error) {
    // Debounce duplicates (max 1 identical error per 30s)
    const key = `${error.message}:${error.url}`;
    if (this.recent.has(key)) return;
    
    this.recent.add(key);
    setTimeout(() => this.recent.delete(key), 30000);

    // Log to console for development
    console.error('🐛 Frontend Error:', error.message);

    // Send to backend
    try {
      const token = (typeof ApiTokens !== 'undefined' && ApiTokens.getAccessToken)
        ? ApiTokens.getAccessToken()
        : localStorage.getItem('accessToken');

      if (!token) {
        console.warn('ErrorTracker: No auth token, skipping backend log');
        return;
      }

      await fetch('/api/v1/monitoring/errors/log', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...error,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.warn('Failed to log error to backend:', err);
    }
  },
};

window.ErrorTracker = ErrorTracker;
