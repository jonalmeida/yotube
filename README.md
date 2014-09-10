Yotube
======
Send a Yo when you upload a video to your channel

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/jonalmeida/yotube)


## Heroku Deploy

### Step Heroku
```
$ heroku create
$ git push heroku master
$ heroku config:set YOUTUBE_CHANNEL=thehungrywinos
$ heroku config:set API_KEY=1234abcd-56ef-78gh-90ij-123456abcdef
$ heroku run npm install
$ heroku open
```
### Stop your app from idling
Add your Heroku app to [Kaffeine](http://kaffeine.herokuapp.com/) to stop it from idling.

## LICENSE
See LICENSE.md file.