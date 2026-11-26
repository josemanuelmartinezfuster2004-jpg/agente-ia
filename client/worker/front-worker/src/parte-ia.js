
class ParteIa extends HTMLElement {
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
          background-image: url('../imagenes/ia.jpg');
          background-position: center;
          background-size: cover;
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 0;
          overflow: hidden;
          position: relative;
        }

        .boton-menu-abrir {
          align-items: center;
          background-color: hsl(225, 85%, 22%);
          border: 1px solid hsl(215, 100%, 80%);
          border-radius: 0.5rem;
          box-shadow: 0 0 0.7rem hsl(215, 100%, 65% / 0.4);
          color: hsl(48, 100%, 98%);
          cursor: pointer;
          display: none;
          font-size: 1.5rem;
          height: 2.8rem;
          justify-content: center;
          left: 1rem;
          position: absolute;
          top: 1rem;
          width: 2.8rem;
          z-index: 10;
        }

        .boton-menu-abrir.visible {
          display: flex;
        }

        .boton-menu-abrir:hover {
          background-color: hsl(215, 85%, 32%);
          box-shadow: 0 0 1rem hsl(215, 100%, 65% / 0.7);
        }

        .texto-ia {
          align-items: center;
          background-color: hsl(0 0% 100% / 0.4);
          display: flex;
          flex: 0 0 auto;
          justify-content: center;
          padding: 1.5rem 2rem;
          text-align: center;
        }

        .texto-ia p {
          color: hsl(0, 0%, 13%);
          font-size: 2rem;
        }

        .mensajes {
          display: flex;
          flex: 1;
          flex-direction: column;
          gap: 1rem;
          min-height: 0;
          overflow-x: hidden;
          overflow-y: auto;
          overscroll-behavior: contain;
          padding: 1rem 15%;
        }

        .mensaje {
          border-radius: 0.8rem;
          max-width: 80%;
          padding: 1rem;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .mensaje p {
          margin: 0;
          line-height: 1.5;
        }

        .mensaje-usuario {
          align-self: flex-end;
          background-color: hsl(197, 95%, 59%);
          color: hsl(0, 0%, 100%);
        }

        .mensaje-ia {
          align-self: flex-start;
          background-color: hsl(0, 0%, 100%);
          color: hsl(0, 0%, 13%);
        }

        .mensaje-error {
          align-self: flex-start;
          background-color: hsl(0, 75%, 95%);
          color: hsl(0, 65%, 35%);
        }

        .buscador {
          flex: 0 0 auto;
          width: 100%;
        }

        form {
          align-items: center;
          display: flex;
          gap: 0.7rem;
          justify-content: center;
          margin: 0;
          padding: 1rem 15%;
        }

        form input {
          background-color: hsl(0, 0%, 100%);
          border: 0.13rem solid hsl(0, 0%, 73%);
          border-radius: 0.7rem;
          font-size: 1rem;
          min-width: 0;
          padding: 1rem;
          width: 100%;
        }

        form input + input {
          background-color: hsl(197, 95%, 59%);
          border: none;
          color: hsl(0, 0%, 100%);
          cursor: pointer;
          width: auto;
        }

        form input:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        @media (max-width: 87.5rem) {
          form {
            padding: 1rem 8%;
          }

          .mensajes {
            padding: 1rem 8%;
          }
        }

        @media (max-width: 56.25rem) {
          .texto-ia {
            padding: 1.5rem;
          }

          form {
            padding: 1rem 2rem;
          }
        }

        @media (max-width: 40.63rem) {
          .texto-ia {
            padding: 1rem;
          }

          .texto-ia p {
            font-size: 1.5rem;
          }

          form {
            flex-direction: column;
            padding: 1rem;
          }

          form input,
          form input + input {
            width: 100%;
          }

          .mensajes {
            padding: 1rem;
          }

          .mensaje {
            max-width: 90%;
          }
        }
      </style>

      <button class="boton-menu-abrir" type="button" aria-label="Abrir menú">
        &gt;
      </button>

      <div class="texto-ia">
        <p>¿Cómo puedo ayudarte?</p>
      </div>

      <div class="mensajes" aria-live="polite"></div>

      <div class="buscador">
        <form>
          <label for="name"></label>
          <input type="text" id="name" name="prompt" placeholder="Escribe lo que quieras decir" required>
          <input class="send-button" type="submit" value="Enviar">
        </form>
      </div>
    `
  }

  agregarMensaje(texto, tipo) {
    const mensajes = this.shadow.querySelector('.mensajes')
    const mensaje = document.createElement('div')
    const contenido = document.createElement('p')

    mensaje.classList.add('mensaje', `mensaje-${tipo}`)
    contenido.textContent = texto

    mensaje.appendChild(contenido)
    mensajes.appendChild(mensaje)

    mensajes.scrollTop = mensajes.scrollHeight

    return mensaje
  }

  eventos() {
    const form = this.shadow.querySelector('form')
    const input = this.shadow.querySelector('#name')
    const boton = this.shadow.querySelector('.send-button')
    const botonMenuAbrir = this.shadow.querySelector('.boton-menu-abrir')

    document.addEventListener('menu-cerrado', () => {
      botonMenuAbrir.classList.add('visible')
    })

    document.addEventListener('menu-abierto', () => {
      botonMenuAbrir.classList.remove('visible')
    })

    botonMenuAbrir.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('menu-abierto'))
    })

    form.addEventListener('submit', async (event) => {
      event.preventDefault()

      const userQuery = input.value.trim()

      if (!userQuery || boton.disabled) return

      this.agregarMensaje(userQuery, 'usuario')
      form.reset()

      boton.disabled = true
      boton.value = 'Enviando...'

      const cargando = this.agregarMensaje('Pensando...', 'ia')

      try {
        const result = await fetch('/api/worker/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userQuery })
        })

        const data = await result.json()

        if (!result.ok) {
          throw new Error(data.message || 'Error al obtener la respuesta')
        }

        cargando.remove()

        this.agregarMensaje(
          data.answer || 'No se ha recibido ninguna respuesta.',
          'ia'
        )

      } catch (error) {
        cargando.remove()

        this.agregarMensaje(
          error.message || 'No se pudo conectar con el servidor.',
          'error'
        )

        console.error(error)

      } finally {
        boton.disabled = false
        boton.value = 'Enviar'
        input.focus()
      }
    })
  }
}

customElements.define('parte-ia', ParteIa)
