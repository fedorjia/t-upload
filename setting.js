// const isDev = process.env.NODE_ENV === 'development';

const settings = {
    appname: 't-upload',
    port: 3001,
    salt: 'L!xInXI.!@)!@*%#&.110&57afdf28dc3137132ba6d997',
	proxyLogURL: 'http://localhost:3005', // err log
    mongo : {
        host:"localhost",
        port: 27017,
        dbname: "t_upload"
    }
};

if(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' ) {
	settings.domain = 'http://upload.hhejzzs.com';
	settings.staticDomain = 'http://static.hhejzzs.com';
	settings.uploadDir = '/mnt/data/static';
} else {
    // for development
    // settings.domain = 'http://localhost:' + settings.port;
    // settings.staticDomain = 'http://localhost:' + settings.port + '/upload';
    // settings.uploadDir = __dirname + '/public/upload';
}

settings.tmpDir = settings.uploadDir + '/tmp';

module.exports = settings;