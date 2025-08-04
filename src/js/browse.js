const token = localStorage.getItem("token");
localStorage.removeItem("email");

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

function createCardProfile(data) {
  const container = document.querySelector(".profile-content");
  if (!container) return;

  container.innerHTML = "";

  for (let i = 0; i < data.length; i++) {
    const { id, avatarUrl, profileName, profilePin } = data[i];

    const card = document.createElement("div");
    card.classList.add("card");

    const editProfile = document.createElement("div");
    editProfile.classList.add("edit-profile-div", "display");
    editProfile.dataset.profileId = id;

    const editIcon = document.createElement("i");
    editIcon.classList.add("fa-solid", "fa-pencil");

    editProfile.appendChild(editIcon);

    const infoContainer = document.createElement("div");
    infoContainer.classList.add("info-container");

    const contentImage = document.createElement("div");
    contentImage.classList.add("content-image");
    const img = document.createElement("img");
    img.src = avatarUrl;
    img.alt = "Nome do perfil de " + profileName;
    contentImage.append(img, editProfile);

    const name = document.createElement("p");
    name.classList.add("profile-name");
    name.innerText = profileName;

    infoContainer.append(contentImage, name);

    const contentBottom = document.createElement("div");
    contentBottom.classList.add("bottom-container");
    const lockIcon = document.createElement("i");
    lockIcon.className = "fa-solid fa-lock";
    contentBottom.appendChild(lockIcon);

    if (profilePin === null) {
      contentBottom.classList.add("display");
    }

    card.appendChild(infoContainer);
    card.appendChild(contentBottom);
    container.appendChild(card);
  }

  if (data.length < 5) {
    const moreProfile = document.createElement("div");
    moreProfile.classList.add("more-profile-btn");
    moreProfile.innerHTML = `<i class="fa-solid fa-plus"></i>`;
    container.append(moreProfile);
  }
}

async function createProfileReq(token, profileName, profilePin, isKid) {
  const loader = document.getElementById("loading");
  loader.classList.remove("display");

  try {
    const messageError = document.querySelector(".error-message");
    messageError.textContent = "";

    if (profilePin && !/^\d{4}$/.test(profilePin)) {
      messageError.textContent = `O PIN deve conter exatamente 4 números`;
      return;
    }

    if (profilePin === "") {
      profilePin = null;
    }

    const response = await fetch(
      `https://appflix-api.onrender.com/api/profiles`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profileName, profilePin, isKid }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      messageError.textContent = data.message;
      return;
    }
  } catch (e) {
    console.error(`Erro ao criar perfil, motivo: ${e}`);
  } finally {
    loader.classList.add("display");
  }
}

function createProfile(token) {
  const content = document.querySelector(".more-profile-content");

  const addProfile = document.querySelector(".more-profile-btn");
  if (addProfile) {
    addProfile.addEventListener("click", () => {
      const cancelBtn = document.querySelector(".cancel-button");
      cancelBtn.addEventListener("click", () => {
        content.classList.add("display");
      });
      content.classList.toggle("display");

      const form = document.getElementById("profile-form");
      form.addEventListener("submit", async (ev) => {
        ev.preventDefault();

        const profileName = document.getElementById("profileName").value;
        const profilePin = document.getElementById("profilePin").value;
        const isKidInput = document.getElementById("isKid");
        let isKid = isKidInput.checked;

        createProfileReq(token, profileName, profilePin, isKid);

        profileName.value = "";
        profilePin.value = "";

        content.classList.add("display");

        const data = await searchProfile(token);
        createCardProfile(data);

        location.reload();
      });
    });
  }
}

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

    const messageError = document.querySelector(".error-message");
    messageError.textContent = "";

    const data = await response.json();

    if (!response.ok) {
      messageError.textContent = data.message;
      return;
    }

    return data;
  } catch (e) {
    console.error(`Erro ao buscar perfil por id, motivo: ${e}`);
  } finally {
    loader.classList.add("display");
  }
}

async function updateProfile(token, profileId, updatedData) {
  const loader = document.getElementById("loading");
  loader.classList.remove("display");

  try {
    const messageError = document.querySelector(".error-message");
    messageError.textContent = "";

    const response = await fetch(
      `https://appflix-api.onrender.com/api/profiles/${profileId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          profileName: updatedData.profileName,
          profilePin: updatedData.profilePin,
          isKid: updatedData.isKid,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      messageError.textContent = data.message;
      return;
    }

    location.reload();
  } catch (e) {
    console.error(`Erro ao criar perfil, motivo: ${e}`);
  } finally {
    loader.classList.add("display");
  }
}

async function allAvatarsReq(token) {
  const loader = document.getElementById("loading");
  loader.classList.remove("display");
  try {
    const response = await fetch(
      `https://appflix-api.onrender.com/api/profiles/avatars`,
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
      console.error(`Erro ao fazer requisição, motivo: ${data.message}`);
      return;
    }

    return data;
  } catch (e) {
    console.error(`Erro ao fazer requisição, motivo: ${e.message}`);
  } finally {
    loader.classList.add("display");
  }
}

