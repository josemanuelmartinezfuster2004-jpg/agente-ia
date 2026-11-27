
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
      </style>

      <div class="menu">
        <slot name="menu"></slot>
      </div>

      <div class="registros">
        <slot name="registros"></slot>
      </div>
    `
  }

  eventos() {
    document.addEventListener('menu-cerrado', () => {
      this.classList.add('ocultar-barra')
    })

    document.addEventListener('menu-abierto', () => {
      this.classList.remove('ocultar-barra')
    })
  }
}

customElements.define('aside-component', Aside)
