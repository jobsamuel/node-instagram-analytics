var Instagram = require('./lib/instagram');

function Analytics (token) {

    if (typeof token !== 'string') {
        var error = new Error('Invalid token');
        return console.log(error);
    }

    this.token = token;
    this.ig = new Instagram(this.token);
}

Analytics.prototype.simple = function (user, callback) {

    var self = this;

    var cb = function (err, response) {
        if (err) {
            var error = new Error(err);
            return callback(error);
        }

        self.ig.getMedias(response.id, function (err, analytics) {

            if (err) {
                var error = new Error(err);
                return console.log(error);
            }

            var data = {};
            var media = response.counts.media;
            var follows = response.counts.follows;
            var followed_by = response.counts.followed_by;

            data.likes_per_media = (analytics.likes / media).toFixed(2);
            data.comments_per_media = (analytics.comments / media).toFixed(2);
            data.total_likes = analytics.likes;
            data.total_comments = analytics.comments;
            data.ratio = (followed_by / follows).toFixed(2);
            data.limits = analytics.limits;

            callback(null, JSON.stringify(data, undefined, 2) );

        });

    }

    if (typeof user === 'number') {
        self.ig.getProfile(user, cb);
    } else if (typeof user === 'string') {
        self.ig.getUid(user, function (err, uid) {
            if (err) {
                var error = new Error(err);
                return callback(error);
            }

            self.ig.getProfile(uid, cb);

        });
    } else {
        var error = new Error('Invalid user');
        callback(error);
    }
}

module.exports = Analytics;