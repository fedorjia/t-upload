const express = require('express');
const router = express.Router({mergeParams: true});
const fs = require('fs');
const { query, body, validationResult } = require('express-validator/check');

const cryptos = require('../helper/crypto');
const setting = require('../setting');
const ValidateError = require('../error/validate-error');
const model = require('../service/app');

const PRIVATE = '57afdf28dc3137132ba6d997';

/**
 * add app
 */
router.post('/app', [
	query('token', 'token required').trim().isLength({ min: 1 }),
	body('name', 'app name required').trim().isLength({ min: 1 })
], async(req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.failure(new ValidateError(errors.array()));
		}

		if(req.query.token !== PRIVATE) {
			return res.failure('token_invalid');
		}

		// create app
		let obj = await model.create({
			name: req.body.name,
			secret: cryptos.sha256(cryptos.unique(24), setting.salt)
		});

		obj = obj.ops[0];
		const dir = setting.uploadDir + '/' + obj._id.toString();
		if (fs.existsSync(dir)){
			return res.failure('folder_already_existed');
		}
		fs.mkdirSync(dir);
		res.success(obj);
	} catch (err) {
		next(err);
	}
});

/**
 * delete file
 */
router.delete('/file', [
	body('path', 'path_required').trim().isLength({ min: 1 })
], async(req, res, ignore) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.failure(new ValidateError(errors.array()));
		}
		const filePath = setting.uploadDir + '/' + decodeURIComponent(req.body.path);
		if(!fs.existsSync(filePath)) {
			return res.failure('file_not_found');
		}
		fs.unlink(filePath);
		res.success(true);
	} catch (err) {
		return res.failure(err.message);
	}
});

module.exports = router;