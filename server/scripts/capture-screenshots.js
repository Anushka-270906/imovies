import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.resolve(__dirname, '../../screenshots');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const takeScreenshots = async () => {
  console.log('Launching Edge for live screenshot capture...');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();

  try {
    // 1. Landing Page
    console.log('Capturing Landing Page...');
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise((r) => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(outputDir, '01_landing_page.png'), fullPage: false });

    // 2. Explore Movies
    console.log('Capturing Explore Movies Page...');
    await page.goto('http://127.0.0.1:5173/movies', { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(outputDir, '02_explore_movies.png'), fullPage: false });

    // 3. Login Page
    console.log('Capturing Login Page...');
    await page.goto('http://127.0.0.1:5173/login', { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(outputDir, '03_login_page.png'), fullPage: false });

    // 4. Movie Details Page
    // Fetch first movie id from API
    const moviesRes = await fetch('http://localhost:5000/api/movies');
    const moviesData = await moviesRes.json();
    const firstMovie = moviesData.data[0];

    if (firstMovie) {
      console.log(`Capturing Movie Details (${firstMovie.title})...`);
      await page.goto(`http://127.0.0.1:5173/movies/${firstMovie._id}`, { waitUntil: 'networkidle2', timeout: 15000 });
      await new Promise((r) => setTimeout(r, 1500));
      await page.screenshot({ path: path.join(outputDir, '04_movie_details.png'), fullPage: false });
    }

    // 5. Seat Booking Page
    const showsRes = await fetch('http://localhost:5000/api/shows');
    const showsData = await showsRes.json();
    const firstShow = showsData.data[0];

    if (firstShow) {
      console.log(`Capturing Seat Selection Layout (Show ${firstShow._id})...`);
      await page.goto(`http://127.0.0.1:5173/booking/${firstShow._id}`, { waitUntil: 'networkidle2', timeout: 15000 });
      await new Promise((r) => setTimeout(r, 1500));
      await page.screenshot({ path: path.join(outputDir, '05_seat_selection.png'), fullPage: false });
    }

    console.log('All screenshots captured successfully in:', outputDir);
  } catch (err) {
    console.error('Error during screenshot capture:', err);
  } finally {
    await browser.close();
  }
};

takeScreenshots();
