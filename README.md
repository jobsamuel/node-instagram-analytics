# node-instagram-analytics
[![Dependency Status](https://david-dm.org/heartyrobot/node-instagram-analytics/status.svg)](https://david-dm.org/heartyrobot/node-instagram-analytics#info=Dependencies)

> NodeJS module for Instagram Analytics

# installation

```bash
$ npm install node-instagram-analytics
```

# usage

Example.js:

```js
var Analytics = require('node-instagram-analytics')

// use a valid instagram access token
var metrics = new Analytics('<INSTAGRAM_ACCESS_TOKEN>')

// analyze an instagram profile you have access to
metrics.simple('username', function (err, result) {
    if (err) {
        // do something
    }
    console.log(result)
})
```

The result will be something like this:

```json
{
  "likes_per_media": "63.79",
  "comments_per_media": "22.5",
  "total_likes": 2679,
  "total_comments": 945,
  "ratio": "5.68",
  "limits": "4853 remaining requests for this hour."
}
```

# todo

- [x] Publish to npm.
- [x] Explain module usage (improve README).
- [ ] Add more features.
 - [x] Get detailed info about user profile.
 - [x] Calculate averages per media (likes, comments, response time, etc).
 - [ ] Process comments.

# contribution

After checking [Github Issues](https://github.com/heartyrobot/node-instagram-analytics/issues) or having a chat with [@jobsamuel](https://telegram.me/jobsamuel) about the project, feel free to fork and create a Pull Request.

# license

[MIT](http://opensource.org/licenses/MIT) License :copyright: 2015 Hearty Robot and [other contributors](https://github.com/heartyrobot/node-instagram-analytics/graphs/contributors)