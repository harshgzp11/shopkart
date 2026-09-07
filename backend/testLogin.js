async function testLogin() {
  try {
    const res = await fetch('http://127.0.0.1:5000/customers/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'harshgzp11@gmail.com',
        password: 'password123'
      })
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", data);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testLogin();
