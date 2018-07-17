const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsersSchema = new Schema({
    username: {type: String},
    name: {type: String},
    addedAt: {type: Date, default: Date.now}

}, {
    versionKey: false,
    collection: "UsersCollection"
});


module.exports = mongoose.model('UsersModel', UsersSchema);