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
          background-color: hsl(225, 25%, 6%);
          color: hsl(48, 100%, 98%);
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
          border-bottom: 1px solid hsl(48, 30%, 88%);
          display: grid;
          grid-template-columns: 1fr auto;
          width: 100%;
        }

        .texto-chats {
          font-size: 1.2rem;
          padding: 0.8rem;
        }

        .iconos-chats {
          color: hsl(215, 100%, 80%);
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
          background-color: hsl(225, 75%, 15%);
          border: 1px solid hsl(225, 35%, 28%);
          border-radius: 0.4rem;
          color: hsl(48, 100%, 98%);
          cursor: pointer;
          font-size: 1rem;
          height: 3rem;
          overflow: hidden;
          padding: 0.7rem;
          transition: background-color 0.2s, border-color 0.2s, box-shadow 0.2s;
        }

        .chat:hover {
          background-color: hsl(215, 85%, 25%);
          border-color: hsl(215, 100%, 80%);
          box-shadow: 0 0 0.5rem hsl(215, 100%, 65% / 0.3);
        }

        .cerrar-registros {
          border: 1px solid hsl(48, 30%, 88%);
          border-radius: 0.4rem;
          color: hsl(48, 100%, 98%);
          cursor: pointer;
          margin-top: 0.5rem;
          padding: 0.8rem;
        }

        .cerrar-registros:hover {
          background-color: hsl(225, 75%, 18%);
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