'use strict';
const path = require('path');
const fs = require('fs');

const settings = require('../setting');
const cryptos = require('.//cryptos');
const existsSync = fs.existsSync || path.existsSync;

const nameCountRegexp = /(?:(?: \(([\d]+)\))?(\.[^.]+))?$/;
const nameCountFunc = (s, index, ext) => {
    return ' (' + ((parseInt(index, 10) || 0) + 1) + ')' + (ext || '');
};
/**
 * File Object
 */
const FileObject = function (file, dirname) {
    this.size = file.size;
    this.name = this.__getSafeName(dirname, file.name);
	this.rawPath = file.path;
    this.relativePath = dirname + '/' + this.name;
    this.absolutePath = settings.uploadDir + '/' + this.relativePath;
    this.url = settings.staticDomain + '/' + dirname + '/' + this.name;
    this.rawFile = file;
};

FileObject.prototype = {

    validate() {
        // if (!this.options.acceptFileTypes.test(this.name)) {
        //     return 'file_type_not_allowed';
        // } else if (this.options.minFileSize && this.options.minFileSize > this.size) {
        //     return 'under_file_min_size';
        // } else if (this.options.maxFileSize && this.options.maxFileSize < this.size) {
        //     return 'exceed_file_max_size';
        // }
        return undefined;
		// return 'exceed_file_max_size';
    },

    __getSafeName(dirname, filename) {
        // Prevent directory traversal and creating hidden system files
        filename = path.basename(filename).replace(/^\.+/, '');
        const lastDot = filename.lastIndexOf('.');
        let ext = '';
        if(lastDot !== -1) {
            // 后缀名
            ext = '.' + filename.substring(lastDot+1);
        }
        filename = cryptos.unique(24) + ext;
        // Prevent overwriting existing files
        if (existsSync(settings.uploadDir + '/' + dirname + '/' + filename)) {
            filename = filename.replace(nameCountRegexp, nameCountFunc);
        }

        return filename;
    }
};

module.exports = FileObject;