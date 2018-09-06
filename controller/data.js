const express = require('express');
const router = express.Router({mergeParams: true});
const fs = require('fs');
const { query, body, validationResult } = require('express-validator/check');

const setting = require('../setting');
const cryptos = require('../helper/crypto');
const { formatDate, mkdir, writeFile } = require('../helper');
const ValidateError = require('../error/validate-error');

/**
 * create image from dataurl
 * query:
 * 	appid: appid
 * body:
 * 	dataurl: dataurl
 */
router.post('/', [
	query('appid', 'appid_required').trim().isLength({ min: 1 }),
	body('dataurl', 'dataurl_required').trim().isLength({ min: 1 })
], async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.failure(new ValidateError(errors.array()));
		}

		const { appid } = req.query;
		if(!fs.existsSync(setting.uploadDir + '/' + appid)) {
			return res.failure('app_directory_not_exist');
		}

		// directory
		const fileDir = `${appid}/${formatDate()}`;
		const root = setting.uploadDir + `/${fileDir}`;
		const dataurl = req.body.dataurl;

		if(!fs.existsSync(root)) {
			// create directory
			await mkdir(root);
		}

		const regex = /^data:.+\/(.+);base64,(.*)$/;
		const matches = dataurl.match(regex);
		const ext = matches[1];
		const data = matches[2];

		const filename = cryptos.unique(24) + '.' + ext;
		const filePath = fileDir + '/' + filename;
		const buffer = new Buffer(data, 'base64');
		await writeFile(setting.uploadDir + '/' + filePath, buffer);

		res.success({
			path: filePath.substring(appid.length+1),
			url: setting.staticDomain + '/' + filePath
		});
	} catch (err) {
		next(err);
	}
});

module.exports = router;