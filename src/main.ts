import "./style.css";
import { NamedEntry, PokeList, PokemonList } from "./components/PokeList.js";

const size = 20;
const baseUrl = "https://pokeapi.co/api/v2/pokemon";
const pokemonList: PokeList = document.getElementById(
  "pokemon-list"
) as PokeList;

async function fetchPokemonList(page: number): Promise<PokeList> {
  const url = `${baseUrl}?limit=${size}&offset=${(page - 1) * size}`;

  try {
    const response = await fetch(url);
    return (await response.json()) as PokeList;
  } catch (error) {
    console.error("Error: " + error);
  }
  return new PokeList();
}

const data: PokeList = await fetchPokemonList(1);
console.dir(data);
pokemonList.data = data;
