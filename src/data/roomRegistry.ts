/*
  Gorstan – Copyright © 2025 Geoff Webster. All Rights Reserved.
  
  You may play Gorstan for free for personal entertainment only.
  You may NOT copy, redistribute, modify, or sell the game, its code, 
  artwork, storyline, or any other part without written permission.
  
  Gorstan includes third-party libraries and assets:
    - React © Meta Platforms, Inc. – MIT Licence
    - Lucide Icons © Lucide Contributors – ISC Licence
    - Flaticon icons © Flaticon.com – Free Licence with attribution
    - Other packages under their respective licences (see package.json)

  Full licence terms: see EULA.md in the project root.
*/

// Gorstan and characters (c) Geoff Webster 2025
// Renders room descriptions and image logic.

/* Consolidated roomRegistry */
import elfhame from "../rooms/elfhameZone_elfhame";
import faeglade from "../rooms/elfhameZone_faeglade";
import faelake from "../rooms/elfhameZone_faelake";
import faelakenorthshore from "../rooms/elfhameZone_faelakenorthshore";
import faepalacedungeons from "../rooms/elfhameZone_faepalacedungeons";
import faepalacemainhall from "../rooms/elfhameZone_faepalacemainhall";
import datavoid from "../rooms/glitchZone_datavoid";
import carronspire from "../rooms/gorstanZone_carronspire";
import controlnexus from "../rooms/introZone_controlnexus";
import cafeoffice from "../rooms/londonZone_cafeoffice";
import anothermazeroom from "../rooms/mazeZone_anothermazeroom";
import aevirawarehouse from "../rooms/newyorkZone_aevirawarehouse";
import ancientslibrary from "../rooms/offgorstanZone_ancientslibrary";
import ascendantStanton from "../rooms/stantonZone_ascendantStanton";

import type { Room } from "../types/Room";

export const roomRegistry: Record<string, Room> = {
  [elfhame.id]: elfhame,
  [faeglade.id]: faeglade,
  [faelake.id]: faelake,
  [faelakenorthshore.id]: faelakenorthshore,
  [faepalacedungeons.id]: faepalacedungeons,
  [faepalacemainhall.id]: faepalacemainhall,
  [datavoid.id]: datavoid,
  [carronspire.id]: carronspire,
  [controlnexus.id]: controlnexus,
  [cafeoffice.id]: cafeoffice,
  [anothermazeroom.id]: anothermazeroom,
  [aevirawarehouse.id]: aevirawarehouse,
  [ancientslibrary.id]: ancientslibrary,
  [ascendantStanton.id]: ascendantStanton,
};

export default roomRegistry;
