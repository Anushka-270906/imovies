import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import User from '../models/User.js';
import Movie from '../models/Movie.js';
import Theater from '../models/Theater.js';
import Show from '../models/Show.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import Favorite from '../models/Favorite.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const sampleMovies = [
  {
    title: 'Dune: Part Two',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    genre: ['Sci-Fi', 'Adventure', 'Action'],
    releaseDate: new Date('2024-03-01'),
    duration: 166,
    certification: 'PG-13',
    language: 'English',
    rating: 8.8,
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    trailerUrl: 'https://www.youtube.com/embed/Way9Dexny3w',
    isFeatured: true,
    isTrending: true,
    isUpcoming: false,
    director: 'Denis Villeneuve',
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Austin Butler'],
    status: 'Now Showing',
  },
  {
    title: 'Oppenheimer',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
    genre: ['Biography', 'Drama', 'History'],
    releaseDate: new Date('2023-07-21'),
    duration: 180,
    certification: 'R',
    language: 'English',
    rating: 8.9,
    posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop',
    trailerUrl: 'https://www.youtube.com/embed/uYPbbksJxIg',
    isFeatured: true,
    isTrending: true,
    isUpcoming: false,
    director: 'Christopher Nolan',
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
    status: 'Now Showing',
  },
  {
    title: 'Interstellar',
    description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
    genre: ['Sci-Fi', 'Drama', 'Adventure'],
    releaseDate: new Date('2014-11-07'),
    duration: 169,
    certification: 'PG-13',
    language: 'English',
    rating: 8.7,
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1600&auto=format&fit=crop',
    trailerUrl: 'https://www.youtube.com/embed/zSWdZVtXT7E',
    isFeatured: true,
    isTrending: false,
    isUpcoming: false,
    director: 'Christopher Nolan',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
    status: 'Now Showing',
  },
  {
    title: 'Spider-Man: Across the Spider-Verse',
    description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
    genre: ['Animation', 'Action', 'Adventure'],
    releaseDate: new Date('2023-06-02'),
    duration: 140,
    certification: 'PG',
    language: 'English',
    rating: 8.7,
    posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1600&auto=format&fit=crop',
    trailerUrl: 'https://www.youtube.com/embed/cqGjhVJWtEg',
    isFeatured: false,
    isTrending: true,
    isUpcoming: false,
    director: 'Joaquim Dos Santos, Kemp Powers',
    cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac'],
    status: 'Now Showing',
  },
  {
    title: 'The Dark Knight',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    genre: ['Action', 'Crime', 'Drama'],
    releaseDate: new Date('2008-07-18'),
    duration: 152,
    certification: 'PG-13',
    language: 'English',
    rating: 9.0,
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?q=80&w=1600&auto=format&fit=crop',
    trailerUrl: 'https://www.youtube.com/embed/EXeTwQWrcwY',
    isFeatured: true,
    isTrending: false,
    isUpcoming: false,
    director: 'Christopher Nolan',
    cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Michael Caine'],
    status: 'Now Showing',
  },
  {
    title: 'Avatar: Fire and Ash',
    description: 'The upcoming third installment in James Cameron\'s epic science fiction franchise exploring the aggressive Ash People tribe of Pandora.',
    genre: ['Sci-Fi', 'Action', 'Fantasy'],
    releaseDate: new Date('2025-12-19'),
    duration: 190,
    certification: 'PG-13',
    language: 'English',
    rating: 8.5,
    posterUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    trailerUrl: 'https://www.youtube.com/embed/d9MyW72ELq0',
    isFeatured: false,
    isTrending: true,
    isUpcoming: true,
    director: 'James Cameron',
    cast: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver'],
    status: 'Upcoming',
  },
  {
    title: 'Inception',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    genre: ['Action', 'Sci-Fi', 'Thriller'],
    releaseDate: new Date('2010-07-16'),
    duration: 148,
    certification: 'PG-13',
    language: 'English',
    rating: 8.8,
    posterUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1600&auto=format&fit=crop',
    trailerUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    isFeatured: false,
    isTrending: false,
    isUpcoming: false,
    director: 'Christopher Nolan',
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page', 'Tom Hardy'],
    status: 'Now Showing',
  },
  {
    title: 'Gladiator II',
    description: 'Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered.',
    genre: ['Action', 'Adventure', 'Drama'],
    releaseDate: new Date('2024-11-22'),
    duration: 148,
    certification: 'R',
    language: 'English',
    rating: 8.2,
    posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1600&auto=format&fit=crop',
    trailerUrl: 'https://www.youtube.com/embed/4rgYUipGJNo',
    isFeatured: false,
    isTrending: true,
    isUpcoming: false,
    director: 'Ridley Scott',
    cast: ['Paul Mescal', 'Pedro Pascal', 'Denzel Washington', 'Connie Nielsen'],
    status: 'Now Showing',
  },
];

