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
          background-size: cover;
          min-height: 100vh;
          overflow: hidden;
          position: relative;
        }

        .boton-menu-abrir {
          align-items: center;
          background-color: hsl(197, 95%, 59%);
          border-radius: 0.5rem;
          color: hsl(0, 0%, 100%);
          cursor: pointer;
          display: none;
          font-size: 1.2rem;
          height: 100%;
          justify-content: center;
          padding: 0.5rem;
          position: absolute;
          width: fit-content;
        }

        .texto-ia {
          align-items: center;
          background-color: hsl(0 0% 100% / 0.4);
          display: flex;
          justify-content: center;
          margin-top: 15rem;
          padding: 0 2rem;
          text-align: center;
        }

        .texto-ia p {
          color: hsl(0, 0%, 13%);
          font-size: 2rem;
        }

        .buscador {
          width: 100%;
        }

        form {
          align-items: center;
          display: flex;
          gap: 0.7rem;
          justify-content: center;
          padding: 2rem 15%;
        }

        form input {
          background-color: hsl(0, 0%, 100%);
          border: 0.13rem solid hsl(0, 0%, 73%);
          border-radius: 0.7rem;
          font-size: 1rem;
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

        @media (max-width: 87.5rem) {
          form {
            padding: 2rem 8%;
          }
        }

        @media (max-width: 56.25rem) {
          .texto-ia {
            margin-top: 8rem;
          }

          form {
            padding: 2rem;
          }
        }

        @media (max-width: 40.63rem) {
          .texto-ia {
            margin-top: 5rem;
            padding: 0 1rem;
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
        }
      </style>

      <div class="boton-menu-abrir">
        <p>&gt;</p>
      </div>

      <div class="texto-ia">
        <p>¿Cómo puedo ayudarte?</p>
      </div>

      <div class="buscador">
        <form>
          <label for="name"></label>
          <input type="text" id="name" name="prompt" placeholder="Escribe lo que quieras decir" required>
          <input class="send-button" type="submit" value="Enviar">
        </form>
      </div>
    `
  }

  eventos() {

    this.shadow.querySelector('.buscador').addEventListener('click', async (event) => {
      // inicio codigo 30-10-26
      event.preventDefault()

      if (event.target.closest('.boton-enviar')) {
        const form = this.shadow.querySelector('form')
        const formData = new FormData(form)
        const formDataJson = Object.fromEntries(formData.entries())

        try {
          const result = await fetch(`${import.meta.env.VITE_API_URL}/api/worker/chats`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formDataJson)
          })

          if (result.ok) {
            form.reset()
            const data = await result.json()
            console.log(data.response)
          }
        } catch (error) {
          console.log(error)
        }

      }
    })
  }
}

customElements.define('parte-ia', ParteIa)