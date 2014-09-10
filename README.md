Yotube
======
Send a Yo when you upload a video to your channel

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/jonalmeida/yotube)


## Heroku Deploy

### Step 1: Setup Heroku
```
$ heroku create
$ git push heroku master
$ heroku config:set YOUTUBE_CHANNEL=thehungrywinos
$ heroku config:set API_KEY=1234abcd-56ef-78gh-90ij-123456abcdef
$ heroku run npm install
$ heroku open
```
### Step 2: Stop your app from idling
There won't be much incoming activity since the app purely monitors YouTube channels, so Heroku will start to idle the app causing it to stop working correctly.
To fix this, add your Heroku app to [Kaffeine](http://kaffeine.herokuapp.com/) to stop it from idling.

## LICENSE
See LICENSE.md file.