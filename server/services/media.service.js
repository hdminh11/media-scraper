'use strict';


const { getAllMedia } = require("../controllers/media.controller");
const { BadRequestError } = require("../core/error.response");
const { scrapeMedia, filterNewMedia } = require("../helpers/media.scrape");
const MediaModel = require("../model/media.model");

class MediaService {
    ingest = async ({ urls }) => {
        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            throw new BadRequestError('Invalid URLs array');
        }

        const results = [];

        for (const url of urls) {
            try {
                const scrapedMedia = await scrapeMedia(url);
                
                // Filter out duplicates that already exist in database
                const newMedia = await filterNewMedia(scrapedMedia, url);
                
                results.push({
                    url,
                    success: true,
                    media: scrapedMedia,
                    newMedia: newMedia,
                    duplicates: scrapedMedia.length - newMedia.length,
                    saved: newMedia.length
                });

                // Save only new media to database
                if (newMedia.length > 0) {
                    MediaModel.createMany(newMedia)
                        .catch(err => console.error(`Failed to save media for ${url}:`, err));
                }
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

    getAllMedia = async ({ searchText, page = 1, limit = 20, type }) => {
        const skip = (page - 1) * limit;

        const where = searchText ? {
            OR: [
                { src: { contains: searchText, mode: 'insensitive' } },
                { url: { contains: searchText, mode: 'insensitive' } },
                { name: { contains: searchText, mode: 'insensitive' } },
            ]
        } : {};

        if (type) {
            where.type = type;
        }

        const mediaRecords = await MediaModel.findAll({
            skip,
            take: limit,
            where
        });
        
        return mediaRecords;
    }
}

module.exports = new MediaService();