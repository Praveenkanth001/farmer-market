const mongoose = require('mongoose');

const DiagnosisSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    crop: String,
    diagnosisEn: String,
    diagnosisTa: String,
    treatmentEn: String,
    treatmentTa: String,
    preventionEn: String,
    preventionTa: String,
    confidence: Number,
    local_remediesEn: String,
    local_remediesTa: String,
    image: String, // Base64 or URL
    queryText: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Diagnosis', DiagnosisSchema);
