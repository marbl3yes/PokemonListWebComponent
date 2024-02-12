export type NamedEntry = {
  name: string;
  url: string;
};

export type PokemonList = {
  count: number;
  next?: string;
  previous?: string;
  results: NamedEntry[];
};

export class PokeList extends HTMLElement {
  #page = 1;
  #data: PokemonList = {
    count: 0,
    next: "",
    previous: "",
    results: [],
  };

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
  }

  set data(value: PokemonList) {
    this.#data = value;
    this.render();
  }

  get styles() {
    return /*css*/ `
        <style>
            .card {
                display: flex;
                flex-flow: column;
                height: calc(100vh - 12em);
                width: 25vw;
                background-color: #eee;
                border: 1px solid lightblue;
                border-radius: 1em;
                padding: 2em;
                box-shadow: 5px 5px 15px 10px #ddd;
            }

            .total {
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: Verdana, Geneva, Tahoma, sans-serif;
                font-size: 2em;
                font-weight: bold;
            }

            .page {
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: Verdana, Geneva, Tahoma, sans-serif;
                font-size: 1em;
                font-weight: bold;
            }

            .button_container {
                display: flex;
                align-items: center;
                flex: 0 1 auto;
                flex-direction: column;
                justify-content: center;
                padding: 1em;
            }

            .navigation_button {
                padding: 1em 1.5em;
                margin: 0 0.5em;
                border: none;
                background-color: lightblue;
            }

            .navigation_button:disabled {
                background-color: #ddd;
            }

            .button_previous {
                border-radius: 1.5em 0 0 1.5em;
            }

            .button_next {
                border-radius: 0 1.5em 1.5em 0;
            }

            .list_container {
                display: flex;
                align-items: center;
                flex: 1 1;
                flex-direction: column;
                padding: 1em;
                overflow: auto;
                border: 1px solid lightblue;
                border-radius: 1em 0 0 1em;
            }

            .list_item {
                padding: 0.3em;
                text-transform: capitalize;
            }
        </style>
      `;
  }

  get template() {
    return /*html*/ `
        <div class="card">
            <div class="total">Total Pokemons: ${this.#data.count}</div>
            <div class="page">Page: ${this.#page}</div>
            <div class="button_container">
                <div>
                    <button
                        class="navigation_button button_previous"
                        onclick=""
                        disabled=${!this.#data.previous ?? false}>
                        Anterior
                    </button>
                    <button
                        class="navigation_button button_next"
                        onclick=""
                        disabled=${!this.#data.next ?? false}>
                        Seguinte
                    </button>
                </div>
            </div>
            <div class="list_container">
                ${this.#data.results.map((item) => {
                  return /*html*/ `
                        <div
                            class="list_item">
                            <a>${item.name}</a>
                        </div>
                    `;
                })}
            </div>
        </div>
      `;
  }

  render() {
    if (this.shadowRoot != null) {
      this.shadowRoot.innerHTML = `${this.styles}${this.template}`;
    }
  }
}

customElements.define("poke-list", PokeList);
