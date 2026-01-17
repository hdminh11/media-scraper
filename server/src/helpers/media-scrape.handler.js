const axios = require('axios');
const cheerio = require('cheerio');
const { resolveUrl, isVideoEmbed } = require('../utils');
const MediaModel = require('../model/media.model');

/**
 * Scrape media (images and videos) from a given URL
 * @param {String} url - The URL of the page to scrape
 * @returns {Promise<Array>} Array of media objects with {type, src, url, name?}
 */
const scrapeMedia = async (url) => {
    const response = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const media = [];

    // Scrape images
    $('img').each((index, element) => {
        const src = $(element).attr('src');
        const alt = $(element).attr('alt') || 'No alt text';

        if (src) {
            media.push({
                type: 'image',
                src: resolveUrl(src, url),
                name: alt,
                url: url,
            });
        }
    });

    // Scrape video tags with src attribute
    $('video').each((index, element) => {
        const src = $(element).attr('src');

        if (src) {
            media.push({
                type: 'video',
                src: resolveUrl(src, url),
                url: url,
            });
        }
    });

    // Scrape video sources from <source> tags inside <video>
    $('video source').each((index, element) => {
        const src = $(element).attr('src');

        if (src) {
            media.push({
                type: 'video',
                src: resolveUrl(src, url),
                url: url,
            });
        }
    });

    // Scrape video embeds (iframe)
    $('iframe').each((index, element) => {
        const src = $(element).attr('src');
        const title = $(element).attr('title') || 'No title';

        if (src && isVideoEmbed(src)) {
            media.push({
                src: src,
                type: 'video',
                url: url,
            });
        }
    });

    return media;
};

/**
 * Filter out duplicate media that already exist in database
 * @param {Array} mediaArray - Array of media objects
 * @param {String} url - Page URL
 * @returns {Promise<Array>} Filtered array with only new media
 */
filterNewMedia = async (mediaArray, url) => {
    const newMedia = [];

    for (const media of mediaArray) {
        const exists = await MediaModel.checkMediaExists(media.src, url);
        if (!exists) {
            newMedia.push(media);
        }
    }

    return newMedia;
};

module.exports = {
    scrapeMedia,
    filterNewMedia,
}