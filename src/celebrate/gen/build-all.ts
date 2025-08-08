// src/celebrate/gen/build-all.ts
// Master generator script for all celebration data

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { rangeYears } from './util';
import { buildChristian } from './build-christian';
import { buildIslam } from './build-islam';
import { buildJudaism } from './build-judaism';
import { buildChinese } from './build-chinese';
import { buildHindu } from './build-hindu';
import { buildBuddhist } from './build-buddhist';
import { buildSikh } from './build-sikh';
import { buildShinto } from './build-shinto';
import { buildSeasonal } from './build-seasonal';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generate comprehensive celebration data for 2025-2050
 */
export async function generateAllCelebrationData() {
  const years = rangeYears(2025, 2050);
  const dataDir = path.join(__dirname, '../data');
  
  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  console.log('🎉 Generating celebration data for years 2025-2050...');
  
  // Christian holidays
  console.log('✝️  Generating Christian holidays...');
  const christianData = {
    christmas: buildChristian.christmas(years),
    easter: buildChristian.easter(years)
  };
  fs.writeFileSync(
    path.join(dataDir, 'christian.json'),
    JSON.stringify(christianData, null, 2)
  );
  
  // Islamic holidays
  console.log('☪️  Generating Islamic holidays...');
  const islamicData = {
    eidAlFitr: await buildIslam.eidAlFitr(years),
    eidAlAdha: await buildIslam.eidAlAdha(years)
  };
  fs.writeFileSync(
    path.join(dataDir, 'islamic.json'),
    JSON.stringify(islamicData, null, 2)
  );
  
  // Jewish holidays
  console.log('✡️  Generating Jewish holidays...');
  const jewishData = {
    roshHashanah: buildJudaism.roshHashanah(years),
    passover: buildJudaism.passover(years),
    hanukkah: buildJudaism.hanukkah(years)
  };
  fs.writeFileSync(
    path.join(dataDir, 'jewish.json'),
    JSON.stringify(jewishData, null, 2)
  );
  
  // Chinese holidays
  console.log('🐉 Generating Chinese holidays...');
  const chineseData = {
    lunarNewYear: buildChinese.lunarNewYear(years),
    midAutumnFestival: buildChinese.midAutumn(years)
  };
  fs.writeFileSync(
    path.join(dataDir, 'chinese.json'),
    JSON.stringify(chineseData, null, 2)
  );
  
  // Hindu holidays
  console.log('🕉️  Generating Hindu holidays...');
  const hinduData = {
    diwali: await buildHindu.diwali(years),
    holi: await buildHindu.holi(years)
  };
  fs.writeFileSync(
    path.join(dataDir, 'hindu.json'),
    JSON.stringify(hinduData, null, 2)
  );
  
  // Buddhist holidays
  console.log('☸️  Generating Buddhist holidays...');
  const buddhistData = {
    vesak: await buildBuddhist.vesak(years)
  };
  fs.writeFileSync(
    path.join(dataDir, 'buddhist.json'),
    JSON.stringify(buddhistData, null, 2)
  );
  
  // Sikh holidays
  console.log('☬  Generating Sikh holidays...');
  const sikhData = {
    vaisakhi: buildSikh.vaisakhi(years)
  };
  fs.writeFileSync(
    path.join(dataDir, 'sikh.json'),
    JSON.stringify(sikhData, null, 2)
  );
  
  // Shinto holidays
  console.log('⛩️  Generating Shinto holidays...');
  const shintoData = {
    shogatsu: buildShinto.shogatsu(years),
    obon: buildShinto.obon(years)
  };
  fs.writeFileSync(
    path.join(dataDir, 'shinto.json'),
    JSON.stringify(shintoData, null, 2)
  );
  
  // Seasonal/Astronomical holidays
  console.log('🌍 Generating seasonal holidays...');
  const seasonalData = {
    solsticesEquinoxes: buildSeasonal.solsticesEquinoxes(years),
    nawRuz: buildSeasonal.nawRuz(years)
  };
  fs.writeFileSync(
    path.join(dataDir, 'seasonal.json'),
    JSON.stringify(seasonalData, null, 2)
  );
  
  // Generate comprehensive index
  console.log('📚 Generating celebration index...');
  const totalSpans = 
    christianData.christmas.length + christianData.easter.length +
    islamicData.eidAlFitr.length + islamicData.eidAlAdha.length +
    jewishData.roshHashanah.length + jewishData.passover.length + jewishData.hanukkah.length +
    chineseData.lunarNewYear.length + chineseData.midAutumnFestival.length +
    hinduData.diwali.length + hinduData.holi.length +
    buddhistData.vesak.length +
    sikhData.vaisakhi.length +
    shintoData.shogatsu.length + shintoData.obon.length +
    seasonalData.solsticesEquinoxes.length + seasonalData.nawRuz.length;
  
  const index = {
    generated: new Date().toISOString(),
    yearRange: { start: 2025, end: 2050 },
    traditions: {
      christian: ['christmas', 'easter'],
      islamic: ['eidAlFitr', 'eidAlAdha'],
      jewish: ['roshHashanah', 'passover', 'hanukkah'],
      chinese: ['lunarNewYear', 'midAutumnFestival'],
      hindu: ['diwali', 'holi'],
      buddhist: ['vesak'],
      sikh: ['vaisakhi'],
      shinto: ['shogatsu', 'obon'],
      seasonal: ['solsticesEquinoxes', 'nawRuz']
    },
    totalCelebrations: totalSpans
  };
  
  fs.writeFileSync(
    path.join(dataDir, 'index.json'),
    JSON.stringify(index, null, 2)
  );
  
  console.log(`✅ Generated ${totalSpans} celebration spans across 9 traditions!`);
  console.log(`📁 Data files written to: ${dataDir}`);
  
  return index;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAllCelebrationData()
    .then(() => console.log('🎉 All celebration data generated successfully!'))
    .catch(error => console.error('❌ Error generating celebration data:', error));
}
