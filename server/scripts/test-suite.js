import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';

const BASE_URL = 'http://localhost:5000/api';

// Helper for making API calls in test
const request = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const status = response.status;
  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  return { status, data };
};

test('1. System Health Check', async () => {
  const res = await request('/health');
  assert.equal(res.status, 200);
  assert.equal(res.data.status, 'UP');
  assert.equal(res.data.service, 'iMovies API Backend');
});

test('2. Public Movies API - Retrieval & Search', async () => {
  const res = await request('/movies');
  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  assert.ok(Array.isArray(res.data.data));
  assert.ok(res.data.count > 0, 'Movies count should be > 0');

  // Test Search
  const searchRes = await request('/movies?search=Dune');
  assert.equal(searchRes.status, 200);
  assert.ok(searchRes.data.data.some((m) => m.title.includes('Dune')));
});

test('3. Authentication - Login with Valid Credentials', async () => {
  const res = await request('/auth/login', {
    method: 'POST',
    body: {
      email: 'alex@example.com',
      password: 'User@12345',
    },
  });

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  assert.ok(res.data.token, 'Token should be returned');
  assert.equal(res.data.user.email, 'alex@example.com');
  assert.equal(res.data.user.role, 'user');
});

test('4. Authentication - Reject Invalid Credentials', async () => {
  const res = await request('/auth/login', {
    method: 'POST',
    body: {
      email: 'alex@example.com',
      password: 'WrongPassword123!',
    },
  });

  assert.equal(res.status, 401);
  assert.equal(res.data.success, false);
});

test('5. Role-Based Access Control - User cannot access Admin APIs', async () => {
  // Login as regular user
  const loginRes = await request('/auth/login', {
    method: 'POST',
    body: {
      email: 'alex@example.com',
      password: 'User@12345',
    },
  });

  const userToken = loginRes.data.token;

  // Attempt to access admin dashboard with normal user token
  const adminRes = await request('/admin/dashboard', {
    headers: { Authorization: `Bearer ${userToken}` },
  });

  assert.equal(adminRes.status, 403, 'Normal user should get 403 Forbidden on admin route');
  assert.equal(adminRes.data.success, false);
});

test('6. Role-Based Access Control - Admin can access Admin Dashboard', async () => {
  // Login as Admin
  const loginRes = await request('/auth/login', {
    method: 'POST',
    body: {
      email: 'admin@imovies.com',
      password: 'Admin@12345',
    },
  });

  assert.equal(loginRes.status, 200);
  const adminToken = loginRes.data.token;

  const dashRes = await request('/admin/dashboard', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  assert.equal(dashRes.status, 200);
  assert.equal(dashRes.data.success, true);
  assert.ok(dashRes.data.stats, 'Dashboard statistics must be present');
});

test('7. End-to-End Booking Flow & Double-Booking Prevention', async () => {
  // 1. Login as user
  const userRes = await request('/auth/login', {
    method: 'POST',
    body: {
      email: 'alex@example.com',
      password: 'User@12345',
    },
  });
  const token = userRes.data.token;

  // 2. Fetch a show
  const showsRes = await request('/shows');
  assert.ok(showsRes.data.data.length > 0);
  const targetShow = showsRes.data.data[2]; // 3rd show

  // Choose a seat that is not yet booked
  const testSeat = 'B-B9';

  // 3. Book the seat
  const bookRes = await request('/bookings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: {
      showId: targetShow._id,
      seats: [{ seatId: testSeat, category: 'Balcony', price: targetShow.balconyPrice }],
      paymentMethod: 'Demo Card (Test)',
    },
  });

  assert.equal(bookRes.status, 201, 'Booking should succeed with 201');
  assert.equal(bookRes.data.success, true);
  assert.ok(bookRes.data.data.bookingReference, 'Should return reference');
  const bookingId = bookRes.data.data._id;

  // 4. ATTEMPT TO DOUBLE-BOOK THE EXACT SAME SEAT (Should fail with 409 Conflict)
  const doubleBookRes = await request('/bookings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: {
      showId: targetShow._id,
      seats: [{ seatId: testSeat, category: 'Balcony', price: targetShow.balconyPrice }],
      paymentMethod: 'Demo Card (Test)',
    },
  });

  assert.equal(doubleBookRes.status, 409, 'Double booking must return 409 Conflict');
  assert.equal(doubleBookRes.data.success, false);

  // 5. Test Booking Cancellation
  const cancelRes = await request(`/bookings/${bookingId}/cancel`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  assert.equal(cancelRes.status, 200, 'Cancellation should succeed');
  assert.equal(cancelRes.data.data.bookingStatus, 'Cancelled');

  // 6. Verify seat is released and can be booked again!
  const reBookRes = await request('/bookings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: {
      showId: targetShow._id,
      seats: [{ seatId: testSeat, category: 'Balcony', price: targetShow.balconyPrice }],
      paymentMethod: 'Demo Card (Test)',
    },
  });

  assert.equal(reBookRes.status, 201, 'Released seat should now be bookable again');
  assert.equal(reBookRes.data.success, true);
});
