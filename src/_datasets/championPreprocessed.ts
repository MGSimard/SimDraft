import championDataset from "@/_datasets/champion.json";

// Preprocess champion dataset into only necessary data
export const championsMap = Object.values(championDataset.data)
  .map((champInfo) => ({
    key: champInfo.key,
    name: champInfo.name,
  }))
  .toSorted((a, b) => a.name.localeCompare(b.name));
