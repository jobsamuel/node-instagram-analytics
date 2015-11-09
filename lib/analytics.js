import Instagram from './instagram'

class Analytics {
    constructor(token) {
        if (typeof token !== 'string') {
            const error = new Error('Invalid token');
            return console.log(error);
        }

        this.token = token;
        this.ig = new Instagram(this.token);
    }

    simple(user, callback) {
        const cb = function (err, response) {
            if (err) {
                const error = new Error(err);
                return callback(error);
            }

            this.ig.getMedias(response.id, function (err, analytics) {
                if (err) {
                    const error = new Error(err);
                    return console.log(error);
                }

                const result = {};
                const media = response.counts.media;
                const follows = response.counts.follows;
                const followed_by = response.counts.followed_by;
                result.likes_per_media = analytics.likes / media;
                result.comments_per_media = analytics.comments / media;
                result.total_likes = analytics.likes;
                result.total_comments = analytics.comments;
                result.ratio = followed_by / follows;
                result.limits = analytics.limits;
                result.calls = analytics.calls;
                callback(null, result);
            });
        }

        if (typeof user === 'number') {
            this.ig.getProfile(user, cb);
        } else if (typeof user === 'string') {
            this.ig.getUid(user, (err, uid) => {
                if (err) {
                    const error = new Error(err);
                    return callback(error);
                }

                this.ig.getProfile(uid, cb);
            });
        } else {
            const error = new Error('Invalid user');
            callback(error);
        }
    }
}

export default Analytics;
