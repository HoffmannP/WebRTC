function timestamp () {
  return (new Date()).toTimeString().substr(0, 8)
}

export default class Chat {
  constructor (selector) {
    this.element = document.querySelector(selector)
  }

  scrollToEnd () {
    this.element.scrollTop = this.element.scrollHeight
  }

  entry (text, type) {
    this.element.innerHTML += `<p class="text-${type}">[${timestamp()}] ${text}</p>`
  }

  write (text) {
    this.entry(text, 'success')
  }

  log (text) {
    console.log(text)
    this.entry(text, 'success')
  }

  info (text) {
    this.entry(text, 'info')
  }
}