let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

var userSchema = new Schema({
        "firstName": {
            type: String,
            required : [true, "FirstName is mandatory"]
        },
        "lastName": {
            type: String,
            required : [true, "LastName is mandatory"]
        },
        "email": {
            type: String,
            required : [true, "Email is mandatory"],
            unique : true
        },
        "password": {
            type: String,
            required : [true, "Password is mandatory"]
        },
        "imgUrl": {
            type: String
        },
        "disabled" : {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('User', userSchema);