'use strict';

const prisma = require('../prisma/prisma.client');

class MediaModel {
    /**
     * Create multiple media records in the database
     * @param {Array} mediaArray - Array of media objects with {type, src, url, name?}
     * @returns {Promise<Array>} Created media records
     */
    static async createMany(mediaArray) {
        try {
            if (!mediaArray || !Array.isArray(mediaArray) || mediaArray.length === 0) {
                return [];
            }
            const media = mediaArray.map(media => ({
                type: String(media.type).trim(),
                src: String(media.src).trim(),
                url: String(media.url).trim(),
                name: media.name ? String(media.name).trim() : null,
            }))

            console.log('MEDIA:: ', media);

            const created = await prisma.media.createMany({
                data: media,
            });

            return created;
        } catch (error) {
            throw new Error(`Failed to create media records: ${error.message}`);
        }
    }

    /**
     * Create a single media record in the database
     * @param {Object} media - Media object with {type, src, url, name?}
     * @returns {Promise<Object>} Created media record
     */
    static async create(media) {
        try {
            const created = await prisma.media.create({
                data: {
                    type: media.type,
                    src: media.src,
                    url: media.url,
                    name: media.name || null,
                },
            });

            return created;
        } catch (error) {
            throw new Error(`Failed to create media record: ${error.message}`);
        }
    }

    /**
     * Find all media records
     * @param {Object} options - Query options {skip?, take?, where?}
     * @returns {Promise<Array>} Media records
     */
    static async findAll(options = {}) {
        try {
            const media = await prisma.media.findMany({
                skip: options.skip || 0,
                take: options.take || 100,
                where: options.where || {},
                orderBy: options.orderBy || { createdAt: 'desc' },
            });

            return media;
        } catch (error) {
            throw new Error(`Failed to find media: ${error.message}`);
        }
    }

    /**
     * Count media records
     * @param {Object} where - Filter conditions
     * @returns {Promise<Number>} Count of media
     */
    static async count({ where = {} }) {
        try {
            const count = await prisma.media.count({ where });
            return count;
        } catch (error) {
            throw new Error(`Failed to count media: ${error.message}`);
        }
    }

    /**
     * Check if media already exists in database
     * @param {String} src - Media source URL
     * @param {String} url - Page URL where media was found
     * @returns {Promise<Boolean>}
     */
    static async checkMediaExists(src, url) {
        try {
            // Validate inputs
            if (!src || !url) {
                console.warn('⚠️  checkMediaExists called with invalid args:', { src, url });
                return false;
            }

            const existing = await prisma.media.findFirst({
                where: {
                    src: String(src).trim(),
                    url: String(url).trim()
                }
            });
            return existing !== null;
        } catch (error) {
            console.error('Error checking media existence:', error.message);
            return false;
        }
    };
}

module.exports = MediaModel;