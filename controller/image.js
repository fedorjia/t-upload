const express = require('express');
const router = express.Router({mergeParams: true});
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const gm = require('gm');
const { query, validationResult } = require('express-validator/check');

const setting = require('../setting');
const auth = require('../middleware/auth');
const { formatDate, mkdir } = require('../helper');
const cryptos = require('../helper/crypto');
const ValidateError = require('../error/validate-error');
const FileObject = require('../helper/file');


function _unlink(files) {
	files.forEach((file) => {
		fs.unlink(file.rawPath);
	});
}

function _gmImage(image) {
	return new Promise((resolve, reject) => {
		// let imageMagick = gm.subClass({imageMagick: true});
		gm(image.rawPath)
			.noProfile()
			.write(image.absolutePath, (err, result) => {
				if(err) {
					reject(err);
				} else {
					resolve(result);
				}
			})
	})
}

/**
 * upload image & compress
 */
router.post('/', [
	query('appid', 'appid_required').trim().isLength({ min: 1 })
], async(req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.failure(new ValidateError(errors.array()));
		}

		// no cache headers
		res.setHeader('Pragma', 'no-cache');
		res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
		res.setHeader('Content-Disposition', 'inline; filename="files.json"');

		const { appid } = req.query;
		if(!fs.existsSync(setting.uploadDir + '/' + appid)) {
			return res.failure('app_directory_not_exist');
		}

		const fileDir = `${appid}/${formatDate()}`;
		const root = setting.uploadDir + `/${fileDir}`;
		if(!fs.existsSync(root)) {
			// create directory
			await mkdir(root);
		}

		const form = new formidable.IncomingForm();
		const files = [];
		const map = {};
		let errCode;

		form.uploadDir = setting.tmpDir;
		form.on('fileBegin', (name, file) => {
			const fileObject = new FileObject(file, fileDir);
			map[path.basename(file.path)] = fileObject;
			files.push(fileObject);
		});

		form.on('file', (name, file) => {
			const fileObject = map[path.basename(file.path)];
			fileObject.size = file.size;
			try {
				errCode = fileObject.validate();
				if(errCode) {
					fs.unlink(fileObject.rawPath);
				}
			} catch (err) {
				errCode = 'operate_file_failed';
			}
		});

		form.on('aborted', () => {
			_unlink(files);
		});

		form.on('end', async() => {
			if(errCode) {
				return res.failure(errCode);
			}
			const uploadTasks = [];
			for(const file of files) {
				uploadTasks.push(_gmImage(file));
			}

			await Promise.all(uploadTasks);
			_unlink(files);

			if(!req.query.redirect) {
				res.success(files.map((item) => {
					return {
						path: item.relativePath.substring(appid.length+1),
						url: item.url
					};
				}));
			} else {
				// for iframe upload
				res.redirect(decodeURIComponent(req.query.redirect) + '?s='+JSON.stringify({
						url: files[0].url,
						error: 0
					}));
			}
		});

		// parse form
		form.parse(req);
	} catch (err) {
		next(err);
	}
});

module.exports = router;