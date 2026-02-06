// Pure utility functions - no game-specific knowledge

let _uid = 0;

export function uid() {
  return 'item_' + (++_uid) + '_' + Date.now();
}

export function pickWeighted(items) {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

// Seeded RNG for deterministic daily results
export function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function seededPickWeighted(items, rng) {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let roll = rng() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}
