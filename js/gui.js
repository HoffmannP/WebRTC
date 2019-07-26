export default class GUI {
  constructor (connectCallback, messageCallback) {
    this.callback = {
      connect: connectCallback,
      message: messageCallback
    }
    this.connect = document.querySelector('.connect')
    this.connect.querySelector('button').addEventListener('click', _ => this.clickConnect())
    this.sdpBox = this.connect.querySelector('textarea')
    this.sdpBox.value = ''

    this.chat = document.querySelector('.chat')
    this.chat.querySelector('button').addEventListener('click', _ => this.sendMessage())
    this.messageBox = this.chat.querySelector('input[type="text"]')
  }

  clickConnect () {
    let sdp = this.sdpBox.value
    this.callback.connect(sdp)
    this.sdpBox.value = ''
  }

  set sdp (sdp) {
    console.log('set sdp')
    this.sdpBox.value = sdp
  }

  sendMessage () {
    let message = this.messageBox.value
    if (message.length) {
      this.callback.message(message)
    }
    this.messageBox.value = ''
  }

  startChat () {
    console.log('data channel connected')
    this.connect.style.display = 'none'
    this.chat.style.display = ''
  }
}
