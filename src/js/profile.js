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
        const actualProfileId = localStorage.getItem("profileId");

        let kidsProfile;

        if (kidsProfiles.length > 1) {
          do {
            kidsProfile =
              kidsProfiles[Math.floor(Math.random() * kidsProfiles.length)];
          } while (actualProfileId === kidsProfile.id);
        } else {
          kidsProfile = kidsProfiles[0];
        }

        localStorage.setItem("profileId", kidsProfile.id);
        location.reload();
      };
    }
  }
}

async function renderMovie(apikey, profileType) {
  const randomPage = Math.floor(Math.random() * 10);

  let routers = [];

  if (!profileType) {
    routers = [
      {
        endpoint: `https://api.themoviedb.org/3/movie/popular?api_key=${apikey}&language=pt-BR&page=1`,
        title: "Filmes Populares",
      },
      {
        endpoint: `https://api.themoviedb.org/3/tv/popular?api_key=${apikey}&language=pt-BR&page=1`,
        title: "Séries Populares",
      },
      {
        endpoint: `https://api.themoviedb.org/3/movie/top_rated?api_key=${apikey}&language=pt-BR&page=1`,
        title: "Filmes melhor avaliados",
      },
      {
        endpoint: `https://api.themoviedb.org/3/movie/upcoming?api_key=${apikey}&language=pt-BR&page=1`,
        title: "Em Breve",
      },
      {
        endpoint: `https://api.themoviedb.org/3/movie/now_playing?api_key=${apikey}&language=pt-BR&page=1`,
        title: "Filmes em Exibição",
      },
      {
        endpoint: `https://api.themoviedb.org/3/tv/top_rated?api_key=${apikey}&language=pt-BR&page=1`,
        title: "Séries melhor avaliadas",
      },
      {
        endpoint: `https://api.themoviedb.org/3/tv/on_the_air?api_key=${apikey}&language=pt-BR&page=1`,
        title: "Séries no Ar",
      },
    ];
  } else {
    routers = [
      {
        endpoint: `https://api.themoviedb.org/3/discover/movie?api_key=${apikey}&with_genres=16&language=pt-BR&page=1}`,
        title: "Filmes Populares",
      },
      {
        endpoint: `https://api.themoviedb.org/3/discover/tv?api_key=${apikey}&with_genres=16&language=pt-BR&page=1`,
        title: "Séries Populares",
      },
      {
        endpoint: `https://api.themoviedb.org/3/discover/movie?api_key=${apikey}&with_genres=16&sort_by=vote_average.desc&vote_count.gte=100&language=pt-BR&page=1`,
        title: "Melhor animações",
      },
      {
        endpoint: `https://api.themoviedb.org/3/discover/tv?api_key=${apikey}&with_genres=16&with_original_language=ja&sort_by=vote_average.desc&vote_count.gte=50&language=pt-BR&page=1`,
        title: "Animes animes",
      },
      {
        endpoint: `https://api.themoviedb.org/3/discover/tv?api_key=${apikey}&with_genres=16&sort_by=popularity.desc&language=pt-BR&page=1`,
        title: "Kids",
      },
    ];
  }

  for (let i = 0; i < routers.length; i++) {
    const data = await tmdbApi(routers[i].endpoint);
    if (data) {
      createCarouselContainer(data.results, routers[i].title);
    }
  }
}

function createCarouselContainer(moviesData, containerTitle) {
  const title = containerTitle.replaceAll(" ", "-");
  const container = createHtmlElement(
    "div",
    `container, content-${title.toLowerCase()}`
  );

  const titleH2 = createHtmlElement("h2");
  titleH2.innerText = containerTitle;

  const contentCards = createHtmlElement("div", `content-card`);

  const cards = createHtmlElement("div", `all-cards`);

  const movies = moviesData.filter((m) => m.backdrop_path);

  for (let i = 0; i < movies.length; i++) {
    const card = createHtmlElement("div", `card`);
    card.dataset.movieId = movies[i].id;

    const movieImage = createHtmlElement("div", `movie-image-div`);
    const img = createHtmlElement("img");
    img.src = `https://image.tmdb.org/t/p/w1280${movies[i].backdrop_path}`;

    movieImage.append(img);
    card.append(movieImage)

    cards.append(card);
  }

  contentCards.append(titleH2, cards);

  const buttons = createHtmlElement("div", `button-content`);

  const nextBtn = createHtmlElement("button", `next-movie, next-${title.toLowerCase()}, fa-solid, fa-angles-right`)
  const returntBtn = createHtmlElement("button", `return-movie, return-${title.toLowerCase()}, fa-solid, fa-angles-left`)

  buttons.append(returntBtn, nextBtn)
  container.append(contentCards, buttons);

  const allContainers = document.querySelector(".all-movie-container");
  allContainers.append(container);
  console.log(moviesData);
}

