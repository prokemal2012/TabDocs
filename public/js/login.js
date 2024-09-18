document.getElementById('loginForm').addEventListener('submit', function(event) {
  // Basic form validation or custom logic before submitting
  const username = document.querySelector('input[name="username"]').value;
  const password = document.querySelector('input[name="password"]').value;

  if (username === '' || password === '') {
    alert('Please fill in all fields.');
    event.preventDefault();
  }
});
