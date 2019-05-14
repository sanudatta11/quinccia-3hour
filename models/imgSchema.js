let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

var imgSchema = new Schema({
        "imgUrl": {
            type: String,
            required : [true, "Image URL is mandatory"]
        },
        "userId" : {
            type : ObjectId,
            ref: 'User',
            required: true
        },
        "deleted" : {
            type : Boolean,
            default : false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Image', imgSchema);