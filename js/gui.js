/* global EventTarget, CustomEvent */

function timestamp () {
  return (new Date()).toTimeString().substr(0, 8)
}

export default class GUI extends EventTarget {
  constructor (target) {
    super()
    this.target = target

    this.connect = document.querySelector('.connect')
    this.connect.querySelector('button').addEventListener('click', _ => this.clickConnect())
    this.descriptionBox = this.connect.querySelector('textarea')
    this.descriptionBox.value = ''

    this.chat = document.querySelector('.chat')
    this.chat.querySelector('button').addEventListener('click', _ => this.sendMessage())
    this.messageBox = this.chat.querySelector('input[type="text"]')
    this.chatBox = this.chat.querySelector('div')

    this.addEventListener('candidate', candidateEvent => (this.descriptionBox.value = JSON.stringify(candidateEvent.detail)))
    this.addEventListener('connect', connectEvent => {
      this.connect.style.display = 'none'
      this.chat.style.display = 'initial'
    })
    this.addEventListener('message', messageEvent => this._addChatLine(messageEvent.detail, 'you'))
  }

  trigger (name, detail) {
    this.target.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: detail }))
  }

  clickConnect () {
    const description = this.descriptionBox.value
    try {
      this.trigger('connect', JSON.parse(description))
    } catch (e) {
      this.trigger('connect')
    }
    this.descriptionBox.value = ''
  }

  sendMessage () {
    const message = this.messageBox.value
    if (message.length) {
      this._addChatLine(message, 'me')
      this.trigger('message', message)
    }
    this.messageBox.value = ''
  }

  _addChatLine (text, type) {
    this.chatBox.insertAdjacentHTML('beforeend', `<p class="from-${type}">[${timestamp()}] ${text}</p>`)
    this.chatBox.scrollTop = this.chatBox.scrollHeight
  }
}
