# node-instagram-analytics
[![npm version](https://img.shields.io/npm/v/node-instagram-analytics.svg?style=flat-square)](https://www.npmjs.com/package/node-instagram-analytics) [![npm](https://img.shields.io/npm/dt/node-instagram-analytics.svg?style=flat-square)](https://www.npmjs.com/package/node-instagram-analytics) [![Dependency Status](https://david-dm.org/heartyrobot/node-instagram-analytics/status.svg?style=flat-square)](https://www.npmjs.com/package/node-instagram-analytics)

> NodeJS module for Instagram Analytics

## installation

```bash
$ npm install node-instagram-analytics
```

## usage

Example.js:

```js
var Analytics = require('node-instagram-analytics')

// use a valid instagram access token
var stats = new Analytics('<INSTAGRAM_ACCESS_TOKEN>')

// analyze an instagram profile you have access to
stats.simple('username', function (err, result) {
    if (err) {
        // do something
    }
    console.log(result)
})
```

The result will be something like this:

```json
{
  "likes_per_media": 63.79468,
  "comments_per_media": 22.5142697,
  "total_likes": 2679,
  "total_comments": 945,
  "ratio": 5.68411203067,
  "limits": 4853,
  "calls": 3
}
```

## todo

- [x] ~~Publish to npm.~~
- [x] ~~Explain module usage (improve README).~~
- [ ] Improve error handling.
- [ ] Simplify obtaining Instagram Access Token for testing.
- [ ] Add more features.
 - [x] ~~Get detailed info about user profile.~~
 - [x] ~~Calculate averages per media (likes, comments, etc).~~
 - [ ] Process comments (get common words, average response time, etc).
 - [ ] Process likes (most liked photo, top 3 photos, top fans, etc).

## contribution

After checking [Github Issues](https://github.com/heartyrobot/node-instagram-analytics/issues) or having a chat with [@jobsamuel](https://telegram.me/jobsamuel) about the project, feel free to fork and create a Pull Request.

## license

[MIT](http://opensource.org/licenses/MIT) License :copyright: 2015 Hearty Robot and [other contributors](https://github.com/heartyrobot/node-instagram-analytics/graphs/contributors)