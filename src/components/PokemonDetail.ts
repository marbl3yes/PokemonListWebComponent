export type PokemonType = {
  slot: number;
  type: { name: string };
};

export type PokemonStat = {
  base_stat: number;
  stat: { name: string };
};

export type PokemonDetailData = {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: PokemonType[];
  stats: PokemonStat[];
  sprites: {
    front_default: string | null;
    other?: {
      ["official-artwork"]?: {
        front_default: string | null;
      };
    };
  };
};

const typeColors: Record<string, string> = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  electric: "#F8D030",
  grass: "#78C850",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
};

const statLabels: Record<string, string> = {
  hp: "HP",
  attack: "ATK",
  defense: "DEF",
  "special-attack": "SP.ATK",
  "special-defense": "SP.DEF",
  speed: "SPD",
};

export class PokemonDetail extends HTMLElement {
  #pokemon: PokemonDetailData | null = null;
  #loading = false;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  set pokemon(value: PokemonDetailData | null) {
    this.#pokemon = value;
    this.render();
  }

  set loading(value: boolean) {
    this.#loading = value;
    this.render();
  }

  get styles() {
    return /*css*/ `
      <style>
        @keyframes overlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes barGrow {
          from { width: 0; }
        }

        @keyframes spriteFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        :host {
          display: none;
        }

        :host([open]) {
          display: block;
        }

        .overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: overlayIn 0.2s ease-out;
          padding: 1rem;
        }

        .card {
          background: linear-gradient(165deg, #E53935 0%, #C62828 40%, #B71C1C 100%);
          border-radius: 1.25rem;
          padding: 1rem;
          width: 100%;
          max-width: 340px;
          box-shadow:
            0 30px 80px rgba(0, 0, 0, 0.6),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
          border: 2px solid rgba(255, 255, 255, 0.1);
          animation: modalIn 0.3s ease-out;
          position: relative;
        }

        .close_btn {
          position: absolute;
          top: 0.5rem; right: 0.75rem;
          background: none;
          border: none;
          color: rgba(255, 248, 225, 0.6);
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.25rem;
          line-height: 1;
          transition: color 0.15s ease;
          z-index: 1;
        }

        .close_btn:hover {
          color: #FFF8E1;
        }

        .sprite_container {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0.5rem 0;
        }

        .sprite {
          width: 140px;
          height: 140px;
          object-fit: contain;
          filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
          animation: spriteFloat 3s ease-in-out infinite;
          image-rendering: pixelated;
        }

        .info {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 0.75rem;
          padding: 0.75rem;
        }

        .name_row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.4rem;
        }

        .number {
          font-family: "Press Start 2P", monospace;
          font-size: 0.45rem;
          color: rgba(255, 248, 225, 0.5);
        }

        .name {
          font-family: "Press Start 2P", monospace;
          font-size: 0.7rem;
          color: #FFF8E1;
          text-transform: capitalize;
          letter-spacing: 0.05em;
        }

        .types {
          display: flex;
          gap: 0.4rem;
          margin-bottom: 0.5rem;
        }

        .type_badge {
          font-family: "DM Sans", sans-serif;
          font-size: 0.65rem;
          font-weight: 700;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.2em 0.6em;
          border-radius: 0.4em;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .dimensions {
          font-family: "DM Sans", sans-serif;
          font-size: 0.7rem;
          color: rgba(255, 248, 225, 0.7);
          margin-bottom: 0.6rem;
          display: flex;
          gap: 0.4rem;
        }

        .separator {
          color: rgba(255, 248, 225, 0.3);
        }

        .stats {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .stat_row {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .stat_label {
          font-family: "Press Start 2P", monospace;
          font-size: 0.3rem;
          color: rgba(255, 248, 225, 0.6);
          width: 3.2em;
          flex-shrink: 0;
          text-align: right;
        }

        .stat_bar_track {
          flex: 1;
          height: 6px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 3px;
          overflow: hidden;
        }

        .stat_bar_fill {
          height: 100%;
          border-radius: 3px;
          animation: barGrow 0.6s ease-out;
        }

        .stat_value {
          font-family: "DM Sans", sans-serif;
          font-size: 0.65rem;
          font-weight: 700;
          color: #FFF8E1;
          width: 1.8em;
          text-align: right;
          flex-shrink: 0;
        }

        .loading_spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 248, 225, 0.2);
          border-top-color: #FFF8E1;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
      </style>
    `;
  }

  get template() {
    if (this.#loading) {
      return /*html*/ `
        <div class="overlay">
          <div class="loading_spinner"></div>
        </div>
      `;
    }

    if (this.#pokemon == null) {
      return "";
    }

    const p = this.#pokemon;
    const sprite =
      p.sprites.other?.["official-artwork"]?.front_default ??
      p.sprites.front_default ??
      "";
    const types = p.types
      .map((t) => {
        const color = typeColors[t.type.name] ?? "#68A090";
        return `<span class="type_badge" style="background:${color}">${t.type.name}</span>`;
      })
      .join("");
    const stats = p.stats
      .map((s) => {
        const pct = Math.min((s.base_stat / 255) * 100, 100);
        const color = pct > 66 ? "#4CAF50" : pct > 33 ? "#FFC107" : "#F44336";
        return /*html*/ `
          <div class="stat_row">
            <span class="stat_label">${statLabels[s.stat.name] ?? s.stat.name.toUpperCase()}</span>
            <div class="stat_bar_track">
              <div class="stat_bar_fill" style="width:${pct}%;background:${color}"></div>
            </div>
            <span class="stat_value">${s.base_stat}</span>
          </div>
        `;
      })
      .join("");

    return /*html*/ `
      <div class="overlay" id="overlay">
        <div class="card">
          <button class="close_btn" id="close-btn">&times;</button>
          <div class="sprite_container">
            <img class="sprite" src="${sprite}" alt="${p.name}" />
          </div>
          <div class="info">
            <div class="name_row">
              <span class="number">#${String(p.id).padStart(3, "0")}</span>
              <span class="name">${p.name}</span>
            </div>
            <div class="types">${types}</div>
            <div class="dimensions">
              <span>${(p.height / 10).toFixed(1)} m</span>
              <span class="separator">|</span>
              <span>${(p.weight / 10).toFixed(1)} kg</span>
            </div>
            <div class="stats">${stats}</div>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    if (this.shadowRoot == null) {
      return;
    }

    this.shadowRoot.innerHTML = `${this.styles}${this.template}`;

    const closeBtn = this.shadowRoot.querySelector("#close-btn");
    closeBtn?.addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent("detail-close", { bubbles: true, composed: true }),
      );
    });

    const overlay = this.shadowRoot.querySelector("#overlay");
    overlay?.addEventListener("click", (e) => {
      if ((e as MouseEvent).target === overlay) {
        this.dispatchEvent(
          new CustomEvent("detail-close", { bubbles: true, composed: true }),
        );
      }
    });
  }
}

customElements.define("pokemon-detail", PokemonDetail);
