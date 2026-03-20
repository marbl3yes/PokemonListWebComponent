import { PokeList, PokemonList } from "./components/PokeList.ts";
import "./style.css";

const size = 20;
const baseUrl = "https://pokeapi.co/api/v2/pokemon";
const pokemonList = document.getElementById("pokemon-list") as PokeList | null;

async function fetchPokemonList<TResponse>(page: number): Promise<TResponse> {
  const response = await fetch(
    `${baseUrl}?limit=${size}&offset=${(page - 1) * size}`,
  );
  return await response.json();
}

async function fetchPokemonPage(page: number): Promise<PokemonList> {
  try {
    const newPage = await fetchPokemonList<PokemonList>(page);
    return newPage;
  } catch (error) {
    console.error(`Error: ${error}`);
    throw error;
  }
}

const data: PokemonList = await fetchPokemonPage(1);

if (pokemonList != null) {
  pokemonList.data = data;

  pokemonList.addEventListener("page-change", async (event: Event) => {
    const customEvent = event as CustomEvent<{ page: number }>;
    const newPage = customEvent.detail.page;
    const newData = await fetchPokemonPage(newPage);
    pokemonList.page = newPage;
    pokemonList.data = newData;
  });
}
