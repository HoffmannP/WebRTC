export default class connectionDialoge {
  #ressources = {
      "select": {
          "header": "Create or join a room?",
          "body": "",
          "button": "select"
      },
      "localoffer": {
          "header": "Send your local offer to someone else",
          "body": "Here's your \"offer\" -- it tells someone else how to connect to you.  Send the whole thing to them, for example in an instant message or e-mail.",
          "element": "textarea",
          "button": "sent"
      },
      "localanswere": {
          "header": "Send your local answer to someone else",
          "body": "Here's your \"answer\" -- it tells someone else how to connect to you.  Send the whole thing to them, for example in an instant message or e-mail.",
          "element": "textarea",
          "button": "sent"
      },
      "remoteoffer": {
          "header": "Paste the \"offer\" you received",
          "body": "The person who created the room will send you an \"offer\" string -- paste it here.",
          "element": "textarea",
          "button": "received"
      },
      "remoteanswere": {
          "header": "Paste the \"answer\" you received",
          "body": "Now paste in the \"answer\" that was sent back to you.",
          "element": "textarea",
          "button": "received"
      },
      "waiting": {
          "header": "Waiting for connection",
          "body": "This dialog will disappear when a connection is made.",
          "element": "spinner",
          "button": ""
      }
  }

  buildModal (type) {
    let ressource = this.#this.ressources[type]
    this.#title.textContent = ressource.header
    this.#body.textContent = ressource.body
    if ('element' in ressource) {
      this.#body.insertAdjacentHTML('beforeend', '<br>')
      switch (ressource.element) {
        case 'textarea':
          this.#body.insertAdjacentHTML('beforeend', '<textarea class="input-large" rows="10" cols="100"></textarea>')
          break
        case 'spinner':
          this.#body.insertAdjacentHTML('beforeend', '<div class="spinner" align="center"><img src="img/spinner.gif"></img></div>')
          break
      }
    }
    switch (ressource.button) {
      case 'select':

    }
  }

  body (type) {

  }

  constructor () {
    this.buildModal()
    this.#title = this.modal.querySelector('.modal-header h3')
    this.#body = this.modal.querySelector('.modal-body')
    this.#footer = this.modal.querySelector('.modal-footer')
  }

  buildModal () {
    this.modal = document.createElement('div')
    this.modal.classList.add('modal')
    this.modal.datalist.backdrop = 'static'
    this.modal.addAttribute('tabindex', -1)
    this.modal.innerHTML = 
    document.body.insertAdjacentHTML(`
      <div class="modal-header"><h3></h3></div>
      <div class="modal-body"></div>
      <div class="modal-footer"></div>
    `)
  }

  selectDirection () {
    this.title(this.#this.ressources.select.header)
    this.modal.querySelector('h3').textContent = this.#this.ressources.select.header
    this.modal.querySelector('.modal-footer').innerHTML = `
    <button class="btn">Join</button>
    <button class="btn btn-primary">Create</button>
    `
    this.modal.querySelector('.modal-footer').addEventListener('click', e => )
  }
}
