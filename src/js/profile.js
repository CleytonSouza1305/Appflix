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

async function searchProfile(token) {
  const loader = document.getElementById("loading");
  loader.classList.remove("display");

  try {
    const response = await fetch(
      `https://appflix-api.onrender.com/api/profiles`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(response.message);
    }

    const data = await response.json();
    return data;
  } catch (e) {
    console.error(`Erro na requisição, motivo: ${e}`);
    location.href = "./login.html";
  } finally {
    loader.classList.add("display");
  }
}

function insertProfileData(data, allProfiles) {
  console.log(data);
  console.log(allProfiles);

  const avatar = data.avatar_link;

  const avatarImage = document.getElementById("avatar-image");
  avatarImage.src = avatar;

  const profiles = allProfiles.filter((profile) => profile.id !== data.id);
  console.log(profiles);

  const content = document.querySelector(".user-data-content");

  const contentProfile = document.createElement("div");
  contentProfile.classList.add("content-profile");

  for (let i = 0; i < profiles.length; i++) {
    const card = document.createElement("div");
    card.classList.add("profile-card");

    const leftCardContent = document.createElement("div");
    leftCardContent.classList.add("left-card-content");

    const profileName = document.createElement("span");
    profileName.innerText = profiles[i].profileName;

    const profileImage = document.createElement("img");
    profileImage.src = profiles[i].avatarUrl;

    leftCardContent.append(profileName, profileImage);

    if (profiles[i].profilePin) {
      const rightCardContent = document.createElement("div");
      rightCardContent.classList.add("right-card-content");

      const icon = document.createElement("i");
      icon.classList.add("fa-solid", "fa-lock");

      rightCardContent.append(icon);
      card.append(leftCardContent, rightCardContent);
    } else {
      card.append(leftCardContent);
    }

    contentProfile.append(card);
  }

  content.append(contentProfile);

  const contentAvatar = document.querySelector(".user-avatar");

  let hideTimeout;

  contentAvatar.addEventListener("mouseenter", () => {
    clearTimeout(hideTimeout);
    content.classList.remove("display");
  });

  contentAvatar.addEventListener("mouseleave", () => {
    hideTimeout = setTimeout(() => {
      content.classList.add("display");
    }, 800);
  });

  content.addEventListener("mouseenter", () => {
    clearTimeout(hideTimeout);
  });

  content.addEventListener("mouseleave", () => {
    hideTimeout = setTimeout(() => {
      content.classList.add("display");
    }, 800);
  });

  const toggle = document.getElementById("toggle-menu");
  const menu = document.getElementById("mobile-menu");

  toggle.addEventListener("click", (event) => {
    event.preventDefault();
    menu.classList.toggle("active");

    event.stopPropagation();
  });

  document.addEventListener("click", (event) => {
    const isClickInsideMenu = menu.contains(event.target);
    const isClickOnToggle = toggle.contains(event.target);

    if (!isClickInsideMenu && !isClickOnToggle) {
      menu.classList.remove("active");
    }
  });
}

async function startApp(token, profileId) {
  const data = await profileData(token, profileId);
  const profiles = await searchProfile(token);
  insertProfileData(data, profiles);
}

async function validateToken(token, path) {
  const loader = document.getElementById("loading");
  loader.classList.remove("display");

  try {
    const response = await fetch(
      `https://appflix-api.onrender.com/api/profiles`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      localStorage.removeItem("token");
      location.href = path;
      return false;
    }

    return true;
  } catch (e) {
    console.error(`Erro ao validar token, motivo: ${e}`);
    localStorage.removeItem("token");
    location.href = path;
    return false;
  } finally {
    loader.classList.add("display");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    localStorage.removeItem("profileId");
    location.href = "./login.html";
    return;
  }

  const isValid = await validateToken(token, "./login.html");
  if (!isValid) return;

  const profileId = localStorage.getItem("profileId");

  if (!profileId) {
    localStorage.removeItem("profileId");
    location.href = "./browse.html";
  } else {
    startApp(token, profileId);
  }
});
