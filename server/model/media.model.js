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

            const created = await Promise.all(
                mediaArray.map(media =>
                    prisma.media.create({
                        data: {
                            type: media.type,
                            src: media.src,
                            url: media.url,
                            name: media.name || null,
                        },
                    })
                )
            );

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
     * Find media by ID
     * @param {Number} id - Media ID
     * @returns {Promise<Object|null>} Media record or null
     */
    static async findById(id) {
        try {
            const media = await prisma.media.findUnique({
                where: { id },
            });

            return media;
        } catch (error) {
            throw new Error(`Failed to find media by ID: ${error.message}`);
        }
    }

    /**
     * Find media by URL (page where it was scraped from)
     * @param {String} url - Source URL
     * @param {Object} options - Query options {skip?, take?}
     * @returns {Promise<Array>} Media records from that URL
     */
    static async findByUrl(url, options = {}) {
        try {
            const media = await prisma.media.findMany({
                where: { url },
                skip: options.skip || 0,
                take: options.take || 100,
                orderBy: { createdAt: 'desc' },
            });

            return media;
        } catch (error) {
            throw new Error(`Failed to find media by URL: ${error.message}`);
        }
    }

    /**
     * Find media by type (image or video)
     * @param {String} type - Media type ('image' or 'video')
     * @param {Object} options - Query options {skip?, take?}
     * @returns {Promise<Array>} Media records of that type
     */
    static async findByType(type, options = {}) {
        try {
            const media = await prisma.media.findMany({
                where: { type },
                skip: options.skip || 0,
                take: options.take || 100,
                orderBy: { createdAt: 'desc' },
            });

            return media;
        } catch (error) {
            throw new Error(`Failed to find media by type: ${error.message}`);
        }
    }

    /**
     * Count media records
     * @param {Object} where - Filter conditions
     * @returns {Promise<Number>} Count of media
     */
    static async count(where = {}) {
        try {
            const count = await prisma.media.count({ where });
            return count;
        } catch (error) {
            throw new Error(`Failed to count media: ${error.message}`);
        }
    }

    /**
     * Update a media record
     * @param {Number} id - Media ID
     * @param {Object} data - Data to update
     * @returns {Promise<Object>} Updated media record
     */
    static async update(id, data) {
        try {
            const updated = await prisma.media.update({
                where: { id },
                data,
            });

            return updated;
        } catch (error) {
            throw new Error(`Failed to update media: ${error.message}`);
        }
    }

    /**
     * Delete a media record
     * @param {Number} id - Media ID
     * @returns {Promise<Object>} Deleted media record
     */
    static async delete(id) {
        try {
            const deleted = await prisma.media.delete({
                where: { id },
            });

            return deleted;
        } catch (error) {
            throw new Error(`Failed to delete media: ${error.message}`);
        }
    }

    /**
     * Delete all media from a URL
     * @param {String} url - Source URL
     * @returns {Promise<Object>} Deletion info {count}
     */
    static async deleteByUrl(url) {
        try {
            const deleted = await prisma.media.deleteMany({
                where: { url },
            });

            return deleted;
        } catch (error) {
            throw new Error(`Failed to delete media by URL: ${error.message}`);
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
            const existing = await prisma.media.findFirst({
                where: {
                    src: src,
                    url: url
                },
                take: 1
            });
            return existing !== null;
        } catch (error) {
            console.error('Error checking media existence:', error.message);
            return false;
        }
    };
}

module.exports = MediaModel;