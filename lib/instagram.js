var request = require('request');
var moment = require('moment');
var async = require('async');

function Instagram (token) {
    this.token = token;
    this.ig_users = 'https://api.instagram.com/v1/users/';
}

function requestHandler (config, callback) {
    request.get(config, function (error, response, body) {
        if (error) {
            return callback(error);
        }
        if (response.statusCode !== 200) {
            var error = new Error();
            if (typeof(body) === 'string') {
                error.menssage = 'Something went wrong.';
                error.details = null;
                return callback(error);
            }
            error.menssage = 'Profile not found.';
            error.details = body;
            return callback(error);
        }
        if (!body.data) {
            return callback('Instagram didn\'t return anything.');
        }
        var remaining = parseInt(response.headers['x-ratelimit-remaining']);
        callback(null, body, remaining);
    });
}

function count (medias, callback) {
    // @_total_likes: Total likes of current media set.
    // @_total_comments: Total comments of current media set.
    var _total_likes = 0;
    var _total_comments = 0;
    async.each(medias, function (media, cb) {
        _total_likes += media.likes.count;
        _total_comments += media.comments.count;
        cb();
    }, function (error) {
        if (error) {
            return callback(error);
        }
        var counts = {
            likes: _total_likes,
            comments: _total_comments
        };
        callback(null, counts);
    });
}

Instagram.prototype.getProfile = function (uid, callback) {
    var self = this;
    var base = self.ig_users + uid;
    var params = { access_token: self.token };
    var config = { url: base, qs: params, json: true };
    requestHandler(config, function (err, result) {
        if (err) {
            return callback(err);
        }
        var profile = result.data;
        callback(null, profile);
    });
}

Instagram.prototype.getUid = function (username, callback) {
    var self = this;
    var base = self.ig_users + 'search';
    var params = { q: username, access_token: self.token };
    var config = { url: base, qs: params, json: true };
    requestHandler(config, function (err, result) {
        if (err) {
            return callback(err);
        }
        var user;
        result.data.some(function (u) {
            if (u.username === username) {
                user = u;
                return true;
            }
            return false;
        });
        callback(null, user.id);
    });
}

Instagram.prototype.getMedias = function (uid, callback) {
    var self = this;
    var total_likes = 0;
    var total_comments = 0;
    var fetch = function (next, cb) {
        var base = self.ig_users + uid + '/media/recent/';
        var params = { access_token: self.token, count: 30 };
        if (next) params.max_id = next;
        var config = { url: base, qs: params, json: true };
        requestHandler(config, function (err, result, remaining) {
            if (err) {
                return cb(err);
            }
            var medias = result.data;
            count(medias, function (err, counts) {
                if (err) {
                    return cb(err);
                }
                total_likes += counts.likes;
                total_comments += counts.comments;
                if (result.pagination.next_max_id) {
                    var _next = result.pagination.next_max_id;
                    return cb(null, { complete: false, next: _next });
                }
                cb(null, { complete: true, meta: remaining });
            });
        });
    }
    var fetchCallback = function (err, result) {
        if (err) {
            return callback(err);
        }
        if (!result.complete && result.next) {
            return fetch(result.next, fetchCallback);
        }
        if (!result.complete) {
            var error = new Error();
            error.mensaje = 'The analysis couldn\'t be commpleted.';
            return callback(error);
        }
        if (result.complete && result.meta) {
            // @likes: Total Instagram account likes.
            // @comments: Total Instagram account comments.
            // @limits: Instagram API calls remaining for this hour.
            // @calls: Instagram API calls made during this analysis.
            var analytics = {
                likes: total_likes,
                comments: total_comments,
                limits: result.meta,
                calls: 'not available'
            }
            callback(null, analytics);
        }
    }
    fetch(null, fetchCallback);
}

module.exports = Instagram;