document.addEventListener('DOMContentLoaded', () => {
  const stocksData = JSON.parse(stockContent); // from stocks-complete.js
  const userData = JSON.parse(userContent);    // from users.js

  // Cache common DOM elements
  const saveButton = document.querySelector('#btnSave');
  const deleteButton = document.querySelector('#btnDelete');
  const userList = document.querySelector('.user-list');
  const portfolioDetails = document.querySelector('.portfolio-list');

  // Initial render
  generateUserList(userData);

  // --- EVENT LISTENERS (registered ONCE) ---
  userList.addEventListener('click', (event) => handleUserListClick(event, userData, stocksData));

  portfolioDetails.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
      viewStock(event.target.id, stocksData);
    }
  });

  saveButton.addEventListener('click', (e) => {
    e.preventDefault();
    handleSave(userData, stocksData);
  });

  deleteButton.addEventListener('click', (e) => {
    e.preventDefault();
    handleDelete(userData, stocksData);
  });
  // --- END EVENT LISTENERS ---

});

// -------------------------------
// FUNCTIONS
// -------------------------------

function generateUserList(users) {
  const userList = document.querySelector('.user-list');
  userList.innerHTML = ''; // Clear existing users before re-rendering

  users.forEach(({ user, id }) => {
    const li = document.createElement('li');
    li.innerText = `${user.lastname}, ${user.firstname}`;
    li.setAttribute('id', id);
    userList.appendChild(li);
  });
}

function handleUserListClick(event, users, stocks) {
  const userId = event.target.id;
  if (!userId) return; // Clicked outside of an li
  const userObj = users.find(u => u.id == userId);
  if (!userObj) return;

  populateForm(userObj);
  renderPortfolio(userObj, stocks);
}

function populateForm(data) {
  const { user, id } = data;
  document.querySelector('#userID').value = id;
  document.querySelector('#firstname').value = user.firstname || '';
  document.querySelector('#lastname').value = user.lastname || '';
  document.querySelector('#address').value = user.address || '';
  document.querySelector('#city').value = user.city || '';
  document.querySelector('#email').value = user.email || '';
}

function renderPortfolio(userObj, stocks) {
  const { portfolio } = userObj;
  const portfolioDetails = document.querySelector('.portfolio-list');

  // Rebuild header + clear old rows
  portfolioDetails.innerHTML = `
    <h3>Symbol</h3>
    <h3># Shares</h3>
    <h3>Actions</h3>
  `;

  // Render portfolio rows
  portfolio.forEach(({ symbol, owned }) => {
    const symbolEl = document.createElement('p');
    symbolEl.innerText = symbol;

    const sharesEl = document.createElement('p');
    sharesEl.innerText = owned;

    const actionEl = document.createElement('button');
    actionEl.innerText = 'View';
    actionEl.setAttribute('id', symbol);

    portfolioDetails.appendChild(symbolEl);
    portfolioDetails.appendChild(sharesEl);
    portfolioDetails.appendChild(actionEl);
  });
}

function viewStock(symbol, stocks) {
  const stockArea = document.querySelector('.stock-form');
  if (!stockArea) return;

  const stock = stocks.find(s => s.symbol == symbol);
  const logoEl = document.querySelector('#logo');

  if (!stock) {
    document.querySelector('#stockName').textContent = 'Not found';
    document.querySelector('#stockSector').textContent = '';
    document.querySelector('#stockIndustry').textContent = '';
    document.querySelector('#stockAddress').textContent = '';
    logoEl.src = 'logos/default.svg';
    return;
  }

  document.querySelector('#stockName').textContent = stock.name || '';
  document.querySelector('#stockSector').textContent = stock.sector || '';
  document.querySelector('#stockIndustry').textContent = stock.subIndustry || '';
  document.querySelector('#stockAddress').textContent = stock.address || '';

  // Set logo with fallback
  logoEl.src = `logos/${symbol}.svg`;
  logoEl.onerror = () => { logoEl.src = 'logos/default.svg'; };
}

function handleSave(users, stocks) {
  const id = document.querySelector('#userID').value;
  if (!id) return alert('Select a user first');

  const userIndex = users.findIndex(u => u.id == id);
  if (userIndex === -1) return;

  users[userIndex].user.firstname = document.querySelector('#firstname').value;
  users[userIndex].user.lastname = document.querySelector('#lastname').value;
  users[userIndex].user.address = document.querySelector('#address').value;
  users[userIndex].user.city = document.querySelector('#city').value;
  users[userIndex].user.email = document.querySelector('#email').value;

  // Re-render user list so names update
  generateUserList(users);
}

function handleDelete(users, stocks) {
  const userId = document.querySelector('#userID').value;
  if (!userId) return alert('Select a user first');

  const userObj = users.find(u => u.id == userId);
  if (!userObj) return;

  // Confirm before deletion
  const confirmDelete = confirm(`Are you sure you want to delete user: ${userObj.user.firstname} ${userObj.user.lastname}?`);
  if (!confirmDelete) return;

  const index = users.findIndex(u => u.id == userId);
  if (index !== -1) users.splice(index, 1);

  // Clear form and portfolio area
  document.querySelector('.userEntry').reset();
  document.querySelector('.portfolio-list').innerHTML = `
    <h3>Symbol</h3>
    <h3># Shares</h3>
    <h3>Actions</h3>
  `;

  // Re-render user list
  generateUserList(users);
}
