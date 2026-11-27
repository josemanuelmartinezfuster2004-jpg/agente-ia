
class Registros extends HTMLElement {
  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
    this.data = []
    this.selectedId = null
  }

  connectedCallback() {
    this.render()
    this.eventos()
    this.loadData()
  }

  render() {
    this.shadow.innerHTML = /*html*/`
      <style>
        :host {
          background-color: hsl(225, 25%, 6%);
          color: hsl(48, 100%, 98%);
          display: block;
        }

        .acordeon-chats {
          display: flex;
          flex-direction: column;
          padding: 0 1rem;
        }

        .caja-chats {
          align-items: center;
          border-bottom: 1px solid hsl(48, 30%, 88%);
          display: flex;
          justify-content: space-between;
          width: 100%;
        }

        .texto-chats {
          font-size: 1.2rem;
          padding: 0.8rem;
        }

        .texto-chats p {
          margin: 0;
        }

        .nuevo-chat {
          align-items: center;
          background-color: transparent;
          border: 1px solid hsl(215, 100%, 80%);
          border-radius: 0.4rem;
          color: hsl(215, 100%, 80%);
          cursor: pointer;
          display: flex;
          font-size: 1.4rem;
          height: 2.5rem;
          justify-content: center;
          width: 2.5rem;
        }

        .nuevo-chat:hover {
          background-color: hsl(215, 85%, 25%);
          color: hsl(48, 100%, 98%);
        }

        .desplegable {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          padding: 0.5rem;
        }

        .chat {
          background-color: hsl(225, 75%, 15%);
          border: 1px solid hsl(225, 35%, 28%);
          border-radius: 0.4rem;
          color: hsl(48, 100%, 98%);
          cursor: pointer;
          font-size: 1rem;
          min-height: 3rem;
          overflow: hidden;
          padding: 0.7rem;
          text-align: left;
          text-overflow: ellipsis;
          transition: background-color 0.2s, border-color 0.2s, box-shadow 0.2s;
          white-space: nowrap;
          width: 100%;
        }

        .chat:hover,
        .chat.activo {
          background-color: hsl(215, 85%, 25%);
          border-color: hsl(215, 100%, 80%);
          box-shadow: 0 0 0.5rem hsl(215, 100%, 65% / 0.3);
        }

        .sin-conversaciones {
          color: hsl(215, 20%, 70%);
          font-size: 0.9rem;
          padding: 0.8rem;
        }

        @media (max-width: 87.5rem) {
          .texto-chats {
            font-size: 1rem;
          }

          .chat {
            font-size: 0.9rem;
          }
        }

        @media (max-width: 40.63rem) {
          .texto-chats {
            padding: 0.5rem;
          }

          .desplegable {
            padding: 0.3rem;
          }

          .chat {
            padding: 0.5rem;
          }
        }
      </style>

      <div class="acordeon-chats">
        <div class="caja-chats">
          <div class="texto-chats">
            <p>Recientes</p>
          </div>

          <button
            class="nuevo-chat"
            type="button"
            aria-label="Crear nueva conversación"
            title="Nueva conversación"
          >
            +
          </button>
        </div>

        <div class="desplegable">
          <p class="sin-conversaciones">Cargando conversaciones...</p>
        </div>
      </div>
    `
  }

  async loadData() {
    const desplegable = this.shadow.querySelector('.desplegable')

    try {
      const result = await fetch('/api/worker/conversations')
      const data = await result.json()

      if (!result.ok) {
        throw new Error(data.message || 'No se pudieron cargar las conversaciones.')
      }

      this.data = data
      this.renderConversations()
    } catch (error) {
      desplegable.innerHTML = ''

      const mensaje = document.createElement('p')
      mensaje.classList.add('sin-conversaciones')
      mensaje.textContent = 'No se pudieron cargar las conversaciones.'

      desplegable.appendChild(mensaje)
      console.error(error)
    }
  }

  renderConversations() {
    const desplegable = this.shadow.querySelector('.desplegable')
    desplegable.innerHTML = ''

    if (!this.data.length) {
      const mensaje = document.createElement('p')
      mensaje.classList.add('sin-conversaciones')
      mensaje.textContent = 'Todavía no hay conversaciones.'

      desplegable.appendChild(mensaje)
      return
    }

    this.data.forEach(conversation => {
      const chat = document.createElement('button')

      chat.type = 'button'
      chat.classList.add('chat')
      chat.dataset.id = conversation.conversationId
      chat.textContent = conversation.title || 'Nueva conversación'
      chat.title = chat.textContent

      if (conversation.conversationId === this.selectedId) {
        chat.classList.add('activo')
      }

      desplegable.appendChild(chat)
    })
  }

  eventos() {
    const btnNuevoChat = this.shadow.querySelector('.nuevo-chat')
    const desplegable = this.shadow.querySelector('.desplegable')

    btnNuevoChat.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('new-conversation'))
    })

    desplegable.addEventListener('click', event => {
      const chat = event.target.closest('.chat')

      if (!chat) return

      this.selectedId = chat.dataset.id
      this.renderConversations()

      document.dispatchEvent(new CustomEvent('conversation-selected', {
        detail: {
          conversationId: this.selectedId
        }
      }))
    })

    document.addEventListener('conversation-created', event => {
      this.selectedId = event.detail.conversationId
      this.loadData()
    })

    document.addEventListener('conversations-updated', () => {
      this.loadData()
    })
  }
}

customElements.define('registros-component', Registros)
