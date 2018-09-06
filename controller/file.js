const express = require('express');
const router = express.Router({mergeParams: true});
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const { query, validationResult } = require('express-validator/check');

const setting = require('../setting');
const { formatDate, mkdir } = require('../helper');
const cryptos = require('../helper/crypto');
const ValidateError = require('../error/validate-error');
const FileObject = require('../helper/file');

/**
 * 上传文件
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
			files.forEach((file) => {
				fs.unlink(file.rawPath);
			});
		});

		form.on('end', () => {
			if(errCode) {
				return res.failure(errCode);
			}

			const tasks = [];
			for(const file of files) {
				tasks.push(fs.rename(file.rawPath, file.absolutePath));
			}

			Promise.all(tasks)
				.then(() => {
					res.success(files.map((item) => {
						return {
							path: item.relativePath.substring(appid.length+1),
							url: item.url
						};
					}));
				})
				.catch(() => {
					res.failure('file_upload_error');
				});
		});

		// parse form
		form.parse(req);
	} catch (err) {
		next(err);
	}
});

module.exports = router;