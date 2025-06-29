let godmode = false;

export function activateGodmode() {
  godmode = true;
}

export function isGodmode() {
  return godmode;
}

export function godCommand(cmd) {
  if (!godmode) return 'Access denied.';
  return `Godmode executed: ${cmd}`;
}