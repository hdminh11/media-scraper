'use strict';
const MediaModel = require("../model/media.model");

class MediaService {
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

        // Get paginated records and total count in parallel
        const [mediaRecords, total] = await Promise.all([
            MediaModel.findAll({
                skip,
                take: limit,
                where
            }),
            MediaModel.count({ where })
        ]);
        
        return {
            data: mediaRecords,
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
        };
    }
}

module.exports = new MediaService();