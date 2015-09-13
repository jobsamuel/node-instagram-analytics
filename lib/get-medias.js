var request = require('request');
var moment = require('moment');
var count = require('./get-counts');

module.exports = function getMedias (config, callback) {

    var total_likes = 0;
    var total_comments = 0;

    var fetch = function (next, cb) {

        // Instagram API request configuration.
        var base = 'https://api.instagram.com/v1/users/' + config.uid + '/media/recent/';
        var params = { access_token: config.token, count: 30 };

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
            var medias = body.data;

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
                    var remaining = response.headers['x-ratelimit-remaining'];
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
            // @limits: Instagram API token remaining requests.
            var analytics = {
                likes: total_likes,
                comments: total_comments,
                limits: result.meta + " remaining requests for this hour."
            }

            callback(null, analytics);
        }

    } // End of fetchCallback.

    fetch(null, fetchCallback);

} // End of getAllMedias