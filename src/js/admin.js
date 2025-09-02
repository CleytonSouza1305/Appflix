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

async function getUsers(token, query) {
  const loader = document.getElementById("loading");
  loader.classList.remove("display");

  try {
    let url;

    if (query) {
      url = `https://appflix-api.onrender.com/auth/users${query}`;
    } else {
      url = `https://appflix-api.onrender.com/auth/users`;
    }
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

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

async function searchUser(token) {
  const section = document.querySelector(".table-section");
  section.innerHTML = "";

  const h2 = document.createElement("h2");
  h2.textContent = "Buscar usuário";

  const table = document.createElement("table");

  const header = document.createElement("header");
  header.classList.add("header-usuarios");
  header.innerHTML = "";

  const span = document.createElement("span");
  span.textContent = "Buscar:";

  const searchForm = document.createElement("form");
  const input = document.createElement("input");
  input.id = "search-user-input";
  input.type = "text";
  input.placeholder = "Buscar usuário por nome/email";

  const sbmButton = document.createElement("button");
  sbmButton.id = "search-btn";
  sbmButton.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';

  searchForm.addEventListener("submit", async (ev) => {
    ev.preventDefault();

    const input = document.getElementById("search-user-input");
    const value = input.value.trim();

    if (!value) return;

    const response = await getUsers(token, `?search=${value}&limit=5`);
    const users = response.users;
    console.log(users);

    input.value = "";
    table.innerHTML = "";

    const oldMsg = section.querySelector(".not-found-user");
    if (oldMsg) oldMsg.remove();

    if (users.length < 1) {
      const notFound = document.createElement("h3");
      notFound.classList.add("not-found-user");

      notFound.textContent = "Nenhum usuário encontrado.";

      section.append(notFound);
      return;
    }

    section.append(table);

    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr>
        <th>Nome</th>
        <th>Email</th>
        <th>Telefone</th>
        <th>Plano</th>
        <th>Status</th>
        <th>Criado em</th>
      </tr>
    `;

    const tbody = document.createElement("tbody");
    users.forEach((u) => {
      const tr = document.createElement("tr");

      const createdAt = new Date(u.createdAt);
      const createdAtTxt = createdAt.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      let userStatus = "Ativo";

      if (!u.isActive) userStatus = "Inativo";

      tr.innerHTML = `
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${u.phone}</td>
        <td>${u.plan}</td>
        <td>${userStatus}</td>
        <td>${createdAtTxt}</td>
      `;

      tbody.append(tr);
    });

    table.append(thead, tbody);

    const oldPaginator = section.querySelector(".change-container");
    if (oldPaginator) oldPaginator.remove();

    const changeContainer = document.createElement("div");
    changeContainer.classList.add("change-container");

    const totalPages = response.pagination.totalPages;
    const currentPage = response.pagination.page

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    for (let i = startPage; i <= endPage; i++) {
      const page = document.createElement("span");
      page.textContent = i;
      page.dataset.page = i;
      page.classList.add("page-btn");
      if (i === currentPage) page.classList.add("page-active"); 

      changeContainer.appendChild(page);
    }

    section.append(changeContainer);
  });

  searchForm.append(input, sbmButton);
  header.append(span, searchForm);
  section.append(h2, header);
}

async function insertAdminData(token, adminData) {
  const adminName = document.querySelector(".admin-name").children[0];
  adminName.innerText = adminData.name;

  const leaveAdmPainel = document.querySelector(".logout-btn");
  leaveAdmPainel.addEventListener(
    "click",
    () => (location.href = "./browse.html")
  );

  const response = await getUsers(token);
  console.log(response);

  const totalUsers = document.getElementById("total-users");
  totalUsers.textContent = response.pagination.total;

  const activeResponse = await getUsers(token, "?isActive=true");

  const activeUsers = document.getElementById("active-users");
  activeUsers.textContent = activeResponse.pagination.total;

  const adminTotal = document.getElementById("admin-total");
  adminTotal.textContent =
    response.pagination.totalUsers - response.pagination.total;

  const tbody = document.getElementById("users-table");

  response.users.forEach((user) => {
    const tr = document.createElement("tr");

    let userStatus = "Ativo";

    if (!user.isActive) userStatus = "Inativo";

    tr.innerHTML = `
      <td>${user.id}</td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.plan}</td>
      <td>${userStatus}</td>
    `;

    tbody.append(tr);
  });

  const linksPage = document.querySelectorAll(".dashboard-link");
  linksPage.forEach((link) => {
    link.addEventListener("click", (e) => {
      linksPage.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      const id = e.currentTarget.id;

      switch (id) {
        case "dashboard":
          console.log("dashboard");
          break;

        case "usuarios":
          searchUser(token);
          break;

        case "conteudo":
          console.log("conteudo");
          break;

        case "planos":
          console.log("planos");
          break;

        case "configs":
          console.log("configs");
          break;

        default:
          break;
      }
    });
  });
}

async function startApp(token, userData) {
  console.log(userData);
  insertAdminData(token, userData);
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
