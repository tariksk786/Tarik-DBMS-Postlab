# Hotel Reservation & Management System

A professional, full-stack web application for browsing hotels, booking rooms, and managing reservations. This project features a robust Node.js backend, a MySQL database, and a clean, responsive frontend.

## 🚀 Features

- **Animated UI**: Smooth scroll-reveal animations and micro-interactions for a premium feel.
- **Modern Icons**: Fully iconified interface using FontAwesome 6.
- **User Authentication**: Secure login and registration system.
- **Hotel Browsing**: View available hotels with detailed descriptions and high-quality images.
- **Room Selection**: Choose specific room types based on availability.
- **Rating & Review System**: Users can rate hotels and leave detailed comments.
- **Advanced Search**: Filter hotels by location, price range, and capacity.
- **Professional Checkout**: Sleek, multi-step mock payment simulation.
- **Booking System**: Seamless reservation process with status tracking.
- **Admin Dashboard**: Manage hotels, rooms, and view all customer bookings.
- **Responsive Design**: Fully optimized for desktop and mobile devices.

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT / Session-based
- **Utilities**: Bcrypt for password hashing

## 📦 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/tariksk786/TARIK-DBMS-POSTLAB.git
   cd TARIK-DBMS-POSTLAB
   ```

2. **Database Setup**:
   - Create a MySQL database named `hotel_db` (or as specified in your `database.sql`).
   - Import the `database.sql` file into your MySQL server.

3. **Backend Setup**:
   - Navigate to the `backend` folder.
   - Install dependencies:
     ```bash
     npm install
     ```
   - Create a `.env` file in the `backend` folder and add your database credentials:
     ```env
     DB_HOST=localhost
     DB_USER=root
     DB_PASS=yourpassword
     DB_NAME=hotel_db
     PORT=5000
     ```

4. **Run the Application**:
   - You can use the provided `run_project.bat` file in the root directory:
     ```bash
     ./run_project.bat
     ```
   - Build and start the backend:
     ```bash
     npm start
     ```
   - Open `frontend/index.html` in your browser.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/tariksk786/TARIK-DBMS-POSTLAB/issues).

---
*Created by [tariksk786](https://github.com/tariksk786)*
