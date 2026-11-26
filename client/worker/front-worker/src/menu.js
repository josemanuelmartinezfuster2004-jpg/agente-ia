class Menu extends HTMLElement {
  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.render()
    this.eventos()
  }

  render() {
    this.shadow.innerHTML = /*html*/`
      <style>
        :host {
          background-color: hsl(225, 25%, 6%);
          color: hsl(48, 100%, 98%);
          display: block;
        }

        .arriba {
          align-items: center;
          background-color: hsl(225, 25%, 8%);
          border-bottom: 1px solid hsl(48, 30%, 88%);
          display: flex;
          justify-content: space-between;
          padding: 1rem;
        }

        .nombre-ia p {
          border: 1px solid hsl(48, 30%, 88%);
          border-radius: 0.4rem;
          font-size: 1.5rem;
          font-weight: 700;
          padding: 0 0.5rem;
        }

        .opciones {
          display: flex;
          gap: 0.5rem;
        }

        .buscar,
        .cerrar-barra {
          align-items: center;
          background-color: hsl(225, 75%, 18%);
          border: 1px solid hsl(215, 100%, 75%);
          border-radius: 0.5rem;
          cursor: pointer;
          display: flex;
          justify-content: center;
          padding: 0.5rem;
          transition: background-color 0.2s, box-shadow 0.2s;
        }

        .buscar:hover,
        .cerrar-barra:hover {
          background-color: hsl(215, 85%, 28%);
          box-shadow: 0 0 0.6rem hsl(215, 100%, 65% / 0.5);
        }

        .buscar svg,
        .cerrar-barra svg {
          fill: hsl(48, 100%, 98%);
          height: 1.5rem;
          width: 1.5rem;
        }

        .nuevo-chat {
          align-items: center;
          background-color: hsl(225, 75%, 18%);
          border: 1px solid hsl(215, 100%, 75%);
          border-radius: 0.5rem;
          color: hsl(48, 100%, 98%);
          cursor: pointer;
          display: flex;
          margin: 1rem;
          padding: 1rem;
          transition: background-color 0.2s, box-shadow 0.2s;
        }

        .nuevo-chat:hover {
          background-color: hsl(215, 85%, 28%);
          box-shadow: 0 0 0.7rem hsl(215, 100%, 65% / 0.4);
        }

        .nuevo-chat p {
          font-size: 1rem;
        }

        footer {
          align-items: center;
          background-color: hsl(225, 25%, 8%);
          border-top: 1px solid hsl(48, 30%, 88%);
          bottom: 0;
          color: hsl(48, 100%, 98%);
          display: flex;
          gap: 1rem;
          justify-content: space-between;
          padding: 1rem;
          position: fixed;
          width: 20%;
        }

        .usuario {
          align-items: center;
          display: flex;
          gap: 0.7rem;
        }

        .iniciales {
          align-items: center;
          background-color: hsl(225, 75%, 18%);
          border: 1px solid hsl(215, 100%, 80%);
          border-radius: 50%;
          color: hsl(48, 100%, 98%);
          display: flex;
          height: 2.5rem;
          justify-content: center;
          width: 2.5rem;
        }

        .nombre-usuario p {
          font-size: 0.9rem;
        }

        .gratis p {
          color: hsl(215, 100%, 80%);
          font-size: 0.8rem;
        }

        @media (max-width: 87.5rem) {
          footer {
            width: 30%;
          }
        }

        @media (max-width: 56.25rem) {
          footer {
            width: 100%;
          }
        }
      </style>

      <div class="arriba">
        <div class="nombre-ia">
          <p>Jos.ia</p>
        </div>

        <div class="opciones">
          <div class="buscar">
            <svg viewBox="0 0 24 24">
              <path d="M15.5,14L20.5,19L19,20.5L14,15.5V14.71L13.73,14.43C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0,1,1 16,9.5C16,11.11 15.41,12.59 14.43,13.73L14.71,14H15.5M9.5,4.5L8.95,4.53C8.71,5.05 8.34,5.93 8.07,7H10.93C10.66,5.93 10.29,5.05 10.05,4.53C9.87,4.5 9.69,4.5 9.5,4.5M13.83,7C13.24,5.97 12.29,5.17 11.15,4.78C11.39,5.31 11.7,6.08 11.93,7H13.83M5.17,7H7.07C7.3,6.08 7.61,5.31 7.85,4.78C6.71,5.17 5.76,5.97 5.17,7M4.5,9.5C4.5,10 4.58,10.53 4.73,11H6.87L6.75,9.5L6.87,8H4.73C4.58,8.47 4.5,9 4.5,9.5M14.27,11C14.42,10.53 14.5,10 14.42,9.5C14.42,9 14.42,8.47 14.27,8H12.13C12.21,8.5 12.25, 9.5C12.25,9 12.21,8.5 11.13,8H7.87M9.5,14.5C9.68,14.5 9.86,14.5 10.03,14.47C10.28,13.95 10.66,13.07 10.93,12H8.07C8.34,13.07 8.72,13.95 8.97,14.47L9.5,14.5M13.83,12H11.93C11.7,12.92 11.39,13.69 11.15,14.22C12.29,13.83 13.24,13.03 13.83,13.03M5.17,12C5.76,13.03 6.71,13.83 7.85,14.22C7.61,13.69 7.3,12.92 7.07,12H5.17Z" />
            </svg>
          </div>

          <div class="cerrar-barra">
            <svg viewBox="0 0 24 24">
              <path d="M19,13H5V11H19V13Z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="nuevo-chat">
        <p>+ Nuevo chat</p>
      </div>

      <footer>
        <div class="usuario">
          <div class="iniciales">
            <p>JM</p>
          </div>

          <div>
            <div class="nombre-usuario">
              <p>Jose Manuel...</p>
            </div>

            <div class="gratis">
              <p>Gratis</p>
            </div>
          </div>
        </div>
      </footer>
    `
  }

  eventos() {
    const btnCerrarBarra = this.shadowRoot.querySelector('.cerrar-barra')

    btnCerrarBarra.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('menu-cerrado'))
    })
  }
}

customElements.define('menu-component', Menu)