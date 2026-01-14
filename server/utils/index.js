'use strict';

const resolveUrl = (urlPath, baseUrl) => {
    try {
        // if urlPath is relative, resolve it against baseUrl
        return new URL(urlPath, baseUrl).href;
    } catch {
        // if urlPath is absolute, return it as is
        return urlPath;
    }
};

const isVideoEmbed = (src) => {
    const videoProviders = ['youtube', 'vimeo', 'dailymotion', 'twitch', 'video'];
    return videoProviders.some(provider => src.toLowerCase().includes(provider));
};

module.exports = {
    resolveUrl,
    isVideoEmbed
};