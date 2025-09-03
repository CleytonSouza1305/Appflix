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
      return []
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
      // location.href = "./login.html";
      return;
    }

    return data;
  } catch (e) {
    console.error(`Erro ao buscar perfil por id, motivo: ${e}`);
  } finally {
    loader.classList.add("display");
  }
}

function renderTable(users, tbody) {
  tbody.innerHTML = "";

  users.forEach((u) => {
    const tr = document.createElement("tr");
    const createdAtData = u.createdAt || u.created_at

    const createdAt = new Date(createdAtData);
    const createdAtTxt = createdAt.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    let userStatus = u.isActive ? "Ativo" : "Inativo";

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

  console.log(users)
}

function renderPagination(pagination, value, tbody, table, token) {
  const section = document.querySelector(".table-section");
  const oldPaginator = section.querySelector(".change-container");
  if (oldPaginator) oldPaginator.remove();

  const changeContainer = document.createElement("div");
  changeContainer.classList.add("change-container");

  const totalPages = Number(pagination.totalPages);
  const currentPage = Number(pagination.page);

  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, startPage + 4);

  for (let i = startPage; i <= endPage; i++) {
    const page = document.createElement("span");
    page.textContent = i;
    page.dataset.page = i;
    page.classList.add("page-btn");

    if (i === currentPage) {
      page.classList.add("page-active");
    }

    page.addEventListener("click", async () => {
      if (i === currentPage) return

      const actualPageData = await getUsers(
        token,
        `?search=${value}&limit=5&page=${i}`
      );

      renderTable(actualPageData.users, tbody);
      renderPagination(actualPageData.pagination, value, tbody, table, token);
    });

    changeContainer.appendChild(page);
  }

  section.append(changeContainer);
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

    renderTable(users, tbody);
    table.append(thead, tbody);

    renderPagination(response.pagination, value, tbody, table, token);
  });

  searchForm.append(input, sbmButton);
  header.append(span, searchForm);
  section.append(h2, header);
}

async function updateUser(token) {
  const section = document.querySelector(".table-section");
  section.innerHTML = "";

  const h2 = document.createElement("h2");
  h2.textContent = "Atualizar usuário";

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
  input.placeholder = "Buscar usuário por ID";

  const sbmButton = document.createElement("button");
  sbmButton.id = "search-btn";
  sbmButton.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';

  searchForm.addEventListener("submit", async (ev) => {
    ev.preventDefault();

    const contentDt = section.querySelector(".update-user-container")
    if (contentDt) contentDt.remove()

    const input = document.getElementById("search-user-input");
    const value = input.value.trim();
    if (!value) return;

    const response = await userData(token, value);
    const user = response;

    input.value = "";
    table.innerHTML = "";

    const oldMsg = section.querySelector(".not-found-user");
    if (oldMsg) oldMsg.remove();

    if (user.length < 1) {
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
    tbody.classList.add('update-user-tbody')

    renderTable([user], tbody);
    table.append(thead, tbody);

    tbody.addEventListener('click', (ev) => {
      const dataContent = section.querySelector(".update-user-container")
      if (dataContent) return

      const content = document.createElement("div")
      content.classList.add("update-user-container")

      const table = document.createElement('table')
      table.classList.add('update-user-table')

      const createdAtData = user.createdAt || user.created_at

      const createdAt = new Date(createdAtData);
      const createdAtTxt = createdAt.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      const tbody = document.createElement('tbody')
      let userStatus = "Ativo";
      if (!user.isActive) userStatus = "Inativo";
      tbody.innerHTML = `
        <tr>
          <td><input class="update-input" type="text" value="${user.name}" /></td>
          <td><input class="update-input" type="text" value="${user.email}" /></td>
          <td><input class="update-input" type="text" value="${user.phone}" /></td>
          <td><input class="update-input" type="text" value="${user.plan}" /></td>
          <td><input class="update-input" type="text" value="${userStatus}" /></td>
          <td>${createdAtTxt}</td>
        </tr>
      `;

      table.append(tbody)
      content.append(table)
      section.append(content)

      const clickedTable = section.querySelector('table')
      clickedTable.innerHTML = ''
    });
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

  const totalUsers = document.getElementById("total-users");
  totalUsers.textContent = response.pagination.total;

  const activeResponse = await getUsers(token, "?isActive=true");

  const activeUsers = document.getElementById("active-users");
  activeUsers.textContent = activeResponse.pagination.total;

  const admResponse = await getUsers(token, '?role=admin');

  const adminTotal = document.getElementById("admin-total");
  adminTotal.textContent = admResponse.pagination.total;

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
          location.reload()
          break;

        case "usuarios":
          searchUser(token);
          break;

        case "update-user":
          updateUser(token)
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
  insertAdminData(token, userData);
}

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const user = await userData(token, localStorage.getItem("userId"));

  if (!token || !user) {
    // location.href = "./login.html";
  } else {
    startApp(token, user);
  }
});
