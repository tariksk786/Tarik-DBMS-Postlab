const db = require('../config/db');

// Get all hotels (with optional search/filter params)
exports.getAllHotels = async (req, res) => {
    try {
        const { location, minPrice, maxPrice, page = 1, limit = 6 } = req.query;
        const offset = (page - 1) * limit;
        let query = `
            SELECT h.*, 
                   ROUND(AVG(r.rating), 1) AS avg_rating,
                   COUNT(DISTINCT r.id) AS review_count,
                   MIN(rm.price_per_night) AS min_price
            FROM hotels h
            LEFT JOIN reviews r ON r.hotel_id = h.id
            LEFT JOIN rooms rm ON rm.hotel_id = h.id
        `;
        const params = [];
        const conditions = [];

        if (location) {
            conditions.push('h.location LIKE ?');
            params.push(`%${location}%`);
        }
        if (minPrice) {
            conditions.push('rm.price_per_night >= ?');
            params.push(minPrice);
        }
        if (maxPrice) {
            conditions.push('rm.price_per_night <= ?');
            params.push(maxPrice);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ` GROUP BY h.id ORDER BY avg_rating DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        const [hotels] = await db.query(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(DISTINCT h.id) AS total FROM hotels h LEFT JOIN rooms rm ON rm.hotel_id = h.id';
        const countParams = [];
        if (conditions.length > 0) {
            countQuery += ' WHERE ' + conditions.join(' AND ');
            countParams.push(...params.slice(0, params.length - 2));
        }
        const [[{ total }]] = await db.query(countQuery, countParams);

        res.json({ hotels, total, page: parseInt(page), pages: Math.ceil(total / limit) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching hotels' });
    }
};

// Get single hotel by ID with its rooms & reviews
exports.getHotelById = async (req, res) => {
    try {
        const { id } = req.params;
        const [[hotel]] = await db.query('SELECT h.*, ROUND(AVG(r.rating),1) AS avg_rating FROM hotels h LEFT JOIN reviews r ON r.hotel_id = h.id WHERE h.id = ? GROUP BY h.id', [id]);
        if (!hotel) return res.status(404).json({ error: 'Hotel not found' });

        const [rooms] = await db.query('SELECT * FROM rooms WHERE hotel_id = ?', [id]);
        const [reviews] = await db.query(`
            SELECT rv.*, u.name AS user_name 
            FROM reviews rv JOIN users u ON u.id = rv.user_id
            WHERE rv.hotel_id = ? ORDER BY rv.created_at DESC`, [id]);

        res.json({ hotel, rooms, reviews });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching hotel' });
    }
};

// Admin: Create a hotel
exports.createHotel = async (req, res) => {
    try {
        const { name, location, description, image_url } = req.body;
        if (!name || !location) return res.status(400).json({ error: 'Name and location are required' });

        const [result] = await db.query(
            'INSERT INTO hotels (name, location, description, image_url) VALUES (?, ?, ?, ?)',
            [name, location, description || '', image_url || 'default_hotel.jpg']
        );
        res.status(201).json({ message: 'Hotel created', hotelId: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error creating hotel' });
    }
};

// Admin: Update hotel
exports.updateHotel = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, location, description, image_url } = req.body;
        await db.query(
            'UPDATE hotels SET name=?, location=?, description=?, image_url=? WHERE id=?',
            [name, location, description, image_url, id]
        );
        res.json({ message: 'Hotel updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error updating hotel' });
    }
};

// Admin: Delete hotel
exports.deleteHotel = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM hotels WHERE id = ?', [id]);
        res.json({ message: 'Hotel deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error deleting hotel' });
    }
};

// Post a review for a hotel
exports.postReview = async (req, res) => {
    try {
        const { hotel_id } = req.params;
        const { rating, comment } = req.body;
        const user_id = req.user.id;
        if (!rating) return res.status(400).json({ error: 'Rating is required' });

        await db.query(
            'INSERT INTO reviews (user_id, hotel_id, rating, comment) VALUES (?, ?, ?, ?)',
            [user_id, hotel_id, rating, comment || '']
        );
        res.status(201).json({ message: 'Review posted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error posting review' });
    }
};
