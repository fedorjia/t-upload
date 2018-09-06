const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const cors = require('cors');
const util = require('util');

const mongodb = require('./helper/mongodb');
const router = require('./router');
const settings = require('./setting');
const responseStatus = require('./error/response-status');
const res = require('./middleware/res');
const auth = require('./middleware/auth');
const logError = require('./helper/logerr');
const app = express();

app.enable('trust proxy');
app.use(cors({credentials: true, origin: true}));
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({limit: '5mb', extended: false}));
app.use(expressValidator());
app.use(helmet()); //  secure Express apps
app.set('trust proxy', 1);

// static
app.use(express.static(__dirname + '/public', {maxAge: 86400000 * 7}));
// middleware
app.use(res);
app.use(auth);
// router
app.use(router);

/**
 * error handling
 */
app.use((err, req, res, ignore) => {
	if(typeof err === "string") {
		res.json({ status: responseStatus.SERVICE_EXCEPTION, body: err });
	} else {
		console.log(err);
		res.json({ status: responseStatus.INTERNAL_ERROR, body: '系统异常，请稍后再试' });
		// log error
		logError(req.originalUrl, null, err.message);
	}
});
app.use((req, res, ignore) => {
	res.json({ status: responseStatus.REQUEST_NOT_FOUND, body: '请求未找到' });
});

/**
 * connect mongodb
 */
global.mongo = {};
mongodb.connect().then((db) => {
	global.mongo = db;
	app.listen(settings.port);
	util.log(settings.appname + ' launched at: ' + settings.port);
}).catch((err) => {
	util.log('connect mongodb error: ' + err.message);
});