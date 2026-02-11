/**
 * ERROR TRACKER - ProductiveApp v5.0
 * Capture et logging automatique des erreurs frontend
 * Envoie vers /api/v1/monitoring/errors/log
 */

const ErrorTracker = (function() {
    'use strict';

    const API_ENDPOINT = '/api/v1/monitoring/errors/log';
    const MAX_QUEUE_SIZE = 50;
    const BATCH_INTERVAL = 5000; // 5 secondes
    const MAX_STACK_LENGTH = 5000;
    const MAX_MESSAGE_LENGTH = 1000;

    let errorQueue = [];
    let batchTimer = null;
    let isEnabled = true;

    /**
     * Initialize error tracker
     */
    function init() {
        if (!isEnabled) return;

        // Capture global errors
        window.addEventListener('error', handleError);

        // Capture unhandled promise rejections
        window.addEventListener('unhandledrejection', handlePromiseRejection);

        // Capture console.error (optionnel, peut être verbeux)
        // wrapConsoleError();

        console.log('🔍 ErrorTracker: Initialized');
    }

    /**
     * Handle window.onerror events
     */
    function handleError(event) {
        if (!isEnabled) return;

        const error = {
            message: truncate(event.message || 'Unknown error', MAX_MESSAGE_LENGTH),
            stack: truncate(event.error?.stack || '', MAX_STACK_LENGTH),
            errorType: event.error?.name || 'Error',
            url: window.location.href,
            severity: 'error',
            browserInfo: getBrowserInfo(),
            screenResolution: getScreenResolution(),
            viewportSize: getViewportSize(),
            metadata: {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                timestamp: Date.now(),
            },
        };

        queueError(error);

        // Ne pas empêcher le comportement par défaut
        return false;
    }

    /**
     * Handle unhandled promise rejections
     */
    function handlePromiseRejection(event) {
        if (!isEnabled) return;

        const reason = event.reason;
        const message = reason?.message || reason?.toString() || 'Unhandled Promise Rejection';
        const stack = reason?.stack || '';

        const error = {
            message: truncate(message, MAX_MESSAGE_LENGTH),
            stack: truncate(stack, MAX_STACK_LENGTH),
            errorType: 'UnhandledRejection',
            url: window.location.href,
            severity: 'error',
            browserInfo: getBrowserInfo(),
            screenResolution: getScreenResolution(),
            viewportSize: getViewportSize(),
            metadata: {
                reason: typeof reason === 'object' ? JSON.stringify(reason) : reason,
                timestamp: Date.now(),
            },
        };

        queueError(error);
    }

    /**
     * Manually log an error
     */
    function logError(error, severity = 'error') {
        if (!isEnabled) return;

        const errorObj = {
            message: truncate(error.message || error.toString(), MAX_MESSAGE_LENGTH),
            stack: truncate(error.stack || '', MAX_STACK_LENGTH),
            errorType: error.name || 'ManualError',
            url: window.location.href,
            severity,
            browserInfo: getBrowserInfo(),
            screenResolution: getScreenResolution(),
            viewportSize: getViewportSize(),
            metadata: {
                manual: true,
                timestamp: Date.now(),
            },
        };

        queueError(errorObj);
    }

    /**
     * Queue error for batch sending
     */
    function queueError(error) {
        // Add to queue
        errorQueue.push(error);

        // Limit queue size
        if (errorQueue.length > MAX_QUEUE_SIZE) {
            errorQueue.shift(); // Remove oldest
        }

        // Start batch timer if not already running
        if (!batchTimer) {
            batchTimer = setTimeout(flushErrors, BATCH_INTERVAL);
        }
    }

    /**
     * Flush errors to backend
     */
    async function flushErrors() {
        if (errorQueue.length === 0) {
            batchTimer = null;
            return;
        }

        const errorsToSend = [...errorQueue];
        errorQueue = [];
        batchTimer = null;

        // Send errors one by one (rate limited to 10/minute on backend)
        for (const error of errorsToSend) {
            try {
                await sendError(error);
                // Small delay to avoid rate limit
                await sleep(100);
            } catch (err) {
                // Silent fail - don't log errors about error logging
                console.warn('Failed to send error log:', err);
            }
        }
    }

    /**
     * Send single error to backend
     */
    async function sendError(error) {
        const token = localStorage.getItem('token');
        const memberId = localStorage.getItem('memberId');

        const payload = {
            ...error,
            memberId: memberId || undefined,
            errorTimestamp: new Date().toISOString(),
        };

        const headers = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return response.json();
    }

    /**
     * Get browser info
     */
    function getBrowserInfo() {
        const ua = navigator.userAgent;
        let name = 'Unknown';
        let version = 'Unknown';

        // Detect browser
        if (ua.indexOf('Firefox') > -1) {
            name = 'Firefox';
            version = ua.match(/Firefox\/(\d+\.\d+)/)?.[1] || '';
        } else if (ua.indexOf('Edg') > -1) {
            name = 'Edge';
            version = ua.match(/Edg\/(\d+\.\d+)/)?.[1] || '';
        } else if (ua.indexOf('Chrome') > -1) {
            name = 'Chrome';
            version = ua.match(/Chrome\/(\d+\.\d+)/)?.[1] || '';
        } else if (ua.indexOf('Safari') > -1) {
            name = 'Safari';
            version = ua.match(/Version\/(\d+\.\d+)/)?.[1] || '';
        }

        return {
            name,
            version,
            platform: navigator.platform,
            language: navigator.language,
        };
    }

    /**
     * Get screen resolution
     */
    function getScreenResolution() {
        return `${screen.width}x${screen.height}`;
    }

    /**
     * Get viewport size
     */
    function getViewportSize() {
        return `${window.innerWidth}x${window.innerHeight}`;
    }

    /**
     * Truncate string
     */
    function truncate(str, maxLength) {
        if (!str) return '';
        if (str.length <= maxLength) return str;
        return str.substring(0, maxLength) + '...';
    }

    /**
     * Sleep helper
     */
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Enable/disable tracker
     */
    function enable() {
        isEnabled = true;
    }

    function disable() {
        isEnabled = false;
    }

    /**
     * Get status
     */
    function getStatus() {
        return {
            enabled: isEnabled,
            queueSize: errorQueue.length,
            endpoint: API_ENDPOINT,
        };
    }

    return {
        init,
        logError,
        enable,
        disable,
        getStatus,
        flushErrors,
    };
})();

// Auto-init when DOM ready
if (typeof window !== 'undefined') {
    window.ErrorTracker = ErrorTracker;

    if (document.readyState !== 'loading') {
        ErrorTracker.init();
    } else {
        document.addEventListener('DOMContentLoaded', ErrorTracker.init);
    }
}
