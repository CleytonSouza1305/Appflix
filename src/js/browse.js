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

    const editProfile = document.createElement('div')
    editProfile.classList.add('edit-profile-div', 'display')
    editProfile.dataset.profileId = id

    const editIcon = document.createElement('i')
    editIcon.classList.add('fa-solid', 'fa-pencil')

    editProfile.appendChild(editIcon)

    const infoContainer = document.createElement('div');
    infoContainer.classList.add('info-container');

    const contentImage = document.createElement('div');
    contentImage.classList.add('content-image');
    const img = document.createElement('img');
    img.src = avatarUrl;
    img.alt = 'Nome do perfil de ' + profileName;
    contentImage.append(img, editProfile);

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

async function createProfileReq(token, profileName, profilePin, isKid) {
  const loader = document.getElementById('loading')
  loader.classList.remove('display')

  try {
    const response = await fetch(`https://appflix-api.onrender.com/api/profiles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
       Authorization: `Bearer ${token}`
      },
    body: JSON.stringify({ profileName, profilePin, isKid })
    })

    const messageError = document.querySelector('.error-message')
    messageError.textContent = ''

    const data = await response.json()

    if (!response.ok) {
      messageError.textContent = data.message
      return
    }

  } catch (e) {
    console.error(`Erro ao criar perfil, motivo: ${e}`)
  } finally {
    loader.classList.add('display')
  }
}

function createProfile(token) {
  const content = document.querySelector('.more-profile-content')

  const addProfile = document.querySelector('.more-profile-btn')
  if (addProfile) {
    addProfile.addEventListener('click', () => {
    const cancelBtn = document.querySelector('.cancel-button')
    cancelBtn.addEventListener('click', () => {
      content.classList.add('display')
    })
    content.classList.toggle('display')

    const form = document.getElementById('profile-form')
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault()

      const profileName = document.getElementById('profileName').value
      const profilePin = document.getElementById('profilePin').value
      const isKidInput = document.getElementById('isKid')
      let isKid = isKidInput.checked

      createProfileReq(token, profileName, profilePin, isKid)

      profileName.value = ''
      profilePin.value = ''

      content.classList.add('display')

      const data = await searchProfile()
      createCardProfile(data)
    })
  })
  }
}

async function profileData(token, id) {
  const loader = document.getElementById('loading')
  loader.classList.remove('display')

  try {
    const response = await fetch(`https://appflix-api.onrender.com/api/profiles/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
         Authorization: `Bearer ${token}`
      }
    })

    const messageError = document.querySelector('.error-message')
    messageError.textContent = ''

    const data = await response.json()

    if (!response.ok) {
      messageError.textContent = data.message
      return
    }

    return data

  } catch (e) {
    console.error(`Erro ao buscar perfil por id, motivo: ${e}`)
  } finally {
    loader.classList.add('display')
  }
}

async function editProfile(token) {

  const manageProfile = document.getElementById('manage-profile-btn')
  manageProfile.addEventListener(('click'), (btn) => {
    btn.currentTarget.textContent = 'Cancel'

    const contents = document.querySelectorAll('.edit-profile-div')
    contents.forEach((content) => {
      content.classList.remove('display')
      content.addEventListener('click', async (ev) => {
        const currentContent = ev.currentTarget
        const id = currentContent.dataset.profileId

        const data = await profileData(token, id)
        
        const content = document.querySelector('.edit-profile-content')
        if (!content) {
          return
        }

        content.classList.remove('display')
        console.log(data)

        const profileName = document.getElementById('editedName')
        profileName.value = data.profile_name

        const profilePin = document.getElementById('editPin')
        profilePin.value = data.profile_pin

        const isKid = document.getElementById('isKidEdited')
        isKid.checked = data.is_kid

        const image = document.getElementById('user-image')
        image.src = data.avatar_link

        const cancelBtn = document.getElementById('cancel-edit')
        cancelBtn.addEventListener('click', () => {
          content.classList.add('display')
        })
      })
    })
  })
}


async function startApp(token) {
  const data = await searchProfile(token)
  createCardProfile(data)

  createProfile(token)
  editProfile(token)
}

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token')

  if (!token) {
    location.href = './login.html'
  } else {
    startApp(token)
  }
})