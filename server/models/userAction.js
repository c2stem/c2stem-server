const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserActionSchema = new Schema({
    username:{
        type: String,
        required: true,
    },
    type:{
        type:String,
        required: true,
    },
    view:{
        type:String,
        required: true,
    },
    time:{
        type: Date,
        required: true,
        default: Date.now(),
    },
    args:{
        type: Object,
        required: true,
    },
});

module.exports = mongoose.model('UserAction', UserActionSchema);