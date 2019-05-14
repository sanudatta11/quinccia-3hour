var express = require('express');
var router = express.Router();
let jwt = require('jsonwebtoken');

let auth = require('./auth');
let config = require('../config');

let imgRoutes = require('./imgRoutes');

router.use(function(req, res, next) {
    var token = req.body.token || req.query.token || req.headers.authorization;
    try {
        if (token) {
            jwt.verify(token,config.jwtKey , function (err, decoded) {
                if (err) {
                    console.log(err);
                    return res.status(403).json({
                        success: false,
                        message: 'Failed to authenticate token.'
                    });
                } else {
                    req.userId = decoded.userId;
                    next();
                }
            });

        } else {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        }
    } catch (error) {
        console.log(error);
        res.status(501).json({
            info : "Exception in JWT decoding",
            error : error
        })
    }
});


router.post('/createUpload',imgRoutes.createUpload);
router.post('/retrieveImage',imgRoutes.retrieveImage);
router.post('/deleteImage',imgRoutes.deleteImage);
router.post('/addComments',imgRoutes.addComments);
router.post('/retrieveComments',imgRoutes.retrieveComments);
router.post('/deleteComment',imgRoutes.deleteComment);


module.exports = router;