document.getElementById('registerForm').addEventListener('submit', function(event) {
  const username = document.querySelector('input[name="username"]').value;
  const password = document.querySelector('input[name="password"]').value;

  if (username === '' || password === '') {
    alert('Please fill in all fields.');
    event.preventDefault();
  } else if (password.length < 6) {
    alert('Password must be at least 6 characters long.');
    event.preventDefault();
  }
});
