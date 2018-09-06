const crypto = require('crypto');

module.exports = {
    /**
     * md5
     */
    md5(str, salt) {
        const hash = crypto.createHash('md5');
        hash.update(str + (salt || ''));
        // hash.update(new Buffer(str + (salt || '')).toString('binary'));
        return hash.digest('hex');
    },

    /**
     * sha256
     */
    sha256(str, secret) {
        return crypto.createHmac('sha256', secret).update(str).digest('hex');
    },

    /**
     * unique id
     */
    unique(len) {
        len = len || 24;
        return crypto.randomBytes(Math.ceil(len/2)).toString('hex').slice(0,len);
    }
};
