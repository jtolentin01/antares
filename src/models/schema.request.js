const mongoose = require('mongoose');

const { Schema } = mongoose; 

const envSchema = new Schema(
    {
        type: {
            type: String,
            required: true,
            unique: true,
        },
        data: {
            type: Schema.Types.Mixed, 
        },
    },
    {
        timestamps: true,
    }
);

envSchema.set('autoIndex', false); 

envSchema.index({ _id: 1 });

module.exports = mongoose.model('envs', envSchema);