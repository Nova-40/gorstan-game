export function formatInteractable(item: string | { id: string; name?: string }): string {
  if (typeof item === 'string') {
    return `[${item}]`;
  }
  return `[${item.name || item.id}]`;
}

export function formatExits(exits: string[]): string {
  return `Exits: ${exits.join(', ')}`;
}