async function tmdbApi(endpoint) {
  const loader = document.getElementById("loading");
  loader.classList.remove("display");

  try {
    const response = await fetch(endpoint);

    const data = await response.json();

    if (!response.ok) {
      console.error(`Erro na requisição, motivo: ${data.message}`);
      return;
    }

    return data;
  } catch (e) {
    console.error(`Erro ao executar requisição GET: ${e}`);
  } finally {
    loader.classList.add("display");
  }
}

function createHtmlElement(element, className, id) {
  const elementHtml = document.createElement(element);

  if (className) {
    const classArr = className.split(",");

    classArr.forEach((clss) => {
      const classNoSpace = clss.trim();
      elementHtml.classList.add(classNoSpace);
    });
  }

  if (id) {
    elementHtml.id = id;
  }

  return elementHtml;
}

async function seeMovieInfos(apiKey, movieId, movieType) {
  const endpoint = `https://api.themoviedb.org/3/${movieType}/${movieId}?api_key=${apiKey}&language=pt-BR`;
  const movie = await tmdbApi(endpoint);

  if (movie) {
    const modal = document.querySelector(".movie-info-modal");
    modal.classList.remove("display");

    const contentTop = createHtmlElement("div", "movie-info-content-top");

    const cancelDiv = createHtmlElement("div", "cancel-content-top");
    const cancelIcon = createHtmlElement("i", "fa-solid, fa-x");

    cancelDiv.append(cancelIcon);

    const div = createHtmlElement("div", "movie-info-background");
    const image = createHtmlElement("img", "movie-image");

    const movieImageUrl = `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`;
    image.src = movieImageUrl;

    const dataContent = createHtmlElement("div", "movie-data");

    const movieTitle = createHtmlElement("p", "movie-title");

    if (movie.title) {
      movieTitle.textContent = movie.title;
    } else {
      movieTitle.textContent = movie.name;
    }

    const modalButtons = createHtmlElement("div", "modal-buttons");

    const playBtn = createHtmlElement("button", "play-btn", "play-" + movie.id);
    const playIcon = createHtmlElement("i", "fa-solid, fa-play");
    playBtn.append(playIcon, "Assistir");

    const plusBtn = createHtmlElement(
      "button",
      "save-in-list",
      "save-" + movie.id
    );
    const plusIcon = createHtmlElement("i", "fa-solid, fa-plus");
    plusBtn.append(plusIcon);

    const likeBtn = createHtmlElement(
      "button",
      "like-movie",
      "like-" + movie.id
    );

    const likeIcon = createHtmlElement("i", "fa-regular, fa-thumbs-up");
    likeBtn.append(likeIcon);

    modalButtons.append(playBtn, plusBtn, likeBtn);

    const content = modal.querySelector(".infos-modal");
    content.innerHTML = ``;

    div.append(image);
    dataContent.append(movieTitle, modalButtons);
    contentTop.append(cancelDiv, div, dataContent);

    const contentMid = createHtmlElement("div", "content-mid");

    const leftInfoMid = createHtmlElement("div", "left-info-mid");

    const topData = createHtmlElement("div", "top-data-mid");

    const releaseDate = createHtmlElement("p", "release-date");

    if (movie.release_date) {
      const date = new Date(movie.release_date);
      releaseDate.innerText = date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } else {
      const date = new Date(movie.first_air_date);
      releaseDate.innerText = date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }

    const voteContent = createHtmlElement("div", "vote-content");
    const votesNumeric = Math.floor(movie.vote_average / 2);

    const voteStars = createHtmlElement("div", "vote-stars");

    for (let i = 0; i < 5; i++) {
      if (i < votesNumeric) {
        const star = createHtmlElement("i", "fa-solid, fa-star");
        voteStars.append(star);
      } else {
        const star = createHtmlElement("i", "fa-regular, fa-star");
        voteStars.append(star);
      }
    }

    voteContent.append(votesNumeric + ".0", voteStars);

    topData.append(releaseDate, voteContent);

    const bottomData = createHtmlElement("div", "bottom-data-mid");

    const overview = createHtmlElement("p", "overview");

    let overviewTxt = movie.overview;

    overview.innerText = overviewTxt;
    bottomData.append(overview);

    leftInfoMid.append(topData, bottomData);

    const rightInfoMid = createHtmlElement("div", "right-info-mid");
    const movieTime = createHtmlElement("p", "movie-time");

    if (movie.runtime) {
      const hour = Math.floor(movie.runtime / 60);
      const minuts = movie.runtime % 60;

      if (hour > 0) {
        movieTime.innerText = `Tempo de exibição: ${hour}h${minuts}m`;
      } else {
        movieTime.innerText = `Tempo de exibição: ${minuts}m`;
      }

      rightInfoMid.append(movieTime);
    } else {
      const seasonContainer = createHtmlElement("div", "season-container");

      const seasons = createHtmlElement("p", "season-content");

      seasonContainer.append(seasons);

      const temps = movie.seasons.filter((t) => t.name !== "Especiais");
      console.log(temps);

      if (temps.length > 1) {
        seasons.textContent = `${temps.length} temporadas - (${movie.number_of_episodes} episódios)`;

        const allTempsContent = createHtmlElement(
          "div",
          "all-seasons-content, display"
        );

        for (let i = 0; i < temps.length; i++) {
          const tempBtn = createHtmlElement(
            "button",
            "temp-btn",
            `temp-${temps[i].season_number}`
          );
          tempBtn.innerText = temps[i].name;

          allTempsContent.append(tempBtn);
        }

        seasonContainer.append(allTempsContent);
        rightInfoMid.append(seasonContainer);

        if (seasons) {
          seasons.addEventListener("click", () => {
            const allTempsContent = document.querySelector(
              ".all-seasons-content"
            );
            allTempsContent.classList.toggle("display");

            if (!allTempsContent.classList.contains("display")) {
              const infoModal = document.querySelector(".infos-modal");
              infoModal.addEventListener("click", (ev) => {
                if (
                  ev.target !== seasons &&
                  !ev.target.classList.contains("temp-btn")
                ) {
                  allTempsContent.classList.add("display");
                }
              });
            }

            const tempBtn = document.querySelectorAll(".temp-btn");

            tempBtn.forEach((btn) => {
              btn.addEventListener("click", () => {
                const seasonNumber = Number(btn.id.split("-")[1]);

                const clickedTemp = temps.filter(
                  (t) => t.season_number === seasonNumber
                );

                seasons.textContent = `${clickedTemp[0].name} - (${clickedTemp[0].episode_count} episódios)`;

                if (clickedTemp[0].overview) {
                  overview.innerText = clickedTemp[0].overview;
                } else {
                  overview.innerText = movie.overview;
                }

                if (clickedTemp[0].air_date) {
                  const dateSeason = new Date(clickedTemp[0].air_date);
                  releaseDate.innerText = dateSeason.toLocaleDateString(
                    "pt-BR",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    }
                  );
                }
              });
            });
          });
        }
      } else {
        seasons.textContent = `${temps.length} temporada - (${movie.number_of_episodes} episódios)`;
        rightInfoMid.append(seasons);
      }
    }

    const genreContent = createHtmlElement("div", "genre-content");

    const genres = movie.genres;
    for (let i = 0; i < genres.length; i++) {
      const genre = createHtmlElement("span", "genre-span");
      genre.innerText = genres[i].name;

      genreContent.append(genre);
    }

    rightInfoMid.append(genreContent);

    if (movie.revenue) {
      const revenueFormatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 0,
      }).format(movie.revenue);

      const revenue = createHtmlElement("p", "movie-revenue");
      revenue.innerText = `Bilheteria: ${revenueFormatted}`;

      rightInfoMid.append(revenue);
    }

    contentMid.append(leftInfoMid, rightInfoMid);
    content.append(contentTop, contentMid);

    modal.addEventListener("click", (ev) => {
      const element = ev.target;

      if (element === modal) {
        modal.classList.add("display");
      }
    });

    if (!modal.classList.contains("display")) {
      const cancelBtn = document.querySelector(".cancel-content-top");
      cancelBtn.addEventListener("click", () => {
        modal.classList.add("display");
      });
    }
  }
}

