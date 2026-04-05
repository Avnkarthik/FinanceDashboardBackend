const http = require('http');

const runTests = async () => {
  const baseUrl = 'http://localhost:5000/api';
  console.log('Testing APIs on:', baseUrl);

  // Helper to make requests
  const makeRequest = async (path, method = 'GET', body = null, cookie = null) => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: `/api${path}`,
        method,
        headers: {}
      };

      if (body) {
        options.headers['Content-Type'] = 'application/json';
      }
      if (cookie) {
        options.headers['Cookie'] = cookie;
      }

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          let parsed = {};
          try {
            parsed = JSON.parse(data);
          } catch(e) {
            parsed = data;
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        });
      });

      req.on('error', (e) => reject(e));

      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  };

  try {
    // 1. Register an Admin
    console.log('\n--- Registering Admin ---');
    const registerData = {
      name: 'Admin User',
      email: `admin_${Date.now()}@test.com`,
      password: 'password123',
      role: 'Admin'
    };
    const registerRes = await makeRequest('/auth/register', 'POST', registerData);
    console.log('Status:', registerRes.status);
    console.log('Response:', registerRes.data);

    let cookie = '';
    if (registerRes.headers['set-cookie']) {
      cookie = registerRes.headers['set-cookie'][0].split(';')[0];
    } else {
        console.log('Wait, logging in to get cookie explicitly...');
        const loginRes = await makeRequest('/auth/login', 'POST', { email: registerData.email, password: registerData.password });
        cookie = loginRes.headers['set-cookie'][0].split(';')[0];
    }
    
    console.log('Obtained Cookie:', cookie);

    // 2. Create a Financial Record
    console.log('\n--- Creating Financial Record ---');
    const recordData = {
      amount: 1500,
      type: 'Income',
      category: 'Salary',
      date: new Date().toISOString(),
      notes: 'Monthly salary'
    };
    const createRes = await makeRequest('/finance', 'POST', recordData, cookie);
    console.log('Status:', createRes.status);
    console.log('Response:', JSON.stringify(createRes.data, null, 2));

    // 3. Get Records
    console.log('\n--- Fetching Records ---');
    const getRes = await makeRequest('/finance', 'GET', null, cookie);
    console.log('Status:', getRes.status);
    console.log('Response:', JSON.stringify(getRes.data, null, 2));

    // 4. Get Dashboard Summary
    console.log('\n--- Fetching Dashboard Summary ---');
    const summaryRes = await makeRequest('/finance/dashboard/summary', 'GET', null, cookie);
    console.log('Status:', summaryRes.status);
    console.log('Response:', JSON.stringify(summaryRes.data, null, 2));

  } catch (err) {
    console.error('Test script error:', err.message);
  }
};

runTests();
