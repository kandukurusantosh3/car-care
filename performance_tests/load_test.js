import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  // 100 virtual users running continuously for 1 minute
  vus: 100,
  duration: '1m',
  
  // Define thresholds to pass/fail the test based on performance
  thresholds: {
    // 95% of requests must complete below 300ms
    http_req_duration: ['p(95)<300'],
    // Error rate must be less than 1%
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  // Target the backend API health check or frontend
  const res = http.get('https://car-care-4jpk.onrender.com/api/health');
  
  check(res, {
    'is status 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  // Short sleep to simulate real user wait time between requests
  // For maximum stress test without pausing, you can reduce this.
  sleep(1);
}
