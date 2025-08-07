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

function leaveNetflixFn() {
  const leaveBtn = document.getElementById("leave-netflix-home");

  leaveBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("profileId");
    location.href = "./login.html";
  });
}

function toggleProfile(id) {
  localStorage.setItem("profileId", id);

  location.reload();
}

function verifyPin(pin, profileId) {
  const txtError = document.querySelector(".error-pin");
  txtError.textContent = "";

  const modal = document.querySelector(".modal-pin");
  modal.classList.remove("display");

  const pinInputs = modal.querySelectorAll(".pin-inputs input");

  pinInputs[0].focus();

  pinInputs.forEach((input) => {
    input.value = "";

    input.addEventListener("input", (ev) => {
      const actualInput = ev.currentTarget;
      const position = parseInt(actualInput.dataset.position);

      if (actualInput.value.length === 1) {
        const nextInput = document.querySelector(
          `[data-position="${position + 1}"]`
        );
        if (nextInput) nextInput.focus();
      }
    });
  });

  modal.addEventListener("click", (ev) => {
    if (ev.target.classList.contains("modal-pin")) {
      modal.classList.add("display");
    }
  });

  const sbmitBtn = document.getElementById("submitPin");
  sbmitBtn.addEventListener("click", () => {
    let digitedPassword = "";
    pinInputs.forEach((pin) => (digitedPassword += pin.value));

    if (digitedPassword !== pin) {
      pinInputs.forEach((p) => (p.value = ""));
      txtError.textContent = "Senha inválida.";
      pinInputs[0].focus();
    } else {
      modal.classList.add("display");

      toggleProfile(profileId);
    }
  });
}

function goToOtherProfile() {
  const profileCards = document.querySelectorAll(".profile-card");

  const token = localStorage.getItem("token");
  if (!token) {
    localStorage.removeItem("profileId");
    location.href = "./login.html";
    return;
  }

  profileCards.forEach((profile) => {
    profile.addEventListener("click", async () => {
      const profileId = profile.dataset.profileId;

      const actualProfile = await profileData(token, profileId);
      if (actualProfile.profile_pin) {
        verifyPin(actualProfile.profile_pin, profileId);
      } else {
        toggleProfile(profileId);
      }
    });
  });
}

function goToKidsProfile(data) {
  const kidsProfiles = data.filter((kid) => kid.isKid === true);

  if (kidsProfiles.length > 0) {
    const btn = document.getElementById("go-to-kids-profile");
    if (btn) {
      btn.onclick = (ev) => {
        const actualProfileId = localStorage.getItem('profileId')

        let kidsProfile

        if (kidsProfiles.length > 1) {
          do {
            kidsProfile = kidsProfiles[Math.floor(Math.random() * kidsProfiles.length)]
          } while (actualProfileId === kidsProfile.id);
        } else {
          kidsProfile = kidsProfiles[0]
        }
        
        localStorage.setItem('profileId', kidsProfile.id)
        location.reload()
      };
    }
  }
}

function insertProfileData(data, allProfiles) {

  const avatar = data.avatar_link;

  const avatarImage = document.getElementById("avatar-image");
  avatarImage.src = avatar;

  const content = document.querySelector(".user-data-content");

  const contentProfile = document.createElement("div");
  contentProfile.classList.add("content-profile");

  const profiles = allProfiles.filter((profile) => profile.id !== data.id);

  for (let i = 0; i < profiles.length; i++) {
    const card = document.createElement("div");
    card.dataset.profileId = profiles[i].id;
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

  const bottomInfos = document.createElement("div");
  bottomInfos.classList.add("bottom-infos");

  const manageProfile = document.createElement("div");
  manageProfile.innerHTML = `<i class="fa-solid fa-pencil"></i> <a href="./browse.html">Gerenciar perfil</a>`;
  manageProfile.id = "manage-profile-home";

  const leaveNetflix = document.createElement("a");
  leaveNetflix.textContent = "Sair da Netflix";
  leaveNetflix.id = "leave-netflix-home";

  const buttonsDiv = document.createElement("div");
  buttonsDiv.classList.add("buttons-bottom-info");

  buttonsDiv.append(manageProfile, leaveNetflix);
  bottomInfos.append(buttonsDiv);
  content.append(contentProfile, bottomInfos);

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

  leaveNetflixFn();
  goToOtherProfile();
  goToKidsProfile(allProfiles);
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
