const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../frontend/assets/hotels');
const sourceFiles = {
    'paris.png': 'C:/Users/Tarik/.gemini/antigravity/brain/ad71a159-e66a-4d84-aaab-54a3489f8c82/hotel_paris_luxury_1774703388643.png',
    'maldives.png': 'C:/Users/Tarik/.gemini/antigravity/brain/ad71a159-e66a-4d84-aaab-54a3489f8c82/hotel_maldives_resort_1774703405993.png',
    'tokyo.png': 'C:/Users/Tarik/.gemini/antigravity/brain/ad71a159-e66a-4d84-aaab-54a3489f8c82/hotel_tokyo_modern_1774703514172.png',
    'london.png': 'C:/Users/Tarik/.gemini/antigravity/brain/ad71a159-e66a-4d84-aaab-54a3489f8c82/hotel_london_classic_1774703543079.png',
    'dubai.png': 'C:/Users/Tarik/.gemini/antigravity/brain/ad71a159-e66a-4d84-aaab-54a3489f8c82/hotel_dubai_desert_1774703566565.png',
    'newyork.png': 'C:/Users/Tarik/.gemini/antigravity/brain/ad71a159-e66a-4d84-aaab-54a3489f8c82/hotel_new_york_boutique_1774703686478.png'
};

async function fix() {
    try {
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        for (const [name, source] of Object.entries(sourceFiles)) {
            if (fs.existsSync(source)) {
                fs.copyFileSync(source, path.join(targetDir, name));
                console.log(`✅ Copied: ${name}`);
            } else {
                console.error(`❌ Source missing: ${source}`);
            }
        }
    } catch (err) {
        console.error('❌ General Error:', err.message);
    }
}
fix();
