// var RTCPeerConnection = null
var attachMediaStream = null
var reattachMediaStream = null
var webrtcDetectedBrowser = null

if (window.MediaDevices && window.MediaDevices.getUserMedia) {
  console.log('This appears to be a modern browser')

  webrtcDetectedBrowser = 'modern'

  // RTCPeerConnection = window.RTCPeerConnection

  RTCSessionDescription = window.RTCSessionDescription

  RTCIceCandidate = window.RTCIceCandidate

  attachMediaStream = function (element, stream) {
    element.src = stream
  }

  reattachMediaStream = function (to, from) {
    to.src = from.src
  }

} else if (navigator.mozGetUserMedia) {
  console.log('This appears to be Firefox')

  webrtcDetectedBrowser = 'firefox'

  // The RTCPeerConnection object.
  RTCPeerConnection = mozRTCPeerConnection

  // The RTCSessionDescription object.
  RTCSessionDescription = mozRTCSessionDescription

  // The RTCIceCandidate object.
  RTCIceCandidate = mozRTCIceCandidate

  // Attach a media stream to an element.
  attachMediaStream = function (element, stream) {
    console.log('Attaching media stream')
    element.mozSrcObject = stream
    element.play()
  }

  reattachMediaStream = function (to, from) {
    console.log('Reattaching media stream')
    to.mozSrcObject = from.mozSrcObject
    to.play()
  }

  // Fake get{Video,Audio}Tracks
  MediaStream.prototype.getVideoTracks = function () {
    return []
  }

  MediaStream.prototype.getAudioTracks = function () {
    return []
  }
} else if (navigator.webkitGetUserMedia) {
  console.log('This appears to be Chrome')

  webrtcDetectedBrowser = 'chrome'

  // The RTCPeerConnection object.
  RTCPeerConnection = webkitRTCPeerConnection

  // Attach a media stream to an element.
  attachMediaStream = function (element, stream) {
    element.src = webkitURL.createObjectURL(stream)
  }

  reattachMediaStream = function (to, from) {
    to.src = from.src
  }

  // The representation of tracks in a stream is changed in M26.
  // Unify them for earlier Chrome versions in the coexisting period.
  if (!webkitMediaStream.prototype.getVideoTracks) {
    webkitMediaStream.prototype.getVideoTracks = function () {
      return this.videoTracks
    }
    webkitMediaStream.prototype.getAudioTracks = function () {
      return this.audioTracks
    }
  }

  // New syntax of getXXXStreams method in M26.
  if (!webkitRTCPeerConnection.prototype.getLocalStreams) {
    webkitRTCPeerConnection.prototype.getLocalStreams = function () {
      return this.localStreams
    }
    webkitRTCPeerConnection.prototype.getRemoteStreams = function () {
      return this.remoteStreams
    }
  }
} else {
  console.log('Browser does not appear to be WebRTC-capable')
}
