const settings = require('../setting');
const cryptos = require('../helper/crypto');
const app = require('../service/app');

const WHITE = [ '/sign', '/private' ];

const _isInWhites = (url) => {
	let is = false;
	for(let item of WHITE) {
		if(url.startsWith(item) ) {
			is = true;
			break;
		}
	}
	return is;
};


/**
 * authorization
 */
module.exports = async(req, res, next) => {
	const reqPath = req.path;
	if(_isInWhites(reqPath)) {
		return next();
	}

	const { appid, nonce, time, sign } = req.query;
	if(!appid) {
		return res.failure('appid_required');
	}
	if(!nonce) {
		return res.failure('nonce_required');
	}
	if(!time) {
		return res.failure('time_required');
	}
	if(!sign) {
		return res.failure('sign_required');
	}
	try {
		const obj = await app.findById(appid);
		if (!obj) {
			return res.failure('invalid_appid');
		}
		// vefify
		const tmp = cryptos.sha256(`${appid}${nonce}${time}${settings.salt}`, obj.secret);
		if(tmp !== sign) {
			return res.failure('auth_failed');
		}
		next();
	} catch (err) {
		next(err);
	}
};