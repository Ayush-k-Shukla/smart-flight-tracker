const fs = require('fs');
const path = require('path');

async function prepareAirports() {
  console.log('Fetching airport data...');
  try {
    const response = await fetch('https://raw.githubusercontent.com/mwgg/Airports/master/airports.json');
    const data = await response.json();
    
    console.log('Processing data...');
    const filtered = Object.values(data)
      .filter((a) => a.iata && a.iata.length === 3)
      .map((a) => ({
        iata: a.iata,
        name: a.name,
        city: a.city,
        country: a.country
      }));

    // Top Indian airports priority list
    const topIndia = ['DEL', 'BOM', 'BLR', 'MAA', 'CCU', 'HYD', 'AMD', 'PNQ', 'GOI', 'COK'];

    // Prioritize India (ISO code 'IN')
    const indiaAirports = filtered.filter(a => a.country === 'IN');
    const others = filtered.filter(a => a.country !== 'IN');
    
    // Sort India airports: Prioritize top ones, then alphabetical by city
    indiaAirports.sort((a, b) => {
      const aIndex = topIndia.indexOf(a.iata);
      const bIndex = topIndia.indexOf(b.iata);
      
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.city.localeCompare(b.city);
    });

    others.sort((a, b) => a.city.localeCompare(b.city));

    const finalData = [...indiaAirports, ...others];

    const dataDir = path.join(__dirname, '../backend/src/data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(dataDir, 'airports.json'),
      JSON.stringify(finalData)
    );

    console.log(`Successfully processed ${finalData.length} airports.`);
    console.log(`India airports: ${indiaAirports.length}`);
    console.log(`Top 5 India:`, indiaAirports.slice(0, 5).map(a => a.iata).join(', '));
  } catch (error) {
    console.error('Error preparing airports:', error);
    process.exit(1);
  }
}

prepareAirports();
