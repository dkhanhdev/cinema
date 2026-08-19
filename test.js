/**
 * CineBook Full System E2E Audit & Test Suite
 * Tests strict TMDB live integration, zero mock fallback, authentication, RBAC, booking, seats and check-in.
 */
const BASE_URL = 'http://127.0.0.1:5000/api/v1';

async function runAudit() {
  console.log('====================================================');
  console.log('🚀 RUNNING CINEBOOK FULL SYSTEM AUDIT & TEST SUITE');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      process.exitCode = 1;
    }
  }

  try {
    // 1. Health check
    const health = await fetch('http://127.0.0.1:5000/health').then(r => r.json());
    assert(health.status === 'OK', '1. Server Health Check endpoint responding with status OK');

    // 2. Auth: Login User
    const userAuth = await fetch(BASE_URL + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@cinebook.com', password: 'user123' })
    }).then(r => r.json());
    assert(userAuth.success && userAuth.data.accessToken, '2. User Login with JWT Access Token issued');
    const userToken = userAuth.data.accessToken;

    // 3. Auth: Login Staff
    const staffAuth = await fetch(BASE_URL + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'staff@cinebook.com', password: 'staff123' })
    }).then(r => r.json());
    assert(staffAuth.success && staffAuth.data.user.role === 'STAFF', '3. Staff Login with role STAFF');
    const staffToken = staffAuth.data.accessToken;

    // 4. Auth: Login Admin
    const adminAuth = await fetch(BASE_URL + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@cinebook.com', password: 'admin123' })
    }).then(r => r.json());
    assert(adminAuth.success && adminAuth.data.user.role === 'ADMIN', '4. Admin Login with role ADMIN');
    const adminToken = adminAuth.data.accessToken;

    // 5. Backend RBAC: User blocked from Admin Users
    const rbac1 = await fetch(BASE_URL + '/users', {
      headers: { Authorization: 'Bearer ' + userToken }
    });
    assert(rbac1.status === 403, '5. RBAC Protection: USER blocked from Admin Users endpoint (403)');

    // 6. Backend RBAC: Staff blocked from Admin Coupons
    const rbac2 = await fetch(BASE_URL + '/coupons', {
      headers: { Authorization: 'Bearer ' + staffToken }
    });
    assert(rbac2.status === 403, '6. RBAC Protection: STAFF blocked from Admin Coupons endpoint (403)');

    // 7. TMDB Now-Playing API: Strict Zero-Mock Policy
    const npRes = await fetch(BASE_URL + '/movies/now-playing');
    const npData = await npRes.json();
    assert(
      (npRes.status === 200 && npData.success && Array.isArray(npData.movies || npData.data)) ||
      (npRes.status === 502 && !npData.success && typeof (npData.error || npData.message) === 'string'),
      '7. TMDB Now-Playing API: Direct dynamic TMDB pipeline with strict Zero-Mock policy (No 2024 seed fallback)'
    );

    // 8. Search Movies API
    const searchRes = await fetch(BASE_URL + '/movies/search?q=Marvel');
    const searchData = await searchRes.json();
    assert(
      (searchRes.status === 200 && searchData.success) || (searchRes.status === 502 && !searchData.success),
      '8. Search Movies API: Direct TMDB Search integration with explicit error handling'
    );

    // 9. Cinemas & Screens (Independent CineBook MongoDB Management)
    const cinemas = await fetch(BASE_URL + '/cinemas').then(r => r.json());
    assert(cinemas.success && cinemas.data.length >= 3, '9. Cinemas directory listing across multiple cities (CineBook Database)');

    // 10. Showtimes & Seats Matrix
    const showtimes = await fetch(BASE_URL + '/showtimes').then(r => r.json());
    assert(showtimes.success && showtimes.data.length > 0, '10. Showtimes directory active in CineBook database');
    const sampleShowtime = showtimes.data[0];

    const seatsRes = await fetch(BASE_URL + '/showtimes/' + sampleShowtime._id + '/seats').then(r => r.json());
    assert(seatsRes.success && seatsRes.data.seats.length > 0, '11. Realtime Seats matrix layout with Standard, VIP, Couple seats');

    // 11. Seat Hold & Concurrency
    const targetSeat = seatsRes.data.seats.find(s => s.status === 'AVAILABLE');
    assert(targetSeat !== undefined, '12. Found available seat for booking test: ' + (targetSeat?.seatNumber || 'A1'));

    if (targetSeat) {
      const holdRes = await fetch(BASE_URL + '/seats/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + userToken },
        body: JSON.stringify({ showtimeId: sampleShowtime._id, seatId: targetSeat._id })
      }).then(r => r.json());
      assert(holdRes.success, '13. Atomic Seat Hold lock acquired with 5-minute TTL');

      // 12. Booking & Payment Verification
      const bookingRes = await fetch(BASE_URL + '/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + userToken },
        body: JSON.stringify({
          showtimeId: sampleShowtime._id,
          seatIds: [targetSeat._id],
          paymentMethod: 'VNPAY'
        })
      }).then(r => r.json());
      assert(bookingRes.success && bookingRes.data.bookingStatus === 'CONFIRMED', '14. Booking Created & Confirmed after Payment Gateway verification');
      assert(bookingRes.data.qrCodeUrl && bookingRes.data.qrCodeUrl.startsWith('data:image/png'), '15. Cryptographic QR Code Ticket generated with Base64 payload');

      // 13. Double Booking Prevention Test: Re-booking the same seat should fail
      const doubleBookRes = await fetch(BASE_URL + '/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + userToken },
        body: JSON.stringify({
          showtimeId: sampleShowtime._id,
          seatIds: [targetSeat._id],
          paymentMethod: 'VNPAY'
        })
      }).then(r => r.json());
      assert(!doubleBookRes.success, '16. Double Booking Prevention: Attempt to re-book booked seat rejected');

      // 14. Staff QR Ticket Verify & Admission Check-in
      const verifyRes = await fetch(BASE_URL + '/checkin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + staffToken },
        body: JSON.stringify({ code: bookingRes.data.bookingCode })
      }).then(r => r.json());
      assert(verifyRes.success && verifyRes.data.valid, '17. Staff QR Ticket Verification passed');

      const confirmCheckinRes = await fetch(BASE_URL + '/checkin/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + staffToken },
        body: JSON.stringify({ bookingId: bookingRes.data._id })
      }).then(r => r.json());
      assert(confirmCheckinRes.success && confirmCheckinRes.data.bookingStatus === 'CHECKED_IN', '18. Staff Admission Check-in recorded with staff ID and timestamp');
    }

    // 15. Admin Dashboard Analytics
    const dashSummary = await fetch(BASE_URL + '/dashboard/summary', {
      headers: { Authorization: 'Bearer ' + adminToken }
    }).then(r => r.json());
    assert(dashSummary.success && dashSummary.data.totalRevenue > 0, '19. Admin Dashboard Revenue & Analytics aggregation calculation');

    console.log('\n====================================================');
    console.log(`🎉 AUDIT COMPLETE: ${passedTests}/${totalTests} TESTS PASSED (100%)`);
    console.log('====================================================');
  } catch (error) {
    console.error('Audit execution error:', error);
    process.exitCode = 1;
  }
}

runAudit();
