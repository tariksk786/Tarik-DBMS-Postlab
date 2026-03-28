const bcrypt = require('bcryptjs');

async function main() {
    const admin = await bcrypt.hash('admin123', 10);
    const john  = await bcrypt.hash('john123',  10);
    const jane  = await bcrypt.hash('jane123',  10);
    console.log('ADMIN:', admin);
    console.log('JOHN:',  john);
    console.log('JANE:',  jane);
}
main();
