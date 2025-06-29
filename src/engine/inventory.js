let inventory = [];

export function addItem(item) {
  if (!inventory.includes(item)) inventory.push(item);
}

export function hasItem(item) {
  return inventory.includes(item);
}

export function getInventory() {
  return [...inventory];
}

export function removeItem(item) {
  inventory = inventory.filter(i => i !== item);
}

export function clearInventory() {
  inventory = [];
}