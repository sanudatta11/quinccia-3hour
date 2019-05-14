let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

var commentSchema = new Schema({
        "imgId": {
            type: ObjectId,
            ref: 'Image',
            required: true
        },
        "parentCommentId" : {
            type: ObjectId,
            ref: 'Comment'
        },
        "commentText" : {
            type : String,
            required : true
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

module.exports = mongoose.model('Comment', commentSchema);