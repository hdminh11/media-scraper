'use strict';

const { SuccessResponse } = require("../core/success.response");

const { addScrapingJob } = require("../queue");
const mediaService = require("../services/media.service");

class MediaController {
    /**
     * Add URLs to queue for scraping (async)
     * Returns immediately, jobs process in background
     */
    ingest = async (req, res, next) => {
        const urls = req.body.urls;

        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            return new SuccessResponse({
                message: 'Invalid URLs array',
                metadata: { queued: 0 }
            }).send(res);
        }

        const jobIds = [];
        const failedUrls = [];

        for (const url of urls) {
            try {
                const job = await addScrapingJob(url);
                jobIds.push(job.id);
            } catch (error) {
                failedUrls.push({ url, error: error.message });
            }
        }

        new SuccessResponse({
            metadata: {
                queued: jobIds.length,
                failed: failedUrls.length,
                jobIds,
                failedUrls
            }
        }).send(res);
    };

    getAllMedia = async (req, res, next) => {
        const { searchText, page, pageSize, type } = req.query;
        const result = await mediaService.getAllMedia({
            searchText,
            page: parseInt(page) || 1,
            limit: parseInt(pageSize) || 20,
            type
        });

        new SuccessResponse({
            metadata: result,
        }).send(res);
    }
}

module.exports = new MediaController();