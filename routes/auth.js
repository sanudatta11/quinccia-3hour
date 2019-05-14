let express = require('express');
let router = express.Router();

let async = require('async');
let jwt = require('jsonwebtoken');
let crypto = require('crypto');

let config = require('../config');

let User = require('../models/userSchema');

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

router.login = (req, res, next) => {
    let email = req.body.email;
    let password = req.body.password;
    let hash = crypto.createHash('sha256').update(password).digest('base64');
    if(!email || !password)
    {
        res.status(400).json({
            info : "Invalid or corrupt data"
        })
    }else{
        User.findOne({
            email: email,
        },'email firstName lastName imgUrl', function (err, data) {
            if (err)
                res.status(500).json({
                    error: err
                });
            else if (!data)
                res.status(404).json({
                    info: "Data not found"
                });
            else {
                if (data.password !== hash) {
                    res.status(400).json({
                        info: "Password Incorrect",
                    })
                } else {
                    let jwtToken = jwt.sign({
                        userId: data._id
                    }, config.jwtKey, {
                        expiresIn: 150000000
                    });

                    res.status(200).json({
                        info: "User Login successful",
                        token: jwtToken,
                        user: data
                    })
                }
            }
        });
    }
};


router.createUser = (req, res, next) => {
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let email = req.body.email;
    let password = req.body.password;
    let imgUrl = req.body.imgUrl;
    if (!email || !firstName || !password || !lastName) {
        res.status(400).json({
            info: 'Incomplete Required Data'
        })
    } else {
        let hash = crypto.createHash('sha256').update(password).digest('base64');
        async.waterfall([
            function (callback) {
                //Verify Unique Email
                User.findOne({
                    email: email
                }, function (err, data) {
                    if (err)
                        callback(err);
                    else if (data) {
                        res.status(300).json({
                            info: 'Email already present'
                        })
                    } else {
                        callback(null);
                    }
                });
            },
            function (callback) {
                let newUser = new User({
                    firstName: capitalizeFirstLetter(firstName),
                    lastName: capitalizeFirstLetter(lastName),
                    email: email,
                    password: hash
                });
                if (imgUrl)
                    newUser.imgUrl = imgUrl;
                newUser.save(function (err, userObj) {
                    if (err)
                        callback(err);
                    else if (!userObj)
                        res.status(400).json({
                            info: "Blank new user object created!"
                        });
                    else
                        callback(null, userObj);
                });
            }
        ], function (err, userObj) {
            if (err)
                res.status(500).json({
                    err: err
                });
            else
                res.status(200).json({
                    info: 'User Created',
                    user: userObj
                })
        });
    }
};

router.verifyToken = (req,res,next) => {
    res.status(200).json({
        info : "JWT Swag is with you!"
    });
};

module.exports = router;