const USERS_KEY = 'pulse_users';
const CURRENT_USER_KEY = 'pulse_current_user';

const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const authContent = document.getElementById('authContent');
const dashboard = document.getElementById('dashboard');
const statusMessage = document.getElementById('statusMessage');
const formTitle = document.getElementById('formTitle');
const welcomeName = document.getElementById('welcomeName');
const lastLoginLabel = document.getElementById('lastLoginLabel');
const logoutBtn = document.getElementById('logoutBtn');

function showStatus(message, type = 'success') {
  statusMessage.textContent = message;
  statusMessage.className = `status-message visible ${type}`;

  clearTimeout(showStatus.timeoutId);
  showStatus.timeoutId = setTimeout(() => {
    statusMessage.className = 'status-message';
  }, 2200);
}

function setCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

function getCurrentUser() {
  const saved = localStorage.getItem(CURRENT_USER_KEY);
  return saved ? JSON.parse(saved) : null;
}

function getUsers() {
  const saved = localStorage.getItem(USERS_KEY);
  return saved ? JSON.parse(saved) : [];
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function seedDemoUser() {
  const users = getUsers();

  if (!users.some((user) => user.email === 'demo@pulse.com')) {
    users.push({
      name: 'Demo User',
      email: 'demo@pulse.com',
      password: 'demo1234',
    });
    saveUsers(users);
  }
}

function switchForm(mode) {
  const loginVisible = mode === 'login';
  formTitle.textContent = loginVisible ? 'Sign in' : 'Create account';

  loginForm.classList.toggle('active', loginVisible);
  signupForm.classList.toggle('active', !loginVisible);
}

function syncDashboard() {
  const user = getCurrentUser();

  if (user) {
    authContent.classList.add('hidden');
    dashboard.classList.remove('hidden');
    welcomeName.textContent = user.name;
    lastLoginLabel.textContent = `Logged in as ${user.email}`;
    return;
  }

  authContent.classList.remove('hidden');
  dashboard.classList.add('hidden');
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value.trim();

  if (!email || !password) {
    showStatus('Please enter both email and password.', 'error');
    return;
  }

  if (!validateEmail(email)) {
    showStatus('Please enter a valid email address.', 'error');
    return;
  }

  const users = getUsers();
  const foundUser = users.find(
    (user) => user.email.toLowerCase() === email && user.password === password,
  );

  if (!foundUser) {
    showStatus('Incorrect email or password. Try again.', 'error');
    return;
  }

  setCurrentUser(foundUser);
  syncDashboard();
  loginForm.reset();
  showStatus(`Welcome back, ${foundUser.name}!`, 'success');
});

signupForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim().toLowerCase();
  const password = document.getElementById('signupPassword').value.trim();
  const confirmPassword = document.getElementById('signupConfirm').value.trim();

  if (!name || !email || !password || !confirmPassword) {
    showStatus('Please complete all fields to create your account.', 'error');
    return;
  }

  if (!validateEmail(email)) {
    showStatus('Please use a valid email address.', 'error');
    return;
  }

  if (password.length < 8) {
    showStatus('Password must be at least 8 characters long.', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showStatus('Passwords do not match. Please try again.', 'error');
    return;
  }

  const users = getUsers();
  const userExists = users.some((user) => user.email.toLowerCase() === email);

  if (userExists) {
    showStatus('This email is already registered. Please sign in instead.', 'error');
    return;
  }

  const newUser = { name, email, password };
  users.push(newUser);
  saveUsers(users);

  signupForm.reset();
  switchForm('login');
  showStatus('Account created successfully. You can now sign in.', 'success');
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem(CURRENT_USER_KEY);
  syncDashboard();
  switchForm('login');
  showStatus('You have been signed out.', 'success');
});

document.querySelectorAll('[data-mode]').forEach((button) => {
  button.addEventListener('click', () => {
    switchForm(button.dataset.mode);
  });
});

seedDemoUser();
syncDashboard();
switchForm('login');
