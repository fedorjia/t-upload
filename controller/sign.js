const express = require('express');
const router = express.Router({mergeParams: true});
const fs = require('fs');
const { query, validationResult } = require('express-validator/check');

const app = require('../service/app');
const setting = require('../setting');
const cryptos = require('../helper/crypto');
const ValidateError = require('../error/validate-error');


/********************************************
 * signature
 * query:
 * 		appid
 * 		secret
 *******************************************/
router.get('', [
	query('appid', 'appid_required').trim().isLength({ min: 1 }),
	query('secret', 'secret_required').trim().isLength({ min: 1 })
], async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.failure(new ValidateError(errors.array()));
		}
		const {appid, secret} = req.query;
		let obj = await app.findById(appid);
		if (!obj) {
			return res.failure('invalid_appid');
		}
		if (obj.secret !== secret) {
			return res.failure('invalid_secret');
		}
		const time = Date.now();
		const nonce = cryptos.unique();
		const sign = cryptos.sha256(`${appid}${nonce}${time}${setting.salt}`, secret);
		res.success({appid, nonce, sign, time});
	} catch (err) {
		next(err);
	}
});

module.exports = router;