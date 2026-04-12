import championDataset from "@/datasets/champion.json";
import playratesData from "@/datasets/playrates.json";

export interface Champion {
  key: string;
  name: string;
  roles: Array<string>;
  normalizedName: string;
}

function normalizeChampionSearchTerm(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['\s]/g, "");
}

const championRolesByKey = new Map<string, Array<string>>();

for (const [roleName, champions] of Object.entries(playratesData)) {
  for (const championKey of Object.keys(champions)) {
    const existingRoles = championRolesByKey.get(championKey);
    if (existingRoles) {
      existingRoles.push(roleName);
    } else {
      championRolesByKey.set(championKey, [roleName]);
    }
  }
}

export const championsMap: Array<Champion> = Object.values(championDataset.data)
  .map((champInfo) => {
    const champion: Champion = {
      key: champInfo.key,
      name: champInfo.name,
      roles: championRolesByKey.get(champInfo.key) ?? [],
      normalizedName: normalizeChampionSearchTerm(champInfo.name),
    };
    return champion;
  })
  .toSorted((a, b) => a.name.localeCompare(b.name));

export const championByKey = new Map<string, Champion>(championsMap.map((champ) => [champ.key, champ]));

export const championByName = new Map<string, Champion>(championsMap.map((champ) => [champ.name.toLowerCase(), champ]));

export const CHAMPION_COUNT = championsMap.length;

export function searchChampions(query: string): Array<Champion> {
  const normalizedSearch = normalizeChampionSearchTerm(query);
  if (!normalizedSearch) return championsMap;

  return championsMap.filter((champion) => champion.normalizedName.includes(normalizedSearch));
}
