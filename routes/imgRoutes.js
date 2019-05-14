let express = require('express');
let router = express.Router();
let validator = require('validator');
let async = require('async');
let jwt = require('jsonwebtoken');
let crypto = require('crypto');

let User = require('../models/userSchema');
let Img = require('../models/imgSchema');
let Comment = require('../models/commentSchema');

let ObjectId = require('mongoose').Types.ObjectId;


//Img Tasks

router.createUpload = (req,res,next) => {
    try {
        let imgUrl = req.body.imgUrl;
        if(validator.isURL(imgUrl,{ protocols: ['http','https'],allow_underscores: true})){
            let newimg = new Img({
                imgUrl : imgUrl,
                userId: req.userId
            });

            newimg.save(function (err,data) {
                if(err)
                    res.status(500).json(err);
                else if(!data)
                    res.status(400).json({
                        info : "Data not getting saved!"
                    });
                else
                    res.status(200).json(data);
            });
        }
        else{
            res.status(415).json({
                info : "Unsupported URL Type"
            })
        }
    }
    catch (err) {
        res.status(503).json(err);
    }
};

router.retrieveImage = (req,res,next) => {
    try {
        Img.find({
            userId: req.userId,
            deleted: false
        },'imgUrl',function (err,data) {
            if(err)
                res.status(500).json(err);
            else if(!data)
                res.status(403).json({
                    info : "No Data present!"
                });
            else
                res.status(200).json(data);
        });
    }
    catch (err) {
        res.status(503).json(err);
    }
};

router.deleteImage = (req,res,next) => {
    try {
        let imageId = req.body.imageId;
        Img.findOne({
            _id: imageId,
            userId: req.userId
        },function (err,imgData) {
            if(err)
                res.status(500).json(err);
            else if(!imgData)
                res.status(403).json({
                    info : "No Image present!"
                });
            else {
                imgData.deleted = true;
                imgData.save(function (err,data) {
                    if(err)
                        res.status(500).json(err);
                    else
                        res.status(200).json({
                            info : "Image Deleted"
                        });
                });
            }
        });
    }
    catch (err) {
        res.status(503).json(err);
    }
};

//Comments Task
router.addComments = (req,res,next) => {
    try {
        let imgId = req.body.imgId;
        let parentCommentId = req.body.parentCommentId;
        if(ObjectId.isValid(imgId) && (!parentCommentId || ObjectId.isValid(parentCommentId))){
            async.waterfall([
                function (callback) {
                    console.log('Checking image Present');
                    Img.findOne({
                        _id : imgId,
                        userId : req.userId
                    },function (err,imgObj) {
                        if(err)
                            res.status(500).json(err);
                        else if(!imgObj)
                            res.status(403).json({
                                info : "No Image Data present!"
                            });
                        else
                            callback(null);
                    });
                },
                function (callback) {
                if(parentCommentId){
                    Comment.findOne({
                        _id: parentCommentId,
                        userId: req.userId,
                        imgId : imgId
                    },function (err,data) {
                        if(err)
                            res.status(500).json(err);
                        else if(!data)
                            res.status(403).json({
                                info : "No Data present on the comment!"
                            });
                        else
                            callback(null);
                    });
                }
                else
                    callback(null);
                },
                function (callback) {
                    let newComment = new Comment({
                        imgId : imgId,
                        userId : req.userId,
                    });

                    newComment.save(function (err,newComment) {
                        if(err)
                            callback(err);
                        else if(newComment)
                            callback(null,newComment)
                    });
                }
            ], function (err, result) {
                if(err)
                    res.status(500).json(err);
                else
                    res.status(200).json(result);
            });
        }
        else{
            res.status(415).json({
                info : "Unsupported Data type for Image Id"
            })
        }
    }
    catch (err) {
        res.status(503).json(err);
    }
};

router.addCommentSocket = (data) => {
    try {
        var resp;
        let imgId = data.imgId;
        let parentCommentId = data.parentCommentId;
        if(ObjectId.isValid(imgId) && (!parentCommentId || ObjectId.isValid(parentCommentId))){
            async.waterfall([
                function (callback) {
                    console.log('Checking image Present');
                    Img.findOne({
                        _id : imgId,
                        userId : req.userId
                    },function (err,imgObj) {
                        if(err)
                        {
                            resp.status=500;
                            resp.message = err;
                        }
                        else if(!imgObj)
                        {
                            resp.status=500;
                            resp.message = "No Image Present";
                        }
                        else
                            callback(null);
                    });
                },
                function (callback) {
                    if(parentCommentId){
                        Comment.findOne({
                            _id: parentCommentId,
                            userId: req.userId,
                            imgId : imgId
                        },function (err,data) {
                            if(err)
                            {
                                resp.status=500;
                                resp.message = err;
                            }
                            else if(!data)
                            {
                                resp.status=500;
                                resp.message = "No Data present on the comment!";
                            }
                            else
                                callback(null);
                        });
                    }
                    else
                        callback(null);
                },
                function (callback) {
                    let newComment = new Comment({
                        imgId : imgId,
                        userId : req.userId,
                    });

                    newComment.save(function (err,newComment) {
                        if(err)
                            callback(err);
                        else if(newComment)
                            callback(null,newComment)
                    });
                }
            ], function (err, result) {
                if(err)
                {
                    resp.status=500;
                    resp.message = err;
                }
                else
                {
                    resp.status=200;
                    resp.message = result;
                }
            });
        }
        else{
            res.status(415).json({
                info : "Unsupported Data type for Image Id"
            })
        }
    }
    catch (err) {
        res.status(503).json(err);
    }
};

router.retrieveComments = (req,res,next) => {
    try {
        let imgUrl = req.body.imgUrl;
        Comment.find({
            imgUrl: imgUrl,
            deleted: false
        },'imgUrl',function (err,data) {
            if(err)
                res.status(500).json(err);
            else if(!data)
                res.status(403).json({
                    info : "No Comments present!"
                });
            else {
                res.status(200).json(data);
            }
        });
    }
    catch (err) {
        res.status(503).json(err);
    }
};


router.deleteComment = (req,res,next) => {
    try {
        let commentId = req.body.commentId;
        Comment.findOne({
            _id: commentId,
            userId: req.userId,
            deleted: false
        },function (err,commentData) {
            if(err)
                res.status(500).json(err);
            else if(!commentData)
                res.status(403).json({
                    info : "No Comments present!"
                });
            else {
                imgData.deleted = true;
                imgData.save(function (err,data) {
                    if(err)
                        res.status(500).json(err);
                    else
                        res.status(200).json({
                            info : "Image Deleted"
                        });
                });
            }
        });
    }
    catch (err) {
        res.status(503).json(err);
    }
};

module.exports = router;