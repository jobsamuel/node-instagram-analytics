var async = require('async');

module.exports = function getCounts (medias, callback) {

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