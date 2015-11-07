import request from 'request';
import moment from 'moment';
import async from 'async';

class Instagram {
    constructor(token) {
        this.token = token;
        this.ig_users = 'https://api.instagram.com/v1/users';
    }

    getProfile(uid, callback) {
        const base = `${this.ig_users}/uid`;
        const params = { 
            access_token: this.token 
        };
        const config = { 
            url: base, 
            qs: params, 
            json: true 
        };

        requestHandler(config, function (err, result) {
            if (err) {
                return callback(err);
            }

            const profile = result.data;
            callback(null, profile);
        });
    }

    getUid(username, callback) {
        const base = `${this.ig_users}/search`;
        const params = { 
            q: username, 
            access_token: this.token 
        };
        const config = { 
            url: base, 
            qs: params, 
            json: true 
        };

        requestHandler(config, function (err, result) {
            if (err) {
                return callback(err);
            }
            
            let user;

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

    getMedias(uid, callback) {
        let total_likes = 0;
        let total_comments = 0;
        
        function fetch(next, cb) {
            const base = `${this.ig_users}/${uid}/media/recent/`;
            const params = { 
                access_token: self.token, 
                count: 30 
            };
            
            if (next) {
                params.max_id = next;
            }
            
            const config = { 
                url: base, 
                qs: params, 
                json: true 
            };
            
            requestHandler(config, function (err, result, remaining) {
                if (err) {
                    return cb(err);
                }

                const medias = result.data;
                
                count(medias, function (err, counts) {
                    if (err) {
                        return cb(err);
                    }

                    total_likes += counts.likes;
                    total_comments += counts.comments;
                    
                    if (result.pagination.next_max_id) {
                        const _next = result.pagination.next_max_id;
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
                const error = new Error('The analysis couldn\'t be commpleted.');
                return callback(error);
            }

            if (result.complete && result.meta) {
               /** 
                * @likes: Total Instagram account likes.
                * @comments: Total Instagram account comments.
                * @limits: Instagram API calls remaining for this hour.
                * @calls: Instagram API calls made during this analysis.
                */
                const analytics = {
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

}

function requestHandler (config, callback) {
    request.get(config, function (error, response, body) {
        if (error) {
            return callback(error);
        }

        if (response.statusCode !== 200) {
            const error = new Error();
            
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

        const remaining = parseInt(response.headers['x-ratelimit-remaining']);
        callback(null, body, remaining);
    });
}

function count (medias, callback) {
    // @_total_likes: Total likes of current media set.
    // @_total_comments: Total comments of current media set.
    let _total_likes = 0;
    let _total_comments = 0;

    async.each(medias, function (media, cb) {
        _total_likes += media.likes.count;
        _total_comments += media.comments.count;
        
        cb();
    }, function (error) {
        if (error) {
            return callback(error);
        }

        const counts = {
            likes: _total_likes,
            comments: _total_comments
        };

        callback(null, counts);
    });
}

export default Instagram;