async function changeAvatarImage(token, profileId, avatarId) {
  +avatarId;
  const loader = document.getElementById("loading");
  loader.classList.remove("display");
  try {
    const response = await fetch(
      `https://appflix-api.onrender.com/api/profiles/avatar/${profileId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatarId }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(`Erro ao fazer requisição, motivo: ${data.message}`);
      return;
    }

    return data;
  } catch (e) {
    console.error(`Erro ao fazer requisição, motivo: ${e.message}`);
  } finally {
    loader.classList.add("display");
  }
}

async function createAvatarsCard(token) {
  const loader = document.getElementById("loading");
  loader.classList.remove("display");

  const data = await allAvatarsReq(token);

  const content = document.querySelector(".all-avatars");
  content.innerHTML = "";

  for (let i = 0; i < data.length; i++) {
    const card = document.createElement("div");
    card.classList.add("avatar-card");
    card.dataset.avatarId = data[i].id;

    const imageCard = document.createElement("div");
    imageCard.classList.add("image-card");

    const image = document.createElement("img");
    image.src = data[i].avatarUrl;
    image.alt = "Avatar de perfil";

    imageCard.append(image);
    card.append(imageCard);
    content.append(card);
  }

  const avatars = document.querySelectorAll(".avatar-card");
  if (avatars.length > 0) {
    avatars.forEach((avatar) => {
      avatar.addEventListener("click", () => {
        const avatarId = avatar.dataset.avatarId;
        localStorage.setItem("avatar", avatarId);

        const modal = document.querySelector(".change-avatar");
        setTimeout(() => {
          modal.classList.add("display");
        }, 500);
      });
    });
  }
  loader.classList.add("display");
}

async function deleteProfile(token, id) {
  const loader = document.getElementById("loading");
  loader.classList.remove("display");

  try {
    const response = await fetch(
      `https://appflix-api.onrender.com/api/profiles/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(`Erro ao deletar perfil, motivo: ${data.message}`);
      return false;
    }

    return true;
  } catch (e) {
    console.error(`Erro ao deletar perfil, motivo: ${e}`);
    return false;
  } finally {
    loader.classList.add("display");
  }
}

async function openEditModal(data) {
  const contentModal = document.querySelector(".edit-profile-content");

  if (!contentModal) return;

  contentModal.classList.remove("display");

  document.getElementById("editedName").value = data.profile_name;
  document.getElementById("editPin").value = data.profile_pin || "";
  document.getElementById("isKidEdited").checked = data.is_kid;
  document.getElementById("user-image").src = data.avatar_link;

  const cancelBtn = document.getElementById("cancel-edit");
  cancelBtn.addEventListener("click", (ev) => {
    contentModal.classList.add("display");
  });

  const editForm = document.getElementById("edit-profile-form");

  const changeAvatarBtn = document.querySelector(".change-image-div");
  if (changeAvatarBtn) {
    changeAvatarBtn.addEventListener("click", () => {
      const allAvatarsModal = document.querySelector(".change-avatar");
      allAvatarsModal.classList.remove("display");

      createAvatarsCard(token);

      const closeAvatarModal = document.querySelector(".cancel-div-avatar");
      closeAvatarModal.addEventListener("click", () => {
        allAvatarsModal.classList.add("display");
      });
    });
  }

  editForm.addEventListener("submit", (ev) => {
    ev.preventDefault();

    const profileName = document.getElementById("editedName");
    const profilePin = document.getElementById("editPin");

    const erroMessage = document.querySelector(".error-edit-message");
    erroMessage.textContent = "";

    const updatedData = {};

    if (profileName.value.length < 1 || profileName.value.length > 20) {
      erroMessage.innerText = "Nome de perfil inválido";
    } else {
      updatedData.profileName = profileName.value;
    }

    if (profilePin.value.length > 0 && profilePin.value.length !== 4) {
      erroMessage.innerText = "Formato de senha inválido";
    } else if (profilePin.value.length === 4) {
      updatedData.profilePin = profilePin.value;
    } else {
      updatedData.profilePin = null;
    }

    const isKidInput = document.getElementById("isKidEdited");
    updatedData.isKid = isKidInput.checked;

    const avatarId = localStorage.getItem("avatar");
    if (avatarId !== null) {
      changeAvatarImage(token, data.id, avatarId);
    }

    updateProfile(token, data.id, updatedData);
    localStorage.removeItem("avatar");
  });

  const deleteProfileBtn = document.getElementById("delete-profile");

  const profiles = await searchProfile(token);
  if (profiles.length < 2) {
    deleteProfileBtn.classList.add("display");
  } else {
    deleteProfileBtn.classList.remove("display");
    deleteProfileBtn.onclick = () => {
      const confirmModal = document.querySelector(".confirm-modal");
      confirmModal.classList.remove("display");

      const cancelDelete = document.getElementById("cancel-delete");
      cancelDelete.addEventListener("click", (ev) => {
        ev.stopPropagation();
        confirmModal.classList.add("display");
      });

      const confirDelete = document.getElementById("confirm-delete");
      confirDelete.replaceWith(confirDelete.cloneNode(true));
      document
        .getElementById("confirm-delete")
        .addEventListener("click", async () => {
          const success = await deleteProfile(token, data.id);
          if (success) {
            confirmModal.classList.add("display");
            location.reload();
          }
        });
    };
  }
}

