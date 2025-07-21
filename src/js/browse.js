const token = localStorage.getItem('token')

async function searchProfile(token) {
  const loader = document.getElementById('loading')
  loader.classList.remove('display')

  try {
    const response = await fetch(`https://appflix-api.onrender.com/api/profiles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error(response.message)
    }

    const data = await response.json()
    return data

  } catch (e) {
    console.error(`Erro na requisição, motivo: ${e}`)
    location.href = './login.html'
  } finally {
    loader.classList.add('display')
  }
}

function createCardProfile(data) {
  const container = document.querySelector('.profile-content');
  if (!container) return;

  container.innerHTML = '';

  for (let i = 0; i < data.length; i++) {
    const { id, avatarUrl, profileName, profilePin } = data[i];

    const card = document.createElement('div');
    card.classList.add('card');

    const infoContainer = document.createElement('div');
    infoContainer.classList.add('info-container');
    infoContainer.dataset.profile = id;

    const contentImage = document.createElement('div');
    contentImage.classList.add('content-image');
    const img = document.createElement('img');
    img.src = avatarUrl;
    img.alt = profileName;
    contentImage.appendChild(img);

    const name = document.createElement('p');
    name.classList.add('profile-name');
    name.innerText = profileName;

    infoContainer.append(contentImage, name);

    const contentBottom = document.createElement('div');
    contentBottom.classList.add('bottom-container');
    const lockIcon = document.createElement('i');
    lockIcon.className = 'fa-solid fa-lock';
    contentBottom.appendChild(lockIcon);

    if (profilePin === null) {
      contentBottom.classList.add('display');
    }

    card.appendChild(infoContainer);
    card.appendChild(contentBottom);
    container.appendChild(card);
  }

  if (data.length < 5) {
    const moreProfile = document.createElement('div');
    moreProfile.classList.add('more-profile-btn');
    moreProfile.innerHTML = `<i class="fa-solid fa-plus"></i>`;
    container.append(moreProfile);
  }
}

async function startApp(token) {
  const data = await searchProfile(token)
  createCardProfile(data)
}

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token')

  if (!token) {
    location.href = './login.html'
  } else {
    startApp(token)
  }
})