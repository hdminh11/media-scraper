'use strict';


const { BadRequestError } = require("../core/error.response");
const { scrapeMedia } = require("../helpers/media.scrape");

class MediaService {
    ingest = async ({ urls }) => {
        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            throw new BadRequestError('Invalid URLs array');
        }

        const results = [];

        for (const url of urls) {
            try {
                const media = await scrapeMedia(url);
                results.push({
                    url,
                    success: true,
                    media
                });
            } catch (error) {
                results.push({
                    url,
                    success: false,
                    error: error.message
                });
            }
        }

        return results;
    }
}

module.exports = new MediaService();