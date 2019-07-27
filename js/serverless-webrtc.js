/* global RTCPeerConnection, RTCDataChannel */
import GUI from './gui.js'

const stunServers = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun.schlund.de' },
  { urls: 'stun:stun.ideasip.com' },
  { urls: 'stun:stun.voipbuster.com' }
  /*
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
  { urls: 'stun:stun.iptel.org' },
  { urls: 'stun:stun.softjoys.com' },
  { urls: 'stun:stun.xten.com' },
  */
]
let dataChannel = null
const peerConnection = new RTCPeerConnection({ 'iceServers': stunServers })
const gui = new GUI(connect, message => dataChannel.send(message))

peerConnection.addEventListener('icecandidate',
  ICECandidateEvent => ICECandidateEvent.candidate || gui.setDescription(peerConnection.localDescription))

function connect (description) {
  try {
    const desc = JSON.parse(description)
    peerConnection.setRemoteDescription(desc)
    if (desc.type === 'offer') {
      createDescription('Answer')
    }
  } catch (e) {
    setupDataChannel()
    createDescription('Offer')
  }
}

RTCDataChannel.prototype.connect = function () {
  this.addEventListener('open', _ => gui.startChat())
  this.addEventListener('message', messageEvent => gui.receiveMessage(messageEvent.data))
  return this
}

function setupDataChannel () {
  dataChannel = peerConnection.createDataChannel('channel').connect()
}

function createDescription (type) {
  peerConnection[`create${type}`]()
    .then(desc => peerConnection.setLocalDescription(desc))
}

peerConnection.addEventListener('datachannel',
  DataChannelEvent => (dataChannel = DataChannelEvent.channel.connect()))
