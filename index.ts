// basically, stream ur now playing from last.fm to a websocket client

const certs = {
  key: require('fs').readFileSync('./dev.nowplaying.martin.blue-key.pem'),
  cert: require('fs').readFileSync('./dev.nowplaying.martin.blue.pem')
}

import { createServer as ss } from 'https';
import express from 'express';
import WebSocket from 'ws';
import axios from 'axios';
import { NowListeningObject } from './types';
const dotenv = require('dotenv').config();

const API_KEY = process.env.LASTFM_API_KEY;
const username = process.env.LASTFM_USERNAME;
const port = Number(process.env.PORT) || 1743;

let currentTrack: NowListeningObject;

const fetchRecentTracks = async () => {
  try {
    const response = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${API_KEY}&format=json`);
    const track = response.data.recenttracks.track[0];
    if (track['@attr'] && track['@attr'].nowplaying) console.log(`Fetched track: ${track.name} by ${track.artist['#text']} from Last.fm`);
    if (track['@attr'] && track['@attr'].nowplaying) {
      currentTrack = {
        listening: true,
            track: {
            name: track.name,
            artist: track.artist['#text'],
            albumArt: {
                small: track.image[0]['#text'],
                medium: track.image[1]['#text'],
                large: track.image[2]['#text'],
            },
        },
      }
    } else {
      currentTrack = {
        listening: false
      }
    }
  } catch (error) {
    console.error(error);
  }
};

fetchRecentTracks();

setInterval(fetchRecentTracks, 2500);

// configuring servers
// - http - bounce to https
const secureServer = ss(certs, express()).listen(1743); console.log('Secure server listening on port 1743');
const wss = new WebSocket.Server({ server: secureServer, perMessageDeflate: false }); console.log('Websocket server binding to secure server');
wss.on('connection', (ws:any) => {
  console.log('Client connected: streaming now playing data');
  let justSent: NowListeningObject = currentTrack;
  ws.send(JSON.stringify(justSent));
  const interval = setInterval(() => {
    if (currentTrack.listening && justSent.listening) {
      // check if the track has changed
      if (currentTrack.track.name !== justSent.track.name) {
        console.log('Track has changed: sending new track to client');
        ws.send(JSON.stringify(currentTrack));
        justSent = currentTrack;
      }
    } else if (currentTrack.listening !== justSent.listening) {
      // send the client that the user is no longer listening to anything / has started listening to something
      ws.send(JSON.stringify(currentTrack));
      justSent = currentTrack;
    } else {
      // sending nothing: reduces bandwidth and client parsing
      console.log('No change in track: sending nothing to client');
    }
  }, 2500);
  ws.on('close', () => {
    clearInterval(interval);
  });
});
