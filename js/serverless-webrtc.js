/* global $, RTCPeerConnection, RTCSessionDescription, RTCMultiSession, FileSender, FileReceiver, attachMediaStream */
/* See also:
    http://www.html5rocks.com/en/tutorials/webrtc/basics/
    https://code.google.com/p/webrtc-samples/source/browse/trunk/apprtc/index.html

    https://webrtc-demos.appspot.com/html/pc1.html
*/

var cfg = { 'iceServers': [ { 'url': 'stun:23.21.150.121' } ] }
var con = { 'optional': [ { 'DtlsSrtpKeyAgreement': true } ] }

/* THIS IS ALICE, THE CALLER/SENDER */

var pc1 = new RTCPeerConnection(cfg, con)
var dc1 = null

// Since the same JS file contains code for both sides of the connection,
// activedc tracks which of the two possible datachannel variables we're using.
window.activedc = null

var sdpConstraints = {
  optional: [],
  mandatory: {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true
  }
}

$('#showLocalOffer').modal('hide')
$('#getRemoteAnswer').modal('hide')
$('#waitForConnection').modal('hide')
$('#createOrJoin').modal('show')

document.querySelector('#createBtn').addEventListener('click', function () {
  $('#showLocalOffer').modal('show')
  createLocalOffer()
})

document.querySelector('#joinBtn').addEventListener('click', function () {
  $('#getRemoteOffer').modal('show')
})

document.querySelector('#offerSentBtn').addEventListener('click', function () {
  $('#getRemoteAnswer').modal('show')
})

document.querySelector('#offerRecdBtn').addEventListener('click', function () {
  var offer = document.querySelector('#remoteOffer').value
  var offerDesc = new RTCSessionDescription(JSON.parse(offer))
  console.log('Received remote offer', offerDesc)
  writeToChatLog('Received remote offer', 'text-success')
  handleOfferFromPC1(offerDesc)
  $('#showLocalAnswer').modal('show')
})

document.querySelector('#answerSentBtn').addEventListener('click', function () {
  $('#waitForConnection').modal('show')
})

document.querySelector('#answerRecdBtn').addEventListener('click', function () {
  var answer = document.querySelector('#remoteAnswer').value
  var answerDesc = new RTCSessionDescription(JSON.parse(answer))
  handleAnswerFromPC2(answerDesc)
  $('#waitForConnection').modal('show')
})

document.querySelector('#fileBtn').addEventListener('change', function () {
  var file = this.files[0]
  console.log(file)

  sendFile(file)
})

function fileSent (file) {
  console.log(file + ' sent')
}

function fileProgress (file) {
  console.log(file + ' progress')
}

function sendFile (data) {
  if (data.size) {
    FileSender.send({
      file: data,
      onFileSent: fileSent,
      onFileProgress: fileProgress
    })
  }
}

window.sendMessage = function () {
  if (document.querySelector('#messageTextBox').value) {
    var channel = new RTCMultiSession()
    writeToChatLog(document.querySelector('#messageTextBox').value, 'text-success')
    channel.send({ message: document.querySelector('#messageTextBox').value })
    document.querySelector('#messageTextBox').value = ''

    // Scroll chat text area to the bottom on new input.
    this.document.querySelector('#chatlog').scrollTop = this.document.querySelector('#chatlog').scrollHeight
  }

  return false
}

function setupDC1 () {
  try {
    var fileReceiver1 = new FileReceiver()
    dc1 = pc1.createDataChannel('test', { reliable: true })
    window.activedc = dc1
    console.log('Created datachannel (pc1)')
    dc1.onopen = function (e) {
      console.log('data channel connect')
      $('#waitForConnection').modal('hide')
      document.querySelector('#waitForConnection').remove()
    }
    dc1.onmessage = function (e) {
      console.log('Got message (pc1)', e.data)
      if (e.data.size) {
        fileReceiver1.receive(e.data, {})
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
          fileReceiver1.receive(e.data, {})
        } else {
          writeToChatLog(data.message, 'text-info')
          // Scroll chat text area to the bottom on new input.
          document.querySelector('#chatlog').scrollTop = document.querySelector('#chatlog').scrollHeight
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
      pc1.setLocalDescription(desc, function () {}, function () {})
      console.log('created local offer', desc)
    },
    function () {
      console.warn("Couldn't create offer")
    },
    sdpConstraints
  )
}

pc1.onicecandidate = function (e) {
  console.log('ICE candidate (pc1)', e)
  if (e.candidate == null) {
    document.querySelector('#localOffer').innerHTML = JSON.stringify(pc1.localDescription)
  }
}

function handleOnaddstream (e) {
  console.log('Got remote stream', e.stream)
  var el = document.getElementById('remoteVideo')
  el.autoplay = true
  attachMediaStream(el, e.stream)
}

pc1.onaddstream = handleOnaddstream

function handleOnconnection () {
  console.log('Datachannel connected')
  writeToChatLog('Datachannel connected', 'text-success')
  $('#waitForConnection').modal('hide')
  // If we don't call remove() here, there would be a race on pc2:
  //   - first onconnection() hides the dialog, then someone clicks
  //     on answerSentBtn which shows it, and it stays shown forever.
  document.querySelector('#waitForConnection').remove()
  $('#showLocalAnswer').modal('hide')
  document.querySelector('#messageTextBox').focus()
}

pc1.onconnection = handleOnconnection

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

function handleAnswerFromPC2 (answerDesc) {
  console.log('Received remote answer: ', answerDesc)
  writeToChatLog('Received remote answer', 'text-success')
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
    console.log('data channel connect')
    $('#waitForConnection').modal('hide')
    document.querySelector('#waitForConnection').remove()
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
        writeToChatLog(data.message, 'text-info')
        // Scroll chat text area to the bottom on new input.
        document.querySelector('#chatlog').scrollTop = document.querySelector('#chatlog').scrollHeight
      }
    }
  }
}

function handleOfferFromPC1 (offerDesc) {
  pc2.setRemoteDescription(offerDesc)
  pc2.createAnswer(function (answerDesc) {
    writeToChatLog('Created local answer', 'text-success')
    console.log('Created local answer: ', answerDesc)
    pc2.setLocalDescription(answerDesc)
  },
  function () { console.warn("Couldn't create offer") },
  sdpConstraints)
}

pc2.onicecandidate = function (e) {
  console.log('ICE candidate (pc2)', e)
  if (e.candidate == null) {
    document.querySelector('#localAnswer').innerHTML = JSON.stringify(pc2.localDescription)
  }
}

pc2.onsignalingstatechange = onsignalingstatechange
pc2.oniceconnectionstatechange = oniceconnectionstatechange
pc2.onicegatheringstatechange = onicegatheringstatechange

pc2.onaddstream = handleOnaddstream
pc2.onconnection = handleOnconnection

function getTimestamp () {
  var totalSec = new Date().getTime() / 1000
  var hours = parseInt(totalSec / 3600) % 24
  var minutes = parseInt(totalSec / 60) % 60
  var seconds = parseInt(totalSec % 60)

  var result = (hours < 10 ? '0' + hours : hours) + ':' +
    (minutes < 10 ? '0' + minutes : minutes) + ':' +
    (seconds < 10 ? '0' + seconds : seconds)

  return result
}

function writeToChatLog (message, messageype) {
  document.getElementById('chatlog').innerHTML += '<p class="' + messageype + '">' + '[' + getTimestamp() + '] ' + message + '</p>'
}