async function editProfile(token) {
  const manageProfile = document.getElementById("manage-profile-btn");
  const contents = document.querySelectorAll(".edit-profile-div");
  const contentModal = document.querySelector(".edit-profile-content");
  const moreProfileBtn = document.querySelector(".more-profile-btn");

  manageProfile.addEventListener("click", () => {
    if (manageProfile.textContent === "Gerenciar Perfis") {
      manageProfile.textContent = "Cancel";
      if (moreProfileBtn) {
        moreProfileBtn.classList.add("display");
      }

      contents.forEach((content) => {
        content.classList.remove("display");

        content.addEventListener("click", async (ev) => {
          const currentContent = ev.currentTarget;
          const id = currentContent.dataset.profileId;

          const data = await profileData(token, id);

          if (data.profile_pin) {
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
            sbmitBtn.addEventListener("click", (ev) => {
              let digitedPassword = "";
              pinInputs.forEach((pin) => (digitedPassword += pin.value));

              if (digitedPassword !== data.profile_pin) {
                pinInputs.forEach((p) => (p.value = ""));
                txtError.textContent = "Senha inválida.";
                pinInputs[0].focus();
              } else {
                modal.classList.add("display");
                openEditModal(data);
              }
            });
          } else {
            openEditModal(data);
          }
        });
      });
    } else {
      manageProfile.textContent = "Gerenciar Perfis";
      if (moreProfileBtn) {
        moreProfileBtn.classList.remove("display");
      }
      contents.forEach((content) => content.classList.add("display"));
      contentModal.classList.add("display");
      localStorage.removeItem("avatar");
    }
  });
}

function nextPage(data) {
  localStorage.setItem('profileId', data.id)
  location.href = './profile.html'
}

async function verifyUser(token) {
  const contents = document.querySelectorAll(".card");
  contents.forEach((card) => {
    card.addEventListener("click", async (ev) => {
      const card = ev.currentTarget;
      const actualProfile = card.querySelector(".edit-profile-div");
      if (actualProfile.classList.contains("display")) {
        const id = actualProfile.dataset.profileId;
        const profile = await profileData(token, id);

        if (!profile.profile_pin) {
          nextPage(profile)
          return;
        }

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
        sbmitBtn.addEventListener("click", (ev) => {
          let digitedPassword = "";
          pinInputs.forEach((pin) => (digitedPassword += pin.value));

          if (digitedPassword !== profile.profile_pin) {
            pinInputs.forEach((p) => (p.value = ""));
            txtError.textContent = "Senha inválida.";
            pinInputs[0].focus();
          } else {
            modal.classList.add("display");
            nextPage(profile)
          }
        });
      }
    });
  });
}

async function startApp(token) {
  const data = await searchProfile(token);
  createCardProfile(data);

  createProfile(token);
  editProfile(token);

  verifyUser(token);
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
      location.href = path
    }

    return true;
  } catch (e) {
    console.error(`Erro ao validar token, motivo: ${e}`);
    location.href = path;
  } finally {
    loader.classList.add("display");
  }
}

document.addEventListener("DOMContentLoaded", async () => {

  const token = localStorage.getItem("token");

  if (!token) {
    location.href = "./login.html";
  } else {
    const isValidToken = await validateToken(token, './login.html')
    if (isValidToken) {
      startApp(token);
    }
  }
});
