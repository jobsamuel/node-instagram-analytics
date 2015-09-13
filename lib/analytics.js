var analyze = require('./get-medias');

module.exports = function analytics (uid, token) {

    console.log('Working...');

    var options = {
        uid: process.argv[2] || uid,
        token: process.argv[3] || token
    };

    analyze(options, function (err, result) {
        if (err) {
            return console.log(err);
        }
        console.log(JSON.stringify(result, undefined, 2));
    });

}