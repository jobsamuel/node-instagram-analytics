var request = require('request');
var moment = require('moment');
var async = require('async');

function Instagram (token) {
    this.token = token;
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

        callback(null, { complete: true, data: counts });

    }); // End of async.
}

Instagram.prototype.getProfile = function (uid, callback) {

    var self = this;
    var base = 'https://api.instagram.com/v1/users/' + uid;
    var params = { access_token: self.token };

    request.get({ url: base, qs: params, json: true }, function (error, response, body) {
        if (error) {
            return callback(error);
        }
        if (response.statusCode !== 200) {
            var error = new Error();
            if (typeof(body) === 'string') {
                error.menssage = 'Something went wrong.';
                error.details = null;
                return callback(error);
            } else {
                error.menssage = 'Profile not found.';
                error.details = body;
                return callback(error);
            }
        }
        if (!body.data) {
            return callback('Instagram didn\'t return anything.');
        }

        var profile = body.data;
        callback(null, profile);

    });
}

Instagram.prototype.getUid = function (username, callback) {

    var self = this;
    var base = 'https://api.instagram.com/v1/users/search';
    var params = { q: username, access_token: self.token };

    request.get({ url: base, qs: params, json: true }, function (error, response, body) {
        if (error) {
            return callback(error);
        }
        if (response.statusCode !== 200) {
            var error = new Error();
            if (typeof(body) === 'string') {
                error.menssage = 'Something went wrong.';
                error.details = null;
                return callback(error);
            } else {
                error.menssage = 'User not found.';
                error.details = body;
                return callback(error);
            }
        }
        if (!body.data) {
            return callback('Instagram didn\'t return anything.');
        }

        var _user = '';
        body.data.some(function (u) {
            if (u.username === username) {
                _user = u;
                return true;
            }
            return false;
        });

        var uid = _user.id;
        callback(null, uid);

    });

}

Instagram.prototype.getMedias = function (uid, callback) {

    var _start;
    var self = this;
    var total_likes = 0;
    var total_comments = 0;

    var fetch = function (next, cb) {

        // Instagram API request configuration.
        var base = 'https://api.instagram.com/v1/users/' + uid + '/media/recent/';
        var params = { access_token: self.token, count: 30 };

        // Set 'max_id' param if 'next' argument exists.
        if (next) {
            params.max_id = next;
        }

        // Get Instagram account medias.
        request.get({ url: base, qs: params, json: true }, function (error, response, body) {
            if (error) {
                return cb(error);
            }
            if (response.statusCode !== 200) {
                if (typeof(body) === 'string') {
                    cb(null, { complete: false, bad: 'Something went wrong.' });
                } else {
                    cb(null, { complete: false, bad: body });
                }
            }
            if (!body.data) {
                return callback('Instagram didn\'t return anything.');
            }

            // @medias: Object Array of Instagram medias.
            // @_start: Instagram API calls available for this hour
            var medias = body.data;

            if (!_start) {
                _start = parseInt(response.headers['x-ratelimit-remaining']);
            }

            count(medias, function (err, result) {
                if (err) {
                    return cb(err);
                }
                if (result.data && body.pagination.next_max_id) {
                    var _next = body.pagination.next_max_id;
                    total_likes += result.data.likes;
                    total_comments += result.data.comments;
                    return cb(null, { complete: false, next: _next });
                }
                if (result.data) {
                    var remaining = parseInt(response.headers['x-ratelimit-remaining']);
                    total_likes += result.data.likes;
                    total_comments += result.data.comments;
                    return cb(null, { complete: true, meta: remaining });
                }

            });

        }); // End of request.

    } // End of fetch.

    var fetchCallback = function (err, result) {
        if (err) {
            return callback(err);
        }
        if (!result.complete && result.bad) {
            var error = new Error();
            error.mensaje = 'The analysis couldn\'t be commpleted.';
            error.detalles = result.bad;
            return callback(error);
        }
        if (!result.complete && result.next) {
            return fetch(result.next, fetchCallback);
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
                calls: _start - result.meta
            }

            callback(null, analytics);
        }

    } // End of fetchCallback.

    fetch(null, fetchCallback);
}

module.exports = Instagram;