async function insertTmdbVideo(apiKey, profileType) {
  let movie;
  const videoType = [{ type: "movie" }, { type: "tv" }];
  const randomType = videoType[Math.floor(Math.random() * videoType.length)];

  if (!profileType) {
    const endpoint = `https://api.themoviedb.org/3/${randomType.type}/popular?api_key=${apiKey}&language=pt-BR&page=1`;
    const data = await tmdbApi(endpoint);

    const results = data.results.filter(
      (m) => m.overview && m.overview.trim().length > 0
    );

    movie = results[Math.floor(Math.random() * results.length)];
  } else {
    const endpoint = `https://api.themoviedb.org/3/discover/${
      randomType.type
    }?api_key=${apiKey}&with_genres=${16}&language=pt-BR&page=1`;
    const data = await tmdbApi(endpoint);

    const results = data.results.filter(
      (m) => m.overview && m.overview.trim().length > 0
    );

    movie = results[Math.floor(Math.random() * results.length)];
  }

  console.log(movie);

  const endpoint = `https://api.themoviedb.org/3/${randomType.type}/${movie.id}/videos?api_key=${apiKey}&language=pt-BR`;

  let video = await tmdbApi(endpoint);

  const backgroundContent = document.querySelector(".movie-background");

  if (video && video.results.length < 1) {
    if (movie.backdrop_path) {
      const movieImageUrl = `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`;
      backgroundContent.innerHTML = `<img src="${movieImageUrl}" alt="${movie.title}" />
                                     <div class="movie-data-info"></div>`;

      backgroundContent.style.zIndex = 1;
    } else {
      backgroundContent.innerHTML = `<p>Sem imagem disponível</p>`;
    }

    const unmuteDiv = document.querySelector(".unmute-div");
    unmuteDiv.style.display = "none";

    const movieContent = document.querySelector(".movie-content");
    movieContent.style.display = "none";
  } else {
    const movieImageContent = document.querySelector(".movie-background");
    movieImageContent.style.display = "none";

    const validTypes = ["Trailer", "Teaser", "Clip", "Featurette"];
    const trailers = video.results.filter(
      (vid) => vid.site === "YouTube" && validTypes.includes(vid.type)
    );

    if (trailers.length < 1) {
      window.location.reload();
      return;
    }

    let randomTrailer;

    if (trailers.length > 1) {
      randomTrailer = trailers[Math.floor(Math.random() * trailers.length)];
    } else {
      randomTrailer = trailers[0];
    }

    const videoKey = randomTrailer.key;

    let player;

    function onYouTubeIframeAPIReady() {
      if (!videoKey) return;

      player = new YT.Player("player", {
        height: "360",
        width: "640",
        videoId: videoKey,
        playerVars: {
          autoplay: 1,
          controls: 0,
          mute: 1,
          loop: 1,
          playlist: videoKey,
          rel: 0,
          modestbranding: 1,
          fs: 0,
          controls: 1,
          showinfo: 0,
        },
        events: {
          onReady: onPlayerReady,
        },
      });
    }

    if (typeof YT !== "undefined" && YT.Player) {
      onYouTubeIframeAPIReady();
    }

    function onPlayerReady(event) {
      const unmuteButton = document.querySelector(".unmute-div");

      if (unmuteButton) {
        unmuteButton.addEventListener("click", () => {
          const state = player.getPlayerState();

          if (state === 2 || state === 5) {
            player.playVideo();
          }

          if (player.isMuted()) {
            player.unMute();
          } else {
            player.mute();
          }
        });
      }
    }
  }

  const dataInfoCOntent = document.querySelector(".movie-data-info");

  const title = createHtmlElement("h2", "movie-title");
  if (movie.title) {
    title.innerText = movie.title;
  } else {
    title.innerText = movie.name;
  }

  const overview = createHtmlElement("p", "overview");

  let overviewTxt = movie.overview;

  if (overviewTxt.length > 260) {
    overviewTxt = overviewTxt.slice(0, 260) + "...";
  }

  overview.innerText = overviewTxt;

  const playBtn = createHtmlElement("button", "play-btn", "play-" + movie.id);
  const moreInfoBtn = createHtmlElement(
    "button",
    "infos-btn",
    "info-" + movie.id
  );

  const playIcon = createHtmlElement("i", "fa-solid, fa-play");
  const moreIcon = createHtmlElement("i", "fa-solid, fa-circle-info");

  playBtn.append(playIcon, "Assistir");
  moreInfoBtn.append(moreIcon, "Mais informações");

  const divBtns = createHtmlElement("div", "div-data-buttons");

  divBtns.append(playBtn, moreInfoBtn);
  dataInfoCOntent.append(title, overview, divBtns);

  if (moreInfoBtn) {
    moreInfoBtn.addEventListener("click", (el) => {
      const element = el.currentTarget;
      const movieId = element.id.split("-")[1];

      seeMovieInfos(apiKey, movieId, randomType.type);
    });
  }

  renderMovie(apiKey, profileType);
}

async function insertProfileData(data, allProfiles) {
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

  const apiKeyTmdb = "1bba4a82f9810b816a081e47cde96c2b";
  await insertTmdbVideo(apiKeyTmdb, data.is_kid);
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
