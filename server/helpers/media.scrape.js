const axios = require('axios');
const cheerio = require('cheerio');
const { resolveUrl, isVideoEmbed } = require('../utils');

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
                name: alt
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
                title: title,
                name: 'video',
            });
        }
    });

    return media;
};

module.exports = {
    scrapeMedia,
}