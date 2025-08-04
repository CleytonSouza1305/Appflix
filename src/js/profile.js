async function profileData(token, id) {
  const loader = document.getElementById("loading");
  loader.classList.remove("display");

  try {
    const response = await fetch(
      `https://appflix-api.onrender.com/api/profiles/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(`Erro na requisição, motivo: ${data.message}`);
      return;
    }

    return data;
  } catch (e) {
    console.error(`Erro ao buscar perfil por id, motivo: ${e}`);
  } finally {
    loader.classList.add("display");
  }
}

async function startApp(token, profileId) {
  const data = await profileData(token, profileId)
  const h1 = document.querySelector('h1')
  h1.textContent = `Bem vindo, ${data.profile_name}`
  console.log(data)
}

const token = localStorage.getItem('token')
if (!token) {
  localStorage.removeItem('profileId')
  location.href = './login.html'
} else {
  const profileId = localStorage.getItem('profileId')
  if (!profileId) {
    location.href = './browse.html'
  } else {
    startApp(token, profileId)
  }
}

