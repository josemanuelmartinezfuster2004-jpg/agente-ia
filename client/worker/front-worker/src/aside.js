class Aside extends HTMLElement {
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
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 0;
          overflow: hidden;
        }

        .menu,
        .registros {
          display: block;
        }

        .registros {
          min-height: 0;
          overflow-y: auto;
        }

        .mostrar-registros {
          background-color: hsl(225, 75%, 18%);
          border: 1px solid hsl(215, 100%, 80%);
          color: hsl(48, 100%, 98%);
          cursor: pointer;
          display: none;
          padding: 0.7rem 1rem;
        }

        .mostrar-registros:hover {
          background-color: hsl(215, 85%, 28%);
        }
      </style>

      <div class="menu">
        <slot name="menu"></slot>
      </div>

      <div class="registros">
        <slot name="registros"></slot>
      </div>

      <div class="mostrar-registros">
        <p>Mostrar registros</p>
      </div>
    `
  }

  eventos() {
    const btnMostrarRegistros = this.shadow.querySelector('.mostrar-registros')

    document.addEventListener('menu-cerrado', () => {
      this.classList.add('ocultar-barra')
    })

    document.addEventListener('menu-abierto', () => {
      this.classList.remove('ocultar-barra')
    })

    document.addEventListener('registros-cerrados', () => {
      btnMostrarRegistros.style.display = 'block'
    })

    btnMostrarRegistros.addEventListener('click', () => {
      const registros = this.querySelector('registros-component')
      registros.classList.remove('ocultar-registros')
      btnMostrarRegistros.style.display = 'none'
    })
  }
}

customElements.define('aside-component', Aside)