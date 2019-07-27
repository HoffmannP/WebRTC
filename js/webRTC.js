/* global EventTarget, RTCPeerConnection, CustomEvent */

export default class webRTC extends EventTarget {
  constructor (iceServers) {
    super()
    this.connection = new RTCPeerConnection({ 'iceServers': iceServers })
    this.connection.addEventListener('icecandidate',
      ICECandidateEvent => ICECandidateEvent.candidate === null && this.trigger('candidate', this.connection.localDescription))
    this.connection.addEventListener('datachannel',
      ChannelEvent => this.connectChannel(ChannelEvent.channel))
    this.addEventListener('connect', this.connectHandler)
  }

  weave (target) {
    this.target = target
  }

  trigger (name, detail) {
    this.target.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: detail }))
  }

  connectHandler (connectEvent) {
    switch (this.connection.signalingState) {
      case 'stable':
        if (connectEvent.detail === null) {
          this.setupChannel()
          this.connection.createOffer()
            .then(desc => this.connection.setLocalDescription(desc))
        } else {
          this.connection.setRemoteDescription(connectEvent.detail)
          this.connection.createAnswer()
            .then(desc => this.connection.setLocalDescription(desc))
        }
        break
      case 'have-local-offer':
        this.connection.setRemoteDescription(connectEvent.detail)
    }
  }

  setupChannel () {
    this.connectChannel(this.connection.createDataChannel('channel'))
  }

  connectChannel (channel) {
    channel.addEventListener('open', _ => this.trigger('connect'))
    channel.addEventListener('message', messageEvent => this.trigger('message', messageEvent.data))
    this.addEventListener('message', message => channel.send(message.detail))
  }
}
