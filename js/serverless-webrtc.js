import Chat from './chat.js'
import GUI from './gui.js'
import SdpZip from './spdCompressor.js'

/* global RTCPeerConnection, RTCSessionDescription, RTCMultiSession, FileReceiver, attachMediaStream */
/* See also:
    http://www.html5rocks.com/en/tutorials/webrtc/basics/
    https://code.google.com/p/webrtc-samples/source/browse/trunk/apprtc/index.html

    https://webrtc-demos.appspot.com/html/pc1.html
*/

var cfg = { 'iceServers': [ { 'url': 'stun:23.21.150.121' } ] }
var con = { 'optional': [ { 'DtlsSrtpKeyAgreement': true } ] }

var sdpConstraints = {
  optional: [],
  mandatory: {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true
  }
}

let chat = new Chat('#chatlog')
let gui = new GUI(connect, message)
let caller = false

function connect (sdp) {
  if (sdp.length === 0) {
    caller = true
    return createLocalOffer()
  }
  let offer = new RTCSessionDescription({
    'type': 'offer',
    'sdp': SdpZip.decompress(sdp)
  })
  if (caller) {
    chat.log('Received answer')
    handleAnswerFromPC2(offer)
  } else {
    chat.log('Received offer')
    handleOfferFromPC1(offer)
  }
}

function message (message) {
  var channel = new RTCMultiSession()
  chat.write(message)
  channel.send({ message: message })
  chat.scrollToEnd()
}

/* THIS IS ALICE, THE CALLER/SENDER */

var pc1 = new RTCPeerConnection(cfg, con)
var dc1 = null

// Since the same JS file contains code for both sides of the connection,
// activedc tracks which of the two possible datachannel variables we're using.
window.activedc = null

function setupDC1 () {
  try {
    dc1 = pc1.createDataChannel('test', { reliable: true })
    window.activedc = dc1
    console.log('Created datachannel (pc1)')
    dc1.onopen = function (e) {
      gui.startChat()
    }
    dc1.onmessage = function (e) {
      console.log('Got message (pc1)', e.data)
      if (e.data.size) {
      } else {
        if (e.data.charCodeAt(0) === 2) {
          // The first message we get from Firefox (but not Chrome)
          // is literal ASCII 2 and I don't understand why -- if we
          // leave it in, JSON.parse() will barf.
          return
        }
        console.log(e)
        var data = JSON.parse(e.data)
        if (data.type === 'file') {
        } else {
          chat.info(data.message)
          // Scroll chat text area to the bottom on new input.
          chat.scrollToEnd()
        }
      }
    }
  } catch (e) {
    console.warn('No data channel (pc1)', e)
  }
}

function createLocalOffer () {
  setupDC1()
  pc1.createOffer(
    function (desc) {
      console.log('creating offer')
      pc1.setLocalDescription(desc, function () {}, function () {})
    },
    function () {
      console.warn('Couldn\'t create offer')
    },
    sdpConstraints
  )
}

function handleIcecandidate (e) {
  console.log(`ICE candidate (${caller ? 'pc1' : 'pc2'})`)
  if (e.candidate == null) {
    let sdp = (caller ? pc1 : pc2).localDescription.sdp
    gui.sdp = SdpZip.compress(sdp)
  }
}

pc1.onicecandidate = handleIcecandidate

function handleOnaddstream (e) {
  console.log('Got remote stream', e.stream)
  var el = document.getElementById('remoteVideo')
  el.autoplay = true
  attachMediaStream(el, e.stream)
}

pc1.onaddstream = handleOnaddstream

function handleOnconnection () {
  gui.startChat()
}

pc1.onconnection = handleOnconnection

/*
function onsignalingstatechange (state) {
  console.info('signaling state change:', state)
}

function oniceconnectionstatechange (state) {
  console.info('ice connection state change:', state)
}

function onicegatheringstatechange (state) {
  console.info('ice gathering state change:', state)
}
pc1.onsignalingstatechange = onsignalingstatechange
pc1.oniceconnectionstatechange = oniceconnectionstatechange
pc1.onicegatheringstatechange = onicegatheringstatechange
*/

function handleAnswerFromPC2 (answerDesc) {
  chat.write('Received answer')
  pc1.setRemoteDescription(answerDesc)
}

/* THIS IS BOB, THE ANSWERER/RECEIVER */

var pc2 = new RTCPeerConnection(cfg, con)
var dc2 = null

pc2.ondatachannel = function (e) {
  var fileReceiver2 = new FileReceiver()
  var datachannel = e.channel || e // Chrome sends event, FF sends raw channel
  console.log('Received datachannel (pc2)', arguments)
  dc2 = datachannel
  window.activedc = dc2
  dc2.onopen = function (e) {
    gui.startChat()
  }
  dc2.onmessage = function (e) {
    console.log('Got message (pc2)', e.data)
    if (e.data.size) {
      fileReceiver2.receive(e.data, {})
    } else {
      var data = JSON.parse(e.data)
      if (data.type === 'file') {
        fileReceiver2.receive(e.data, {})
      } else {
        chat.info(data.message)
        // Scroll chat text area to the bottom on new input.
        chat.scrollToEnd()
      }
    }
  }
}

function handleOfferFromPC1 (offerDesc) {
  pc2.setRemoteDescription(offerDesc)
  pc2.createAnswer(function (answerDesc) {
    console.log('creating answer')
    pc2.setLocalDescription(answerDesc)
  },
  function () { console.warn("Couldn't create answer") },
  sdpConstraints)
}

/*
pc2.onsignalingstatechange = onsignalingstatechange
pc2.oniceconnectionstatechange = oniceconnectionstatechange
pc2.onicegatheringstatechange = onicegatheringstatechange
*/

pc2.onicecandidate = handleIcecandidate
pc2.onaddstream = handleOnaddstream
pc2.onconnection = handleOnconnection
