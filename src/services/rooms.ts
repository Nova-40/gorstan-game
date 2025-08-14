import ancientsroom from "../rooms/offgorstanZone_ancientsroom";
import ancientvault from "../rooms/offgorstanZone_ancientvault";
import arbitercore from "../rooms/offgorstanZone_arbitercore";
import echochamber from "../rooms/offgorstanZone_echochamber";
import shatteredrealm from "../rooms/offmultiverseZone_shatteredrealm";
import ascendantStanton from "../rooms/stantonZone_ascendantStanton";
import glitchStanton from "../rooms/stantonZone_glitchStanton";
import peacefulStanton from "../rooms/stantonZone_peacefulStanton";
import silentStanton from "../rooms/stantonZone_silentStanton";
import stantonharcourt from "../rooms/stantonZone_stantonharcourt";
import villagegreen from "../rooms/stantonZone_villagegreen";

import type { Room } from "../types/Room";

export const roomRegistry: Record<string, Room> = {
  [ancientsroom.id]: ancientsroom,
  [ancientvault.id]: ancientvault,
  [arbitercore.id]: arbitercore,
  [echochamber.id]: echochamber,
  [shatteredrealm.id]: shatteredrealm,
  [ascendantStanton.id]: ascendantStanton,
  [glitchStanton.id]: glitchStanton,
  [peacefulStanton.id]: peacefulStanton,
  [silentStanton.id]: silentStanton,
  [stantonharcourt.id]: stantonharcourt,
  [villagegreen.id]: villagegreen,
  // ...other rooms...
};