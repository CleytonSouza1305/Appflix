async function userData(token, id) {
  const loader = document.getElementById("loading");
  loader.classList.remove("display");

  try {
    const response = await fetch(
      `https://appflix-api.onrender.com/auth/users/${id}`,
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
      location.href = "./login.html";
      return;
    }

    return data;
  } catch (e) {
    console.error(`Erro ao buscar perfil por id, motivo: ${e}`);
  } finally {
    loader.classList.add("display");
  }
}

function insertAdminData(adminData) {
  const adminName = document.querySelector(".admin-name").children[0]
  adminName.innerText = adminData.name

  const leaveAdmPainel = document.querySelector('.logout-btn')
  leaveAdmPainel.addEventListener('click', () => location.href = "./browse.html")
}

async function startApp(token, userData) {
  console.log(userData)
  insertAdminData(userData)
}

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const user = await userData(token, localStorage.getItem("userId"));

  if (!token || !user) {
    location.href = "./login.html";
  } else {
    startApp(token, user); 
  }
});