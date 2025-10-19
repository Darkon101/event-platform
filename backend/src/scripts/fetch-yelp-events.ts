import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env.development file
dotenv.config({ path: '.env.development' });

const YELP_API_KEY = process.env.YELP_API_KEY;

// Choose your category here
const EVENT_CATEGORY = 'music'; // Options: music, festivals, food-and-drink, sports-active-life, nightlife, visual-arts, performing-arts

interface YelpEvent {
  id: string;
  name: string;
  description?: string;
  category?: string;
  is_free?: boolean;
  cost?: number;
  cost_max?: number;
  event_site_url?: string;
  image_url?: string;
  interested_count?: number;
  attending_count?: number;
  time_start?: string;
  time_end?: string;
  location?: {
    address1?: string;
    address2?: string;
    address3?: string;
    city?: string;
    zip_code?: string;
    country?: string;
    state?: string;
    display_address?: string[];
  };
  latitude?: number;
  longitude?: number;
  business_id?: string;
}

function generateJavaScriptFile(events: any[]): string {
  const eventsString = events.map(event => {
    return `  {
    title: ${JSON.stringify(event.title)},
    description: ${JSON.stringify(event.description)},
    location: ${JSON.stringify(event.location)},
    date: new Date("${event.date}"),
    capacity: ${event.capacity},
    price: ${event.price},
    created_by: ${JSON.stringify(event.created_by)},
    external_id: ${event.external_id ? JSON.stringify(event.external_id) : 'null'},
    image_url: ${event.image_url ? JSON.stringify(event.image_url) : 'null'},
    url: ${event.url ? JSON.stringify(event.url) : 'null'}
  }`;
  }).join(',\n');

  return `module.exports = [\n${eventsString}\n];\n`;
}

async function fetchYelpEvents() {
  if (!YELP_API_KEY) {
    console.error('❌ YELP_API_KEY not found in .env.development file');
    console.log('Get your API key from: https://www.yelp.com/developers');
    process.exit(1);
  }

  try {
    console.log(`🔍 Fetching ${EVENT_CATEGORY} events from Yelp...`);
    
    const response = await axios.get('https://api.yelp.com/v3/events', {
      headers: {
        Authorization: `Bearer ${YELP_API_KEY}`
      },
      params: {
        location: 'London, UK',
        categories: EVENT_CATEGORY,
        limit: 50
      }
    });

    const events = response.data.events || [];

    if (events.length === 0) {
      console.log(`⚠️ No ${EVENT_CATEGORY} events found`);
      return;
    }

    console.log(`Found ${events.length} ${EVENT_CATEGORY} events`);

    const formattedEvents = events.map((event: YelpEvent, index: number) => {
      // Format location
      let location = 'London, UK';
      if (event.location) {
        const parts = [
          event.location.address1,
          event.location.city,
          event.location.state
        ].filter(Boolean);
        if (parts.length > 0) {
          location = parts.join(', ');
        } else if (event.location.display_address && event.location.display_address.length > 0) {
          location = event.location.display_address.join(', ');
        }
      }

      // Parse date - ensure it's valid
      let eventDate: Date;
      if (event.time_start) {
        eventDate = new Date(event.time_start);
        // Check if date is valid
        if (isNaN(eventDate.getTime())) {
          eventDate = new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000);
        }
      } else {
        // Random date in next 30 days
        eventDate = new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000);
      }

      // Determine price - handle all null/undefined cases
      let price = 0;
      if (event.is_free === true) {
        price = 0;
      } else if (typeof event.cost === 'number' && !isNaN(event.cost)) {
        price = event.cost;
      } else if (typeof event.cost_max === 'number' && !isNaN(event.cost_max)) {
        price = event.cost_max;
      } else {
        // Generate random price between 10 and 100
        price = Math.floor(Math.random() * 90) + 10;
      }

      // Ensure price is a valid number
      price = parseFloat(price.toFixed(2));

      // Generate capacity
      let capacity = 100;
      const attendingCount = event.attending_count || 0;
      const interestedCount = event.interested_count || 0;
      
      if (attendingCount > 0 || interestedCount > 0) {
        const estimated = attendingCount + interestedCount;
        capacity = Math.max(Math.floor(estimated * 2), 50);
      } else {
        capacity = Math.floor(Math.random() * 4950) + 50; // Between 50 and 5000
      }

      // Build description
      let description = event.description || '';
      if (!description || description.trim().length === 0) {
        description = `${EVENT_CATEGORY.charAt(0).toUpperCase() + EVENT_CATEGORY.slice(1)} event in London. `;
        if (attendingCount > 0) {
          description += `${attendingCount} people attending. `;
        }
        if (interestedCount > 0) {
          description += `${interestedCount} people interested. `;
        }
        description += 'Check the website for more details.';
      }

      return {
        title: event.name ? event.name.substring(0, 200) : `${EVENT_CATEGORY} Event ${index + 1}`,
        description: description.substring(0, 500),
        location: location.substring(0, 200),
        date: eventDate.toISOString(),
        capacity: capacity,
        price: price,
        created_by: 'testadmin',
        external_id: `yelp_${event.id}`,
        image_url: event.image_url || null,
        url: event.event_site_url || null
      };
    });

    // Create dev-data directory if it doesn't exist
    const devDataDir = path.join(__dirname, '../db/data/development-data');
    if (!fs.existsSync(devDataDir)) {
      fs.mkdirSync(devDataDir, { recursive: true });
    }

    // Write to JavaScript file
    const outputPath = path.join(devDataDir, 'events.ts');
    const jsContent = generateJavaScriptFile(formattedEvents);
    fs.writeFileSync(outputPath, jsContent);

    console.log(`✅ Successfully fetched ${formattedEvents.length} ${EVENT_CATEGORY} events from Yelp`);
    console.log(`📁 Saved to: ${outputPath}`);
    console.log('\nSample event:');
    console.log(JSON.stringify(formattedEvents[0], null, 2));

    // Show some stats
    const freeEvents = formattedEvents.filter((e:any) => e.price === 0).length;
    const paidEvents = formattedEvents.length - freeEvents;
    const avgPrice = formattedEvents.reduce((sum: number, e: any) => sum + e.price, 0) / formattedEvents.length;
    
    console.log(`\n📊 Stats:`);
    console.log(`   Category: ${EVENT_CATEGORY}`);
    console.log(`   Free events: ${freeEvents}`);
    console.log(`   Paid events: ${paidEvents}`);
    console.log(`   Average price: £${avgPrice.toFixed(2)}`);

  } catch (error: any) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.statusText);
      console.error('Response:', error.response.data);
      if (error.response.status === 401) {
        console.error('Check that your YELP_API_KEY is correct');
      }
    } else if (error.request) {
      console.error('❌ No response received from Yelp API');
    } else {
      console.error('❌ Error:', error.message);
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run the function
fetchYelpEvents();