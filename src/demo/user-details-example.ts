import userDetailModalContentHtml from "../components/demo/user-detail-modal-content.html?raw";
import errorMessageHtml from "../components/demo/error-message.html?raw";

export function initializeUsersDetails(): void {
  fetchAndDisplayUsersList();
}

async function fetchAndDisplayUsersList(): Promise<void> {
  const usersList = document.getElementById('users-list-sidebar');
  if (!usersList) return;

  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    if (!response.ok) throw new Error('Failed to fetch users');
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

    const ul = document.createElement('ul');
    users.forEach((user) => {
      const li = document.createElement('li');
      li.dataset.userId = user.id.toString();
      li.textContent = user.name;
      li.addEventListener('click', () => selectUser(user, li));
      ul.appendChild(li);
    });

    usersList.innerHTML = '';
    usersList.appendChild(ul);

    if (users.length > 0) {
      const firstLi = ul.querySelector('li') as HTMLElement;
      firstLi?.click();
    }
  } catch (error) {
    usersList.innerHTML = errorMessageHtml
      .replace('{{message}}', `Error loading users: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function selectUser(
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
    website: string;
    company: { name: string };
    address: { street: string; city: string; zipcode: string };
    username: string;
  },
  listItem: HTMLElement
): void {
  document.querySelectorAll('#users-list-sidebar li').forEach((li) => {
    li.classList.remove('active');
  });
  listItem.classList.add('active');

  showUserModal(user);
}

function showUserModal(user: {
  id: number;
  name: string;
  email: string;
  phone: string;
  website: string;
  company: { name: string };
  address: { street: string; city: string; zipcode: string };
  username: string;
}): void {
  const modal = document.createElement('ui-modal');
  modal.setAttribute('title', user.name);
  modal.setAttribute('close-on-escape', 'true');
  modal.setAttribute('close-on-overlay', 'true');

  const content = document.createElement('div');
  content.setAttribute('slot', 'content');
  content.innerHTML = userDetailModalContentHtml
    .replace('{{email}}', user.email)
    .replace('{{username}}', user.username)
    .replace('{{phone}}', user.phone)
    .replace('{{website}}', user.website || 'N/A')
    .replace('{{company}}', user.company.name)
    .replace('{{street}}', user.address.street)
    .replace('{{city}}', user.address.city)
    .replace('{{zipcode}}', user.address.zipcode);

  modal.appendChild(content);
  document.body.appendChild(modal);
}
