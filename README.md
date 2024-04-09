# listening streamer

nodejs websocket which occasionally pings last.fm for the currently playing track of a user and broadcasts it to all connected clients

## usage

- you must have a last.fm api key, a last.fm account to track (so connect it to your streaming service) and a last.fm username
- `npm install` to install dependencies
- `npm start` to start the server

## config

- create a `.env` file in the root directory (ignored by git) with the following keys
    - `LASTFM_API_KEY` - your last.fm api key
    - `LASTFM_USERNAME` - the last.fm username you want to track
    - `PORT` - the port the server should run on (defaults to 1743)

## client

- connect to the server via websocket (recommended to use [socket.io](https://socket.io/) for client)
- listen for the following events
    - `data` - literally every message the server sends
- data will be formatted as JSON:
```ts
data = {
    listening: true | false // whether the user is currently listening to music
    track: { // this object will only be present if listening is true
        name: string // the name of the track
        artist: string // the name of the artist
        albumArt: {
            small: string // a small image of the album art
            medium: string // a medium image of the album art
            large: string // a large image of the album art
        }
    }
}
```
## benefits

- you can use this to display the currently playing track on a website, in a discord bot, etc.
- you can use this to trigger events based on the currently playing track
- this server has its own persistent connection to last.fm, so you don't have to worry about rate limiting or anything like that
- only sends data when the currently playing track changes, so you don't have to worry about spamming your clients with data

## limitations
- this server only tracks one user at a time (which is why self-hosting is a requirement)
- this server only tracks the currently playing track, not the entire listening history (though you could see this as a benefit, as it reduces the amount of data sent to clients)
- small delay of maximum 5 seconds (as data is requested every 2.5, and the data sending logic is triggered every 2.5 seconds) but this is usually not noticeable (because other people cant hear the music you're listening to in real time anyway)

## license
ionknow man do whatever you want with this code just attribute me or something

---

listening streamer - a [MartinDEV](https://www.martin.blue) project (one day i'll have martindev.com... *one day*...)