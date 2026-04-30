import { router } from "../core/router";
import loaderUserListItemHtml from "../components/demo/loader-user-list-item.html?raw";
import loaderUserDetailsLoadingHtml from "../components/demo/loader-user-details-loading.html?raw";
import loaderUserDetailsHtml from "../components/demo/loader-user-details.html?raw";
import errorMessageHtml from "../components/demo/error-message.html?raw";

export function initializeLoaderExamples(): void {
  setupLoaderButtons();

  router.subscribe(() => {
    setTimeout(() => {
      setupLoaderButtons();
    }, 50);
  });
}

function setupLoaderButtons(): void {
  const buttons = document.querySelectorAll('#loader-basic-btn, #loader-message-btn, #loader-dots-btn, #loader-custom-btn, #loader-contained-btn, #loader-fetch-btn');

  buttons.forEach((btn: Element) => {
    const newBtn = btn.cloneNode(true) as HTMLElement;
    btn.replaceWith(newBtn);
  });

  const loaderBasicBtn = document.getElementById('loader-basic-btn');
  const loaderMessageBtn = document.getElementById('loader-message-btn');
  const loaderDotsBtn = document.getElementById('loader-dots-btn');
  const loaderCustomBtn = document.getElementById('loader-custom-btn');
  const loaderContainedBtn = document.getElementById('loader-contained-btn');
  const loaderFetchBtn = document.getElementById('loader-fetch-btn');

  loaderBasicBtn?.addEventListener('click', (e: Event) => {
    e.stopPropagation();
    const loader = document.createElement('ui-loader');
    document.body.appendChild(loader);
    setTimeout(() => loader.remove(), 2000);
  });

  loaderMessageBtn?.addEventListener('click', (e: Event) => {
    e.stopPropagation();
    const loader = document.createElement('ui-loader');
    loader.setAttribute('message', 'Loading data...');
    document.body.appendChild(loader);
    setTimeout(() => loader.remove(), 2000);
  });

  loaderDotsBtn?.addEventListener('click', (e: Event) => {
    e.stopPropagation();
    const loader = document.createElement('ui-loader');
    loader.setAttribute('message', 'Processing...');
    loader.setAttribute('variant', 'dots');
    document.body.appendChild(loader);
    setTimeout(() => loader.remove(), 2000);
  });

  loaderCustomBtn?.addEventListener('click', (e: Event) => {
    e.stopPropagation();
    const loader = document.createElement('ui-loader');
    loader.setAttribute('message', 'Custom loader');
    loader.setAttribute('size', '64px');
    loader.setAttribute('color', '#FF8C00');
    document.body.appendChild(loader);
    setTimeout(() => loader.remove(), 2000);
  });

  loaderContainedBtn?.addEventListener('click', (e: Event) => {
    e.stopPropagation();
    const container = document.getElementById('loader-container');
    if (container) {
      const loader = document.createElement('ui-loader');
      loader.setAttribute('contained', '');
      loader.setAttribute('message', 'Loading content...');
      container.appendChild(loader);
      setTimeout(() => loader.remove(), 2000);
    }
  });

  loaderFetchBtn?.addEventListener('click', (e: Event) => {
    e.stopPropagation();
    fetchAndDisplayUsers();
  });
}

async function fetchAndDisplayUsers(): Promise<void> {
  const loader = document.createElement('ui-loader');
  loader.setAttribute('message', 'Fetching users...');
  document.body.appendChild(loader);

  const listContainer = document.getElementById('users-list-container');
  const usersList = document.getElementById('users-list');
  const errorDiv = document.getElementById('users-error');

  if (!usersList || !listContainer || !errorDiv) return;

  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    const users = await response.json() as Array<{
      id: number;
      name: string;
      email: string;
      phone: string;
      website: string;
      company: { name: string };
      address: { street: string; city: string; zipcode: string };
      username: string;
    }>;

    usersList.innerHTML = '';
    errorDiv.style.display = 'none';

    users.forEach((user) => {
      const li = document.createElement('li');
      li.style.padding = '12px';
      li.style.borderBottom = '1px solid var(--ui-border)';
      li.style.cursor = 'pointer';
      li.style.transition = 'background-color 200ms ease';
      li.innerHTML = loaderUserListItemHtml
        .replace('{{name}}', user.name)
        .replace('{{email}}', user.email);

      li.addEventListener('mouseover', () => {
        li.style.backgroundColor = 'var(--ui-surface-hover, rgba(0, 0, 0, 0.03))';
      });
      li.addEventListener('mouseout', () => {
        li.style.backgroundColor = 'transparent';
      });

      li.addEventListener('click', () => {
        showUserModal({
          id: user.id,
          name: user.name,
          email: user.email
        });
      });

      usersList.appendChild(li);
    });

    listContainer.style.display = 'block';
  } catch (error) {
    usersList.innerHTML = '';
    listContainer.style.display = 'none';
    errorDiv.style.display = 'block';
    errorDiv.textContent = `Error loading users: ${error instanceof Error ? error.message : 'Unknown error'}`;
  } finally {
    loader.remove();
  }
}

function showUserModal(user: {
  id: number;
  name: string;
  email: string;
}): void {
  const modal = document.createElement('ui-modal');
  modal.setAttribute('title', user.name);
  modal.setAttribute('close-on-escape', 'true');
  modal.setAttribute('close-on-overlay', 'true');

  document.body.appendChild(modal);

  const content = document.createElement('div');
  content.innerHTML = loaderUserDetailsLoadingHtml;
  modal.appendChild(content);

  fetchUserDetails(user.id, content);
}

async function fetchUserDetails(userId: number, contentElement: HTMLElement): Promise<void> {
  try {
    const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch user details');

    const user = await response.json() as {
      id: number;
      name: string;
      username: string;
      email: string;
      phone: string;
      website: string;
      company: { name: string; catchPhrase: string; bs: string };
      address: { street: string; suite: string; city: string; zipcode: string; geo: { lat: string; lng: string } };
    };

    contentElement.innerHTML = loaderUserDetailsHtml
      .replace(/\{\{website\}\}/g, user.website)
      .replace('{{email}}', user.email)
      .replace('{{phone}}', user.phone)
      .replace('{{username}}', user.username)
      .replace('{{street}}', user.address.street)
      .replace('{{suite}}', user.address.suite)
      .replace('{{city}}', user.address.city)
      .replace('{{zipcode}}', user.address.zipcode)
      .replace('{{lat}}', user.address.geo.lat)
      .replace('{{lng}}', user.address.geo.lng)
      .replace('{{company_name}}', user.company.name)
      .replace('{{catch_phrase}}', user.company.catchPhrase)
      .replace('{{bs}}', user.company.bs)
      .replace('{{id}}', String(user.id));
  } catch (error) {
    contentElement.innerHTML = errorMessageHtml
      .replace('{{message}}', `Error loading user details: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