const sampleTheaters = [
  {
    name: 'iMovies IMAX Cinema - Grand Central',
    location: '742 Evergreen Plaza, Downtown',
    screenName: 'Screen 1 (Laser IMAX 12-Channel Audio)',
    balconyPrice: 22,
    balconySeats: 20, // 2 rows x 10 seats
    middlePrice: 16,
    middleSeats: 30,  // 3 rows x 10 seats
    regularPrice: 12,
    regularSeats: 30, // 3 rows x 10 seats
    isActive: true,
  },
  {
    name: 'Starlight Dolby Atmos Multiplex',
    location: '108 Ocean Drive, West Bay',
    screenName: 'Auditorium 3 (Dolby Cinema)',
    balconyPrice: 20,
    balconySeats: 20,
    middlePrice: 15,
    middleSeats: 30,
    regularPrice: 11,
    regularSeats: 30,
    isActive: true,
  },
  {
    name: 'CinePrime Premiere Luxe',
    location: '450 North Blvd, Uptown',
    screenName: 'Screen Luxe 2 (4K Laser Projection)',
    balconyPrice: 25,
    balconySeats: 20,
    middlePrice: 18,
    middleSeats: 30,
    regularPrice: 14,
    regularSeats: 30,
    isActive: true,
  },
  {
    name: 'Galaxy 4DX Experience Theater',
    location: '88 Tech Park Way, Metro Center',
    screenName: '4DX Theater 1 (Motion & Atmospheric FX)',
    balconyPrice: 24,
    balconySeats: 20,
    middlePrice: 17,
    middleSeats: 30,
    regularPrice: 13,
    regularSeats: 30,
    isActive: true,
  },
];

