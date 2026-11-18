# birarda.github.io

Published by GitHub Pages at <https://birarda.github.io/>, from `main`.

## spod

Built files for [spod](https://github.com/birarda/spod), an iPod-style
controller for Spotify and Sonos. Their source is in that repository, which
is private; these are public so GitHub Pages can serve them.

- `spod/callback/`: the relay that brings a sign-in, such as Spotify's,
  back to the spod plugin it started from on the local network, or shows
  the address to paste. It's the redirect
  URI of spod's Spotify app, `https://birarda.github.io/spod/callback/`,
  so it must stay at this address.
- `spod/app/`: spod's web preview, which can be added to a phone's home
  screen and signs in to Spotify through the relay.

To update the preview, run `./web/build.sh` in spod, then copy
`web/index.html`, `web/manifest.webmanifest`, `web/sw.js`, `web/icons/`,
`web/pkg/spod.js` and `web/pkg/spod_bg.wasm` into `spod/app/`, keeping
their paths.

`.nojekyll` makes Pages serve the files as they are.
