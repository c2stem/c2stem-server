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
        default: Date.now, // evaluated per document (was Date.now(), fixed at startup)
    },
    args:{
        type: Object,
        required: true,
    },
});

// getInquiryActions: latest action of a type for a user
UserActionSchema.index({ username: 1, type: 1, time: -1 });

module.exports = mongoose.model('UserAction', UserActionSchema);