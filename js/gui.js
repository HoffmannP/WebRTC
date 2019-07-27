function timestamp () {
  return (new Date()).toTimeString().substr(0, 8)
}

export default class GUI {
  constructor (connectCallback, messageCallback) {
    this.callback = {
      connect: connectCallback,
      message: messageCallback
    }
    this.connect = document.querySelector('.connect')
    this.connect.querySelector('button').addEventListener('click', _ => this.clickConnect())
    this.descriptionBox = this.connect.querySelector('textarea')
    this.descriptionBox.value = ''

    this.chat = document.querySelector('.chat')
    this.chat.querySelector('button').addEventListener('click', _ => this.sendMessage())
    this.messageBox = this.chat.querySelector('input[type="text"]')
    this.chatBox = this.chat.querySelector('.chatlog')
  }

  clickConnect () {
    let description = this.descriptionBox.value
    this.callback.connect(description)
    this.descriptionBox.value = ''
  }

  setDescription (description) {
    this.descriptionBox.value = JSON.stringify(description)
  }

  sendMessage () {
    let message = this.messageBox.value
    if (message.length) {
      this._addChatLine(message, 'success')
      this.callback.message(message)
    }
    this.messageBox.value = ''
  }

  receiveMessage (message) {
    this._addChatLine(message, 'info')
  }

  _addChatLine (text, type) {
    this.chatBox.insertAdjacentHTML('beforeend', `<p class="text-${type}">[${timestamp()}] ${text}</p>`)
    this.chatBox.scrollTop = this.chatBox.scrollHeight
  }

  startChat () {
    this.connect.style.display = 'none'
    this.chat.style.display = 'initial'
  }
}
