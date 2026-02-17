/**
 * API Configuration
 * ProductiveApp v4.0
 */

const ApiConfig = (function() {
    'use strict';

    const config = {
        BASE_URL: '/api/v1',
        TIMEOUT: 30000,
    };

    function getBaseUrl() {
        return config.BASE_URL;
    }

    function getTimeout() {
        return config.TIMEOUT;
    }

    function setBaseUrl(url) {
        config.BASE_URL = url;
    }

    return {
        getBaseUrl,
        getTimeout,
        setBaseUrl,
        get BASE_URL() { return config.BASE_URL; }
    };
})();

if (typeof window !== 'undefined') {
    window.ApiConfig = ApiConfig;
}
