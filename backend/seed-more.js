const mysql = require('mysql2/promise');
require('dotenv').config();

const hotels = [
    { name: 'Hotel de Paris Prestige', location: 'Paris, France', img: 'assets/hotels/paris.png', desc: 'Luxury boutique hotel with Eiffel Tower views.', 
      rooms: [ { type: 'Classic Queen', price: 350, cap: 2 }, { type: 'Eiffel Suite', price: 850, cap: 3 } ] },
    { name: 'Maldives Crystal Resort', location: 'Male, Maldives', img: 'assets/hotels/maldives.png', desc: 'Overwater bungalows in pristine turquoise lagoons.', 
      rooms: [ { type: 'Ocean Villa', price: 950, cap: 2 }, { type: 'Royal Lagoon Suite', price: 1800, cap: 4 } ] },
    { name: 'Tokyo Neon Heights', location: 'Tokyo, Japan', img: 'assets/hotels/tokyo.png', desc: 'Sleek futuristic skyscraper in the heart of Shinjuku.', 
      rooms: [ { type: 'Compact Zen', price: 180, cap: 1 }, { type: 'Cyber Suite', price: 420, cap: 2 } ] },
    { name: 'London Victoria Grand', location: 'London, UK', img: 'assets/hotels/london.png', desc: 'Historic elegance with modern British luxury.', 
      rooms: [ { type: 'Heritage Single', price: 210, cap: 1 }, { type: 'Royal Victoria Suite', price: 550, cap: 3 } ] },
    { name: 'Dubai Oasis Sands', location: 'Dubai, UAE', img: 'assets/hotels/dubai.png', desc: 'A desert paradise with infinity pools and golden dunes.', 
      rooms: [ { type: 'Sand Dune Deluxe', price: 320, cap: 3 }, { type: 'Palace Pavilion', price: 1200, cap: 5 } ] },
    { name: 'Brooklyn Loft Boutique', location: 'New York, USA', img: 'assets/hotels/newyork.png', desc: 'Industrial chic living with a view of the Brooklyn Bridge.', 
      rooms: [ { type: 'Studio Loft', price: 290, cap: 2 }, { type: 'Penthouse View', price: 720, cap: 2 } ] }
];

async function seed() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });
    console.log('Seeding more hotels...');
    for (const h of hotels) {
        const [res] = await conn.execute(
            'INSERT INTO hotels (name, location, description, image_url) VALUES (?, ?, ?, ?)',
            [h.name, h.location, h.desc, h.img]
        );
        const hotelId = res.insertId;
        for (const r of h.rooms) {
            await conn.execute(
                'INSERT INTO rooms (hotel_id, room_type, price_per_night, capacity) VALUES (?, ?, ?, ?)',
                [hotelId, r.type, r.price, r.cap]
            );
        }
    }
    console.log('Successfully seeded 6 new hotels and their rooms! 🎉');
    await conn.end();
}
seed().catch(console.error);
