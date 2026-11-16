const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken');

const checkSchema = new Schema ({
    username: {
        type: String,
        unique: true,
        required: true
    },
    favoriteStatus: {
        type: Array,
        required: true
    },
    checkStatus: {
        type: Array,
        required: true
    },
    designHistorySummary:{
        type: Object,
        required: true
    },
    designHistorySummaryLength:{
        type: Number,
        required: true
    },
    hypotheses: {
        type: Object,
        required: false
    },
    findings: {
        type: Object,
        required: false
    },
    conclusions: {
        type: Object,
        required: false
    },
    inquiryExperimentHistory: {
        type: Array,
        required: false
    },
    // Engineering design tile layouts, one entry per design run:
    // { projectName, designKey, materials: { A: "grass", ... }, savedAt }
    // Used by the classroom Compare view to re-render each design's stage.
    stageLayouts: {
        type: Array,
        required: false
    }
});

module.exports = mongoose.model('UserState', checkSchema);
