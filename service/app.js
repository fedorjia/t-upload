const ObjectID = require('mongodb').ObjectID;
const COLLECTION = 'apps';

const co = () => {
	return mongo.collection(COLLECTION);
};

module.exports = {

	async get(page, limit) {
		return co().find()
			.skip((page - 1) * limit)
			.limit(limit)
			.sort({created_at: -1})
			.toArrayAsync();
	},

	async create(data) {
		let obj = await co().findOne({name: data.name})
		if(obj) {
			throw 'app_name_already_existed';
		}
		data.created_at = Date.now();
		return co().saveAsync(data);
	},

	async findById(id) {
		try {
			return co().findOneAsync({_id: ObjectID(id)});
		} catch (err) {
			throw 'invalid_objectid';
		}
	}
};
