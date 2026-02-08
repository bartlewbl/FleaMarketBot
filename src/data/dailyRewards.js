// ============================================================
// 30-Day Daily Login Reward Schedule
//
// Each day has an array of reward entries built with helpers.
// Reward types:
//   gold(amount)                       - flat gold
//   energy(amount)                     - energy restore
//   item(type, rarity, minLevel?)      - gear/accessory scaled to player level
//   potion(rarity?)                    - healing potion scaled to player level
//
// The `milestone` flag highlights a day in the calendar UI.
// Labels are auto-generated from the rewards array.
// ============================================================

// --- Reward builder helpers ---

function gold(amount) {
  return { kind: 'gold', amount };
}

function energy(amount) {
  return { kind: 'energy', amount };
}

function item(type, rarity, minLevel = 1) {
  return { kind: 'item', type, rarity, minLevel };
}

function potion(rarity = 'Uncommon') {
  return { kind: 'potion', rarity };
}

// --- Auto-label generation ---

const LABEL_MAP = {
  gold: (r) => `${r.amount}g`,
  energy: (r) => `${r.amount} Energy`,
  item: (r) => `${r.rarity} ${r.type}`,
  potion: (r) => `${r.rarity} Potion`,
};

function buildLabel(rewards) {
  return rewards.map(r => LABEL_MAP[r.kind](r)).join(' + ');
}

// --- Day definitions ---

function day(num, rewards, milestone = false) {
  return { day: num, rewards, milestone, label: buildLabel(rewards) };
}

export const DAILY_REWARDS = [
  // Week 1 - Starter rewards, introduce item drops gradually
  day(1,  [gold(20), potion()]),
  day(2,  [item('sword', 'Uncommon')]),
  day(3,  [gold(30), energy(20)]),
  day(4,  [item('helmet', 'Uncommon')]),
  day(5,  [potion('Rare'), gold(25)]),
  day(6,  [item('boots', 'Uncommon'), gold(20)]),
  day(7,  [item('armor', 'Rare'), gold(50)], true),

  // Week 2 - Ramp up quality
  day(8,  [gold(40), potion()]),
  day(9,  [item('ring', 'Uncommon'), energy(30)]),
  day(10, [item('shield', 'Rare')]),
  day(11, [potion('Rare'), gold(40)]),
  day(12, [item('sword', 'Rare')]),
  day(13, [item('boots', 'Rare'), energy(40)]),
  day(14, [item('armor', 'Rare'), item('ring', 'Rare'), gold(75)], true),

  // Week 3 - Epic items start appearing
  day(15, [gold(60), potion('Rare')]),
  day(16, [item('helmet', 'Rare'), energy(30)]),
  day(17, [item('shield', 'Rare'), gold(50)]),
  day(18, [item('sword', 'Epic')]),
  day(19, [potion('Epic'), gold(60)]),
  day(20, [item('ring', 'Epic'), energy(50)]),
  day(21, [item('armor', 'Epic'), gold(100)], true),

  // Week 4 - Premium rewards, legendary on day 30
  day(22, [item('boots', 'Epic'), potion('Rare')]),
  day(23, [item('helmet', 'Epic'), gold(75)]),
  day(24, [item('shield', 'Epic'), energy(50)]),
  day(25, [gold(100), potion('Epic'), energy(40)]),
  day(26, [item('sword', 'Epic'), item('ring', 'Rare')]),
  day(27, [item('armor', 'Epic'), gold(100)]),
  day(28, [item('shield', 'Epic'), item('boots', 'Epic'), gold(100)], true),
  day(29, [item('ring', 'Epic'), gold(150), energy(80)]),
  day(30, [item('sword', 'Legendary'), item('armor', 'Legendary'), gold(200), energy(100)], true),
];

// Re-export helpers for external use (e.g. server-side reward definitions)
export { gold, energy, item, potion };
