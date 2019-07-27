import GUI from './gui.js'
import WebRTC from './webRTC.js'

const stunServers = [
  { urls: 'stun:stun.schlund.de' }
  /*
  Source: https://gist.github.com/yetithefoot/7592580
  { urls: 'stun:stun.voipbuster.com' },
  { urls: 'stun:stun.ideasip.com' },
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
  { urls: 'stun:stun.iptel.org' },
  { urls: 'stun:stun.softjoys.com' },
  { urls: 'stun:stun.xten.com' }
  */
]

const webRtc = new WebRTC(stunServers)
const gui = new GUI(webRtc)
webRtc.weave(gui)