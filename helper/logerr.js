/**
 * 错误日志
 */
const axios = require('axios');
const setting = require('../setting');
const BUSINESS = 't-upload';

module.exports = (url, args, message) => {

	axios({
		method: 'post',
		url: `${setting.proxyLogURL}`,
		data: {
			business: BUSINESS,
			url,
			args: args? JSON.stringify(args): null,
			message
		}
	});
};
