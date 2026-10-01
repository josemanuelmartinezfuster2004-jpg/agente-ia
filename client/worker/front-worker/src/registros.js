class Registros extends HTMLElement {
  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
    this.data = []
  }

  connectedCallback() {
    this.loadData()
    this.render()
    this.eventos()
  }

  loadData() {
    this.data = [
      { name: 'Cositas', id: 1 },
      { name: 'Chat 2', id: 2 },
      { name: 'Chat 3', id: 3 },
      { name: 'Chat 4', id: 4 },
      { name: 'Chat 5', id: 5 },
      { name: 'Chat 6', id: 6 },
      { name: 'Chat 7', id: 7 },
      { name: 'Chat 8', id: 8 },
      { name: 'Chat 9', id: 9 },
      { name: 'Chat 10', id: 10 },
      { name: 'Chat 11', id: 11 },
      { name: 'Chat 12', id: 12 }
    ]
  }

  render() {
    this.shadow.innerHTML = /*html*/`
      <style>
        :host {
          background-color: hsl(197, 95%, 59%);
          display: block;
        }

        :host(.ocultar-registros) {
          display: none;
        }

        .acordeon-chats {
          align-items: center;
          display: flex;
          flex-direction: column;
          padding: 0 1rem;
        }

        .acordeon-chats details {
          width: 100%;
        }

        .acordeon-chats summary {
          align-items: center;
          cursor: pointer;
          display: flex;
        }

        .caja-chats {
          align-items: center;
          display: grid;
          grid-template-columns: 1fr auto;
          width: 100%;
        }

        .texto-chats {
          font-size: 1.2rem;
          padding: 0.8rem;
        }

        .iconos-chats {
          font-size: 1.2rem;
          padding: 0.8rem;
        }

        .desplegable {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          padding: 0.5rem;
        }

        .chat {
          cursor: pointer;
          font-size: 1rem;
          height: 3rem;
          overflow: hidden;
          padding: 0.7rem;
        }

        .cerrar-registros {
          cursor: pointer;
          padding: 0.8rem;
        }

        @media (max-width: 87.5rem) {
          .texto-chats,
          .iconos-chats {
            font-size: 1rem;
          }

          .chat {
            font-size: 0.9rem;
          }
        }

        @media (max-width: 40.63rem) {
          .texto-chats,
          .iconos-chats,
          .cerrar-registros {
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
        <details open>
          <summary>
            <div class="caja-chats">
              <div class="texto-chats">
                <p>Recientes</p>
              </div>

              <div class="iconos-chats">
                <p>+</p>
              </div>
            </div>
          </summary>

          <div class="desplegable"></div>
        </details>

        <div class="cerrar-registros">
          <p>X</p>
        </div>
      </div>
    `

    const desplegable = this.shadow.querySelector('.desplegable')

    this.data.forEach(element => {
      const chat = document.createElement('div')
      chat.classList.add('chat')
      desplegable.appendChild(chat)

      const p = document.createElement('p')
      p.textContent = element.name
      chat.appendChild(p)
    })
  }

  eventos() {
    const btnCerrarRegistros = this.shadow.querySelector('.cerrar-registros')

    btnCerrarRegistros.addEventListener('click', () => {
      this.classList.add('ocultar-registros')
      document.dispatchEvent(new CustomEvent('registros-cerrados'))
    })
  }
}

customElements.define('registros-component', Registros)