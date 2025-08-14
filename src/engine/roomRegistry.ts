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

// Goimport { Room } from '../types/RoomTypes';stan and characters (c) Geoff Webster 2025
// Renders room descriptions and image logic.

import elfhame from "../rooms/elfhameZone_elfhame";
import faeglade from "../rooms/elfhameZone_faeglade";
import faelake from "../rooms/elfhameZone_faelake";
import faelakenorthshore from "../rooms/elfhameZone_faelakenorthshore";
import faepalacedungeons from "../rooms/elfhameZone_faepalacedungeons";
import faepalacemainhall from "../rooms/elfhameZone_faepalacemainhall";
import faepalacerhianonsroom from "../rooms/elfhameZone_faepalacerhianonsroom";
import datavoid from "../rooms/glitchZone_datavoid";
import failure from "../rooms/glitchZone_failure";
import glitchinguniverse from "../rooms/glitchZone_glitchinguniverse";
import issuesdetected from "../rooms/glitchZone_issuesdetected";
import moreissues from "../rooms/glitchZone_moreissues";
import carronspire from "../rooms/gorstanZone_carronspire";
import gorstanhub from "../rooms/gorstanZone_gorstanhub";
import gorstanvillage from "../rooms/gorstanZone_gorstanvillage";
import torridon from "../rooms/gorstanZone_torridon";
import torridoninn from "../rooms/gorstanZone_torridoninn";
import torridoninthepast from "../rooms/gorstanZone_torridoninthepast";
import controlnexus from "../rooms/introZone_controlnexus";
import controlroom from "../rooms/introZone_controlroom";
import crossing from "../rooms/introZone_crossing";
import hiddenlab from "../rooms/introZone_hiddenlab";
import introreset from "../rooms/introZone_introreset";
import introstart from "../rooms/introZone_introstart";
import hiddenlibrary from "../rooms/latticeZone_hiddenlibrary";
import lattice from "../rooms/latticeZone_lattice";
import latticehub from "../rooms/latticeZone_latticehub";
import latticelibrary from "../rooms/latticeZone_latticelibrary";
import latticeobservationentrance from "../rooms/latticeZone_latticeobservationentrance";
import latticeobservatory from "../rooms/latticeZone_latticeobservatory";
import latticespire from "../rooms/latticeZone_latticespire";
import libraryofnine from "../rooms/latticeZone_libraryofnine";
import cafeoffice from "../rooms/londonZone_cafeoffice";
import dalesapartment from "../rooms/londonZone_dalesapartment";
import findlaters from "../rooms/londonZone_findlaters";
import findlaterscornercoffeeshop from "../rooms/londonZone_findlaterscornercoffeeshop";
import londonhub from "../rooms/londonZone_londonhub";
import stkatherinesdock from "../rooms/londonZone_stkatherinesdock";
import trentpark from "../rooms/londonZone_trentpark";
import anothermazeroom from "../rooms/mazeZone_anothermazeroom";
import forgottenchamber from "../rooms/mazeZone_forgottenchamber";
import labyrinthbend from "../rooms/mazeZone_labyrinthbend";
import mazeecho from "../rooms/mazeZone_mazeecho";
import mazehub from "../rooms/mazeZone_mazehub";
import mazeroom from "../rooms/mazeZone_mazeroom";
import mirrorhall from "../rooms/mazeZone_mirrorhall";
import misleadchamber from "../rooms/mazeZone_misleadchamber";
import pollysbay from "../rooms/mazeZone_pollysbay";
import secretmazeentry from "../rooms/mazeZone_secretmazeentry";
import secrettunnel from "../rooms/mazeZone_secrettunnel";
import stillamazeroom from "../rooms/mazeZone_stillamazeroom";
import storagechamber from "../rooms/mazeZone_storagechamber";
import windingpath from "../rooms/mazeZone_windingpath";
import liminalhub from "../rooms/multiZone_liminalhub";
import aevirawarehouse from "../rooms/newyorkZone_aevirawarehouse";
import burgerjoint from "../rooms/newyorkZone_burgerjoint";
import centralpark from "../rooms/newyorkZone_centralpark";
import greasystoreroom from "../rooms/newyorkZone_greasystoreroom";
import manhattanhub from "../rooms/newyorkZone_manhattanhub";
import ancientslibrary from "../rooms/offgorstanZone_ancientslibrary";
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

import { roomRegistry } from "../data/roomRegistry";

export const roomRegistry: Record<string, Room> = {
  [elfhame.id]: elfhame,
  [faeglade.id]: faeglade,
  [faelake.id]: faelake,
  [faelakenorthshore.id]: faelakenorthshore,
  [faepalacedungeons.id]: faepalacedungeons,
  [faepalacemainhall.id]: faepalacemainhall,
  [faepalacerhianonsroom.id]: faepalacerhianonsroom,
  [datavoid.id]: datavoid,
  [failure.id]: failure,
  [glitchinguniverse.id]: glitchinguniverse,
  [issuesdetected.id]: issuesdetected,
  [moreissues.id]: moreissues,
  [carronspire.id]: carronspire,
  [gorstanhub.id]: gorstanhub,
  [gorstanvillage.id]: gorstanvillage,
  [torridon.id]: torridon,
  [torridoninn.id]: torridoninn,
  [torridoninthepast.id]: torridoninthepast,
  [controlnexus.id]: controlnexus,
  [controlroom.id]: controlroom,
  [crossing.id]: crossing,
  [hiddenlab.id]: hiddenlab,
  [introreset.id]: introreset,
  [introstart.id]: introstart,
  [hiddenlibrary.id]: hiddenlibrary,
  [lattice.id]: lattice,
  [latticehub.id]: latticehub,
  [latticelibrary.id]: latticelibrary,
  [latticeobservationentrance.id]: latticeobservationentrance,
  [latticeobservatory.id]: latticeobservatory,
  [latticespire.id]: latticespire,
  [libraryofnine.id]: libraryofnine,
  [cafeoffice.id]: cafeoffice,
  [dalesapartment.id]: dalesapartment,
  [findlaters.id]: findlaters,
  [findlaterscornercoffeeshop.id]: findlaterscornercoffeeshop,
  [londonhub.id]: londonhub,
  [stkatherinesdock.id]: stkatherinesdock,
  [trentpark.id]: trentpark,
  [anothermazeroom.id]: anothermazeroom,
  [forgottenchamber.id]: forgottenchamber,
  [labyrinthbend.id]: labyrinthbend,
  [mazeecho.id]: mazeecho,
  [mazehub.id]: mazehub,
  [mazeroom.id]: mazeroom,
  [mirrorhall.id]: mirrorhall,
  [misleadchamber.id]: misleadchamber,
  [pollysbay.id]: pollysbay,
  [secretmazeentry.id]: secretmazeentry,
  [secrettunnel.id]: secrettunnel,
  [stillamazeroom.id]: stillamazeroom,
  [storagechamber.id]: storagechamber,
  [windingpath.id]: windingpath,
  [liminalhub.id]: liminalhub,
  [aevirawarehouse.id]: aevirawarehouse,
  [burgerjoint.id]: burgerjoint,
  [centralpark.id]: centralpark,
  [greasystoreroom.id]: greasystoreroom,
  [manhattanhub.id]: manhattanhub,
  [ancientslibrary.id]: ancientslibrary,
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
};
