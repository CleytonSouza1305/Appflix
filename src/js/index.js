const key = '1bba4a82f9810b816a081e47cde96c2b';

function moveCarousel() {
  const carousel = document.querySelector('.carousel');
  const btnLeft = document.querySelector('.scroll-left');
  const btnRight = document.querySelector('.scroll-right');

  const scrollAmount = 1500; 

  btnLeft.addEventListener('click', (ev) => {
    const clickedButton = ev.currentTarget
    carousel.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth'
    });

    if (btnRight.classList.contains('hidden')) {
      clickedButton.classList.add('hidden')
      btnRight.classList.remove('hidden')
    }
  });

  btnRight.addEventListener('click', (ev) => {
    const clickedButton = ev.currentTarget
    carousel.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });

    if (btnLeft.classList.contains('hidden')) {
      clickedButton.classList.add('hidden')
      btnLeft.classList.remove('hidden')
    }
  });
}

function openContainerInfo() {
  const buttons = document.querySelectorAll('.question-box')

  buttons.forEach((btn) => btn.addEventListener('click', (ev) => {
    const actualButton = ev.currentTarget
    const isAlreadyOpen = actualButton.classList.contains('isOpen')

    const containerWithClass = actualButton.children[0]?.classList[0]
    const icon = actualButton.children[1].children[0]
    icon.classList.remove('fa-plus')
    icon.classList.add('fa-x')

     actualButton.classList.add('isOpen')
      const container = document.querySelectorAll(`.question-btn-container`)
      container.forEach((c) => {
        const containerBox = c.children[0].classList[0]

        if (containerWithClass === containerBox) {
          if (isAlreadyOpen) {
            icon.classList.remove('fa-x')
            icon.classList.add('fa-plus')
    
            c.classList.add('display')
            actualButton.classList.remove('isOpen')
          } else {
            c.classList.remove('display')
          }
        }
      })
  }))
}

function verifyEmail() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{3}$/;

document.querySelectorAll('.email-input').forEach((input) => {
  input.addEventListener('input', (ev) => {
    const value = ev.currentTarget.value.trim()
    const nextPageBtn = document.querySelector(`.${ev.currentTarget.id}`)
    if (!nextPageBtn.disabled) {
      nextPageBtn.disabled = true
    }

    if (value.length < 1) {
      input.style.borderColor = '#5F5F5F'
    } else if (!emailRegex.test(value)) {
      input.style.borderColor = '#c00a0a'; 
    } else {
      input.style.borderColor = '#07c907'; 
      nextPageBtn.disabled = false
      if (!nextPageBtn.disabled) {
        nextPageBtn.addEventListener('click', () => {
          localStorage.setItem('email', value)
          window.location = "./src/pages/login.html"     
        })
      }
    }
  });
});
}

async function getTopRated(apiKey) {
  const loader = document.querySelector('#loading');
  loader.classList.remove('display'); 

  try {
    const response = await fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=pt-BR&page=1`);

    if (!response.ok) {
      console.error(`Erro ao buscar top rated, status: ${response.status}`);
      return;
    }

    const data = await response.json();

    const movies = data.results

    const top10 = movies.sort((a, b) => b.vote_average - a.vote_average).slice(0, 10);

    const carousel = document.querySelector('.carousel')
    if (carousel) {
        for (let i = 0; i < top10.length; i++) {
          const card = document.createElement('div')
          card.classList.add('movie-card')

          const imageContainer = document.createElement('div')
          imageContainer.classList.add('image-container')

          const response = await fetch(`https://api.themoviedb.org/3/movie/${top10[i].id}/images?api_key=${apiKey}`)
          .then((r) => r.json())

          const postersPt = response.posters.filter(poster => poster.iso_639_1 === 'pt');
          const posterPath = postersPt[0]?.file_path;
          const img = document.createElement('img');

          if (posterPath) {
            img.src = `https://image.tmdb.org/t/p/w500${posterPath}`; 
            img.alt = top10[i].title || 'Pôster do filme';

            imageContainer.appendChild(img);
          } else {
            img.src = `https://image.tmdb.org/t/p/w500${response.posters[0]?.file_path}`; 
            img.alt = top10[i].title || 'Pôster do filme';

            imageContainer.appendChild(img);
          }

          const netflixImageContainer = document.createElement('div')
          netflixImageContainer.classList.add('netflix-logo-container')
          const netflixImage = document.createElement('img')
          netflixImage.src = './src/images/netflix-logo.png'
          netflixImage.alt = 'Logo da Netflix';

          const rankPosition = document.createElement('div')
          rankPosition.classList.add('rank-position')

          const position = document.createElement('span')
          position.innerText = parseFloat([i]) + 1

          netflixImageContainer.appendChild(netflixImage)
          rankPosition.appendChild(position)
          card.append(imageContainer, netflixImageContainer, rankPosition)
          carousel.appendChild(card)
      }

      moveCarousel()
      openContainerInfo()
      verifyEmail()
    }
    
  } catch (e) {
    console.error('Erro na requisição:', e);
  } finally {
    loader.classList.add('display');
  }
}

getTopRated(key);
