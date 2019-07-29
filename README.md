WebRTC
======

This is a tech demo of using WebRTC without a signaling server -- the 
WebRTC offer/answer exchange is performed manually by the users, for example
via IM.  This means that the app can run out of `file:///` directly, without
involving a web server.

This repository contains one web client:

`index.html` runs in any modern browser

### For browsers:

In Chrome (but not Firefox), you'll need to run a local web server rather
than just browsing to `file:///`, like this:

```
 λ cd WebRTC
 λ python -m SimpleHTTPServer 8001 .
Serving HTTP on 0.0.0.0 port 8001 ...
```

and then browse to [http://localhost:8001/](http://localhost:8001/).

You can also download the [minified all-included version](https://github.com/HoffmannP/index.min.html) and use it.

### Meta

This project invites interested readers for a [code roaster](https://dev.to/hoffmann/code-roaster-webrtc-6a9).

### Contribution

This project is heavily influenced on [Chris Ball's serverless-webrtc](https://github.com/cjb/serverless-webrtc/).
