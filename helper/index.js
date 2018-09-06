const mkdirp = require('mkdirp');
const fs = require('fs');

exports.formatDate = () => {
	const date = new Date();
	const year = date.getFullYear();
	const month = date.getMonth()+1;
	const day = date.getDate();
	return `${year}/${month}/${day}`;
};

exports.mkdir = async(path) => {
	return new Promise((resolve, reject) => {
		mkdirp(path, (err) => {
			if(err) {
				reject(err);
			} else {
				resolve();
			}
		})
	});
};

exports.writeFile = async(path, buffer) => {
	return new Promise((resolve, reject) => {
		fs.writeFile(path, buffer, (err) => {
			if(err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
};