// Helper to format date YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/imovies';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected successfully.');

    // Drop existing database to clear out old indexes cleanly
    console.log('Dropping existing database and indexes...');
    await mongoose.connection.dropDatabase();

    // 1. Seed Users
    console.log('Seeding Users...');
    const adminUser = await User.create({
      name: 'System Administrator',
      email: process.env.ADMIN_EMAIL || 'admin@imovies.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@12345',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    });

    const testUser = await User.create({
      name: 'Alex Johnson',
      email: 'alex@example.com',
      password: 'User@12345',
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    });

    const secondUser = await User.create({
      name: 'Sarah Connor',
      email: 'sarah@example.com',
      password: 'User@12345',
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    });

    console.log(`Created 3 users: Admin (${adminUser.email}), User (${testUser.email}), User (${secondUser.email})`);

    // 2. Seed Movies
    console.log('Seeding Movies...');
    const createdMovies = await Movie.insertMany(sampleMovies);
    console.log(`Inserted ${createdMovies.length} movies.`);

    // 3. Seed Theaters
    console.log('Seeding Theaters...');
    const createdTheaters = await Theater.insertMany(sampleTheaters);
    console.log(`Inserted ${createdTheaters.length} theaters.`);

    // 4. Seed Shows
    console.log('Seeding Shows...');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(today.getDate() + 2);

    const dates = [formatDate(today), formatDate(tomorrow), formatDate(dayAfter)];
    const showTimes = ['10:30 AM', '02:15 PM', '06:30 PM', '09:45 PM'];

    const showsToCreate = [];

    // Create scheduled shows for the now-showing movies
    const nowShowingMovies = createdMovies.filter((m) => m.status === 'Now Showing');

    for (const movie of nowShowingMovies) {
      for (const theater of createdTheaters) {
        for (const date of dates) {
          // Schedule 2-3 showtimes per day per theater
          const selectedTimes = [showTimes[0], showTimes[2]]; // 10:30 AM and 06:30 PM
          for (const time of selectedTimes) {
            showsToCreate.push({
              movie: movie._id,
              theater: theater._id,
              showDate: date,
              showTime: time,
              screenName: theater.screenName,
              balconyPrice: theater.balconyPrice,
              middlePrice: theater.middlePrice,
              regularPrice: theater.regularPrice,
              bookedSeats: [],
              lockedSeats: [],
              isActive: true,
            });
          }
        }
      }
    }

    const createdShows = await Show.insertMany(showsToCreate);
    console.log(`Inserted ${createdShows.length} scheduled shows.`);

    // 5. Seed a few realistic Bookings and Payments
    console.log('Seeding Initial Bookings & Payments...');
    const show1 = createdShows[0];
    const show2 = createdShows[1];

    const seatsBooked1 = ['B-A3', 'B-A4'];
    const seatsBooked2 = ['M-C5', 'M-C6', 'M-C7'];

    // Update booked seats on the shows
    show1.bookedSeats = seatsBooked1;
    await show1.save();

    show2.bookedSeats = seatsBooked2;
    await show2.save();

    const booking1 = await Booking.create({
      bookingReference: 'IMV-INIT-001',
      user: testUser._id,
      movie: show1.movie,
      theater: show1.theater,
      show: show1._id,
      showDate: show1.showDate,
      showTime: show1.showTime,
      seats: [
        { seatId: 'B-A3', category: 'Balcony', price: show1.balconyPrice },
        { seatId: 'B-A4', category: 'Balcony', price: show1.balconyPrice },
      ],
      seatCount: 2,
      subtotal: show1.balconyPrice * 2,
      taxAndFees: Math.round(show1.balconyPrice * 2 * 0.05 * 100) / 100,
      totalAmount: Math.round(show1.balconyPrice * 2 * 1.05 * 100) / 100,
      bookingStatus: 'Confirmed',
      paymentStatus: 'Paid',
      paymentMethod: 'Demo Card (Visa)',
      paymentTransactionId: 'TXN-INIT-98412',
    });

    await Payment.create({
      orderId: 'IMV-INIT-001',
      user: testUser._id,
      booking: booking1._id,
      amount: booking1.totalAmount,
      currency: 'USD',
      provider: 'DEMO',
      status: 'COMPLETED',
      paymentMethod: 'Demo Card (Visa)',
      transactionId: 'TXN-INIT-98412',
    });

    const booking2 = await Booking.create({
      bookingReference: 'IMV-INIT-002',
      user: secondUser._id,
      movie: show2.movie,
      theater: show2.theater,
      show: show2._id,
      showDate: show2.showDate,
      showTime: show2.showTime,
      seats: [
        { seatId: 'M-C5', category: 'Middle', price: show2.middlePrice },
        { seatId: 'M-C6', category: 'Middle', price: show2.middlePrice },
        { seatId: 'M-C7', category: 'Middle', price: show2.middlePrice },
      ],
      seatCount: 3,
      subtotal: show2.middlePrice * 3,
      taxAndFees: Math.round(show2.middlePrice * 3 * 0.05 * 100) / 100,
      totalAmount: Math.round(show2.middlePrice * 3 * 1.05 * 100) / 100,
      bookingStatus: 'Confirmed',
      paymentStatus: 'Paid',
      paymentMethod: 'UPI Simulator',
      paymentTransactionId: 'TXN-INIT-31429',
    });

    await Payment.create({
      orderId: 'IMV-INIT-002',
      user: secondUser._id,
      booking: booking2._id,
      amount: booking2.totalAmount,
      currency: 'USD',
      provider: 'DEMO',
      status: 'COMPLETED',
      paymentMethod: 'UPI Simulator',
      transactionId: 'TXN-INIT-31429',
    });

    // 6. Seed Favorites
    await Favorite.create({
      user: testUser._id,
      movie: createdMovies[0]._id,
    });
    await Favorite.create({
      user: testUser._id,
      movie: createdMovies[1]._id,
    });

    console.log('Seeding completed successfully!');
    console.log('----------------------------------------------------');
    console.log('Admin Login: admin@imovies.com / Admin@12345');
    console.log('User Login:  alex@example.com / User@12345');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
