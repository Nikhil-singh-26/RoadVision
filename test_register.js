const axios = require('axios');

async function testRegister() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Test Officer',
      email: 'test' + Date.now() + '@gov.in',
      password: 'password123',
      role: 'officer'
    });
    console.log("Success:", res.data);
  } catch (err) {
    if (err.response) {
      console.log("Error status:", err.response.status);
      console.log("Error data:", err.response.data);
    } else {
      console.log("General error:", err.message);
    }
  }
}

testRegister();
