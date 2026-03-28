const mysql = require('mysql2/promise');
require('dotenv').config();

const updates = [
    { name: 'The Metropolitan Plaza', img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200' },
    { name: 'Sunrise Alpine Lodge',   img: 'https://images.unsplash.com/photo-1518732714860-b62714ce0c59?auto=format&fit=crop&w=1200' },
    { name: 'Grand Azure Resort',     img: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200' }
];

async function update() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });
    console.log('Updating images for original hotels...');
    for (const h of updates) {
        await conn.execute(
            'UPDATE hotels SET image_url = ? WHERE name = ?',
            [h.img, h.name]
        );
    }
    console.log('Successfully updated original hotel images! 🎨');
    await conn.end();
}
update().catch(console.error);
