'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _instagram = require('./instagram');

var _instagram2 = _interopRequireDefault(_instagram);

var Analytics = (function () {
    function Analytics(token) {
        _classCallCheck(this, Analytics);

        if (typeof token !== 'string') {
            var error = new Error('Invalid token');
            return console.log(error);
        }

        this.token = token;
        this.ig = new _instagram2['default'](this.token);
    }

    _createClass(Analytics, [{
        key: 'simple',
        value: function simple(user, callback) {
            var _this = this;

            var cb = function cb(err, response) {
                if (err) {
                    var error = new Error(err);
                    return callback(error);
                }

                this.ig.getMedias(response.id, function (err, analytics) {
                    if (err) {
                        var error = new Error(err);
                        return console.log(error);
                    }

                    var result = {};
                    var media = response.counts.media;
                    var follows = response.counts.follows;
                    var followed_by = response.counts.followed_by;
                    result.likes_per_media = analytics.likes / media;
                    result.comments_per_media = analytics.comments / media;
                    result.total_likes = analytics.likes;
                    result.total_comments = analytics.comments;
                    result.ratio = followed_by / follows;
                    result.limits = analytics.limits;
                    result.calls = analytics.calls;
                    callback(null, result);
                });
            };

            if (typeof user === 'number') {
                this.ig.getProfile(user, cb);
            } else if (typeof user === 'string') {
                this.ig.getUid(user, function (err, uid) {
                    if (err) {
                        var error = new Error(err);
                        return callback(error);
                    }

                    _this.ig.getProfile(uid, cb);
                });
            } else {
                var error = new Error('Invalid user');
                callback(error);
            }
        }
    }]);

    return Analytics;
})();

exports['default'] = Analytics;
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var Instagram = (function () {
    function Instagram(token) {
        _classCallCheck(this, Instagram);

        this.token = token;
        this.ig_users = 'https://api.instagram.com/v1/users';
    }

    _createClass(Instagram, [{
        key: 'getProfile',
        value: function getProfile(uid, callback) {
            var base = this.ig_users + '/uid';
            var params = {
                access_token: this.token
            };
            var config = {
                url: base,
                qs: params,
                json: true
            };

            requestHandler(config, function (err, result) {
                if (err) {
                    return callback(err);
                }

                var profile = result.data;
                callback(null, profile);
            });
        }
    }, {
        key: 'getUid',
        value: function getUid(username, callback) {
            var base = this.ig_users + '/search';
            var params = {
                q: username,
                access_token: this.token
            };
            var config = {
                url: base,
                qs: params,
                json: true
            };

            requestHandler(config, function (err, result) {
                if (err) {
                    return callback(err);
                }

                var user = undefined;

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
    }, {
        key: 'getMedias',
        value: function getMedias(uid, callback) {
            var total_likes = 0;
            var total_comments = 0;

            function fetch(next, cb) {
                var base = this.ig_users + '/' + uid + '/media/recent/';
                var params = {
                    access_token: self.token,
                    count: 30
                };

                if (next) {
                    params.max_id = next;
                }

                var config = {
                    url: base,
                    qs: params,
                    json: true
                };

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

            function fetchCallback(err, result) {
                if (err) {
                    return callback(err);
                }

                if (!result.complete && result.next) {
                    return fetch(result.next, fetchCallback);
                }

                if (!result.complete) {
                    var error = new Error('The analysis couldn\'t be commpleted.');
                    return callback(error);
                }

                if (result.complete && result.meta) {
                    /** 
                     * @likes: Total Instagram account likes.
                     * @comments: Total Instagram account comments.
                     * @limits: Instagram API calls remaining for this hour.
                     * @calls: Instagram API calls made during this analysis.
                     */
                    var analytics = {
                        likes: total_likes,
                        comments: total_comments,
                        limits: result.meta,
                        calls: 'not available'
                    };

                    callback(null, analytics);
                }
            }

            fetch(null, fetchCallback);
        }
    }]);

    return Instagram;
})();

function requestHandler(config, callback) {
    _request2['default'].get(config, function (error, response, body) {
        if (error) {
            return callback(error);
        }

        if (response.statusCode !== 200) {
            var _error = new Error();

            if (typeof body === 'string') {
                _error.menssage = 'Something went wrong.';
                _error.details = null;
                return callback(_error);
            }

            _error.menssage = 'Profile not found.';
            _error.details = body;

            return callback(_error);
        }

        if (!body.data) {
            return callback('Instagram didn\'t return anything.');
        }

        var remaining = parseInt(response.headers['x-ratelimit-remaining']);
        callback(null, body, remaining);
    });
}

function count(medias, callback) {
    // @_total_likes: Total likes of current media set.
    // @_total_comments: Total comments of current media set.
    var _total_likes = 0;
    var _total_comments = 0;

    _async2['default'].each(medias, function (media, cb) {
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

exports['default'] = Instagram;
module.exports = exports['default'];
