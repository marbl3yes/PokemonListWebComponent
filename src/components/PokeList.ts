import type { PokemonDetailData } from "./PokemonDetail.ts";
import "./PokemonDetail.ts";

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

  connectedCallback() {
    this.render();
  }

  set data(value: PokemonList) {
    this.#data = value;
    this.render();
  }

  set page(value: number) {
    this.#page = value;
    this.render();
  }

  get #entryOffset(): number {
    return (this.#page - 1) * 20;
  }

  async #selectPokemon(name: string) {
    const detail = this.shadowRoot?.querySelector(
      "pokemon-detail",
    ) as import("./PokemonDetail.ts").PokemonDetail | null;
    if (detail == null) {
      return;
    }

    detail.loading = true;
    detail.setAttribute("open", "");

    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${name}`,
      );
      const pokemon: PokemonDetailData = await response.json();
      detail.pokemon = pokemon;
    } catch (error) {
      console.error(`Error fetching ${name}: ${error}`);
      detail.removeAttribute("open");
    }

    detail.loading = false;
  }

  #closeDetail() {
    const detail = this.shadowRoot?.querySelector(
      "pokemon-detail",
    ) as import("./PokemonDetail.ts").PokemonDetail | null;
    if (detail != null) {
      detail.removeAttribute("open");
      detail.pokemon = null;
    }
  }

  get styles() {
    return /*css*/ `
      <style>
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes ledGlow {
          0%, 100% { box-shadow: 0 0 4px 1px rgba(76, 175, 80, 0.6); }
          50% { box-shadow: 0 0 8px 3px rgba(76, 175, 80, 0.9); }
        }

        :host {
          display: block;
          width: 100%;
          max-width: 380px;
        }

        .pokedex_shell {
          background: linear-gradient(165deg, #E53935 0%, #C62828 40%, #B71C1C 100%);
          border-radius: 1.5rem;
          padding: 1.25rem;
          box-shadow:
            0 25px 60px rgba(0, 0, 0, 0.5),
            0 8px 20px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.15),
            inset 0 -2px 0 rgba(0, 0, 0, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.08);
          position: relative;
        }

        .pokedex_shell::before {
          content: "";
          position: absolute;
          top: 0; left: 1.5rem; right: 1.5rem;
          height: 3px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          border-radius: 0 0 2px 2px;
        }

        .pokedex_header {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0 0.25rem 0.75rem;
        }

        .led {
          width: 10px; height: 10px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #81C784, #2E7D32);
          border: 1.5px solid rgba(0, 0, 0, 0.3);
          animation: ledGlow 2.5s ease-in-out infinite;
          flex-shrink: 0;
        }

        .title {
          font-family: "Press Start 2P", monospace;
          font-size: 0.7rem;
          color: #FFF8E1;
          letter-spacing: 0.15em;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
          flex: 1;
        }

        .count_badge {
          font-family: "Press Start 2P", monospace;
          font-size: 0.45rem;
          color: #1A1A2E;
          background: linear-gradient(135deg, #FFF8E1, #FFE082);
          padding: 0.3em 0.6em;
          border-radius: 0.5em;
          border: 1px solid rgba(0, 0, 0, 0.15);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          white-space: nowrap;
        }

        .screen_frame {
          background: #1A1A2E;
          border-radius: 0.75rem;
          padding: 0.5rem;
          box-shadow:
            inset 0 3px 8px rgba(0, 0, 0, 0.6),
            inset 0 1px 2px rgba(0, 0, 0, 0.4);
          margin-bottom: 0.75rem;
        }

        .screen {
          background: linear-gradient(180deg, #9BBC0F 0%, #8BAC0F 50%, #306230 100%);
          border-radius: 0.5rem;
          padding: 0.75rem;
          min-height: 320px;
          max-height: 420px;
          overflow-y: auto;
          position: relative;
          box-shadow:
            inset 0 0 20px rgba(15, 56, 15, 0.5),
            inset 0 0 4px rgba(0, 0, 0, 0.3);
        }

        .screen::after {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent, transparent 2px,
            rgba(0, 0, 0, 0.06) 2px,
            rgba(0, 0, 0, 0.06) 4px
          );
          pointer-events: none;
          border-radius: 0.5rem;
        }

        .screen::-webkit-scrollbar { width: 4px; }
        .screen::-webkit-scrollbar-track { background: transparent; }
        .screen::-webkit-scrollbar-thumb {
          background: rgba(15, 56, 15, 0.5);
          border-radius: 2px;
        }

        .entry_list {
          list-style: none;
          margin: 0; padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .entry_item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.35rem 0.5rem;
          border-radius: 0.25rem;
          opacity: 0;
          animation: fadeSlideUp 0.3s ease-out forwards;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .entry_item:hover {
          background-color: rgba(15, 56, 15, 0.25);
        }

        .entry_number {
          font-family: "Press Start 2P", monospace;
          font-size: 0.4rem;
          color: #0F380F;
          background: rgba(155, 188, 15, 0.7);
          padding: 0.25em 0.4em;
          border-radius: 0.2em;
          min-width: 2.6em;
          text-align: center;
          flex-shrink: 0;
          border: 1px solid rgba(15, 56, 15, 0.2);
        }

        .entry_name {
          font-family: "DM Sans", sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          color: #0F380F;
          text-transform: capitalize;
          letter-spacing: 0.02em;
        }

        .page_indicator {
          text-align: center;
          padding: 0.5rem 0 0.25rem;
        }

        .page_indicator span {
          font-family: "Press Start 2P", monospace;
          font-size: 0.4rem;
          color: rgba(255, 248, 225, 0.5);
          letter-spacing: 0.1em;
        }

        .dpad_container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.25rem 0 0;
        }

        .dpad_button {
          font-family: "Press Start 2P", monospace;
          font-size: 0.45rem;
          color: #FFF8E1;
          background: linear-gradient(180deg, #424242 0%, #212121 100%);
          border: 1.5px solid rgba(255, 255, 255, 0.08);
          border-radius: 0.5rem;
          padding: 0.7em 1.4em;
          cursor: pointer;
          transition: transform 0.1s ease, box-shadow 0.1s ease;
          box-shadow: 0 3px 0 #111, 0 4px 8px rgba(0, 0, 0, 0.3);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          user-select: none;
        }

        .dpad_button:hover:not(:disabled) {
          background: linear-gradient(180deg, #4A4A4A 0%, #2A2A2A 100%);
        }

        .dpad_button:active:not(:disabled) {
          transform: translateY(2px);
          box-shadow: 0 1px 0 #111, 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .dpad_button:disabled {
          opacity: 0.3;
          cursor: not-allowed;
          box-shadow: 0 2px 0 #111, 0 3px 6px rgba(0, 0, 0, 0.2);
        }
      </style>
    `;
  }

  get template() {
    const entriesHtml = this.#data.results
      .map((item, index) => {
        const number = String(this.#entryOffset + index + 1).padStart(3, "0");
        const delay = index * 0.04;
        return /*html*/ `
          <li class="entry_item" data-name="${item.name}" style="animation-delay: ${delay}s">
            <span class="entry_number">#${number}</span>
            <span class="entry_name">${item.name}</span>
          </li>
        `;
      })
      .join("");

    return /*html*/ `
      <div class="pokedex_shell">
        <div class="pokedex_header">
          <div class="led"></div>
          <div class="title">POKEDEX</div>
          <div class="count_badge">${this.#data.count} POKEMON</div>
        </div>
        <div class="screen_frame">
          <div class="screen">
            <ul class="entry_list">
              ${entriesHtml}
            </ul>
          </div>
        </div>
        <div class="page_indicator">
          <span>PAGE ${String(this.#page).padStart(2, "0")}</span>
        </div>
        <div class="dpad_container">
          <button
            class="dpad_button button_previous"
            ${!this.#data.previous ? "disabled" : ""}
          >PREV</button>
          <button
            class="dpad_button button_next"
            ${!this.#data.next ? "disabled" : ""}
          >NEXT</button>
        </div>
      </div>
      <pokemon-detail></pokemon-detail>
    `;
  }

  render() {
    if (this.shadowRoot == null) {
      return;
    }

    this.shadowRoot.innerHTML = `${this.styles}${this.template}`;

    // Navigation buttons
    const prevButton = this.shadowRoot.querySelector(".button_previous");
    const nextButton = this.shadowRoot.querySelector(".button_next");

    prevButton?.addEventListener("click", () => {
      if (this.#page > 1) {
        this.dispatchEvent(
          new CustomEvent("page-change", {
            detail: { page: this.#page - 1 },
            bubbles: true,
            composed: true,
          }),
        );
      }
    });

    nextButton?.addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent("page-change", {
          detail: { page: this.#page + 1 },
          bubbles: true,
          composed: true,
        }),
      );
    });

    // List item click handlers
    const items = this.shadowRoot.querySelectorAll(".entry_item");
    items.forEach((item) => {
      item.addEventListener("click", () => {
        const name = item.getAttribute("data-name");
        if (name != null) {
          this.#selectPokemon(name);
        }
      });
    });

    // Detail close handler
    this.shadowRoot.addEventListener("detail-close", () => {
      this.#closeDetail();
    });
  }
}

customElements.define("poke-list", PokeList);
