/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid URL, false otherwise
 */
const isValidUrl = (url) => {
    if (!url || typeof url !== 'string') {
        return false;
    }

    // Trim whitespace
    url = url.trim();

    // Check if empty after trim
    if (url.length === 0) {
        return false;
    }

    try {
        const urlObj = new URL(url);
        // Only allow http and https protocols
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch (error) {
        return false;
    }
};

module.exports = {
    isValidUrl,
}