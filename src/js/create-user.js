function startApp() {
  const inputs = document.querySelectorAll(".form-input");
  const submitBtn = document.getElementById("login-btn");
  const form = document.querySelector("form");

  const email = localStorage.getItem('email')
  const emailInput = document.getElementById('email')

  emailInput.value = email

  let validEmail = false;
  let validPassword = false;
  let validName = false;
  let validPhone = false;

  function updateSubmitButton() {
    if (submitBtn.textContent === 'Entrar') {
      submitBtn.disabled = !(validEmail && validPassword);
    } else if (submitBtn.textContent === 'Criar conta') {
      submitBtn.disabled = !(validEmail && validPassword && validName && validPhone);
    }
  }

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();

    const emailValue = document.getElementById('email').value
    const passwordValue = document.getElementById('password').value

    const h1Content = document.querySelector('h1')
    
    if (h1Content.textContent === 'Entrar') {
      loginReq(emailValue, passwordValue)
    } else if (h1Content.textContent === 'Criar conta') {
      const nameValue = document.getElementById('name').value
      const phoneValue = document.getElementById('phone').value
      
      registerReq(emailValue, passwordValue, nameValue, phoneValue)
    }
  });

  inputs.forEach((input) => {
    input.addEventListener("input", (ev) => {
      let value = ev.currentTarget.value.trim();

      if (input.id === "name") {

        if (value.length < 1) {
          input.style.borderColor = "#5F5F5F";
          validName = false;
        } else if (value.length >= 3) {
          input.style.borderColor = "#07c907";
          validName = true;
        } else {
          input.style.borderColor = "#c00a0a";
          validName = false;
        }
      }

      if (input.id === "email") {
        const isValidEmail = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{3}$/.test(value);

        if (value.length < 1) {
          input.style.borderColor = "#5F5F5F";
          validEmail = false;
        } else if (!isValidEmail) {
          input.style.borderColor = "#c00a0a";
          validEmail = false;
        } else {
          input.style.borderColor = "#07c907";
          validEmail = true;
        }
      }

      if (input.id === "password") {
        if (value.length < 1) {
          input.style.borderColor = "#5F5F5F";
          validPassword = false;
        } else if (value.length >= 8) {
          input.style.borderColor = "#07c907";
          validPassword = true;
        } else {
          input.style.borderColor = "#c00a0a";
          validPassword = false;
        }
      }

      if (input.id === 'phone') {

        value = value.replace(/\D/g, '');

        value = value.substring(0, 11);

        if (value.length > 0) {
          value = '(' + value;
        }
        if (value.length > 3) {
          value = value.slice(0, 3) + ') ' + value.slice(3);
        }
        if (value.length > 10) {
          value = value.slice(0, 10) + '-' + value.slice(10);
        }

        ev.target.value = value;

        if (value.length === 15) {
          validPhone = true
          input.style.borderColor = "#07c907"; 
        } else if (value.length === 0) {
          validPhone = false
          input.style.borderColor = "#5F5F5F"; 
        } else {
          validPhone = false
          input.style.borderColor = "#c00a0a"; 
        }
      }

      updateSubmitButton();
    });
  });

  submitBtn.disabled = true;
}

async function loginReq(email, password) {
  const loader = document.getElementById('loading')
  loader.classList.remove('display')

  try {
    const newUser = { email, password }

    const response = await fetch(`https://appflix-api.onrender.com/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser)
    })

    const data = await response.json()

    const container = document.querySelector('.error-content')
    container.classList.add('display')

    if (!response.ok) {
      container.innerHTML = `<p class="txt-error">${data.message}<p>`
      container.classList.remove('display')
      throw new Error(data.message)
    }

    localStorage.setItem('token', data.token)
    window.location = './browse.html'

  } catch (e) {
    console.error(`Erro na requisição, motivo: ${e}`)
  } finally {
    loader.classList.add('display')
  }
}

async function registerReq(email, password, name, phone) {
  const loader = document.getElementById('loading')
  loader.classList.remove('display')

  try {
    const newUser = { email, password, name, phone }

    const response = await fetch(`https://appflix-api.onrender.com/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser)
    })

    const data = await response.json()

    const container = document.querySelector('.error-content')
    container.classList.add('display')

    if (!response.ok) {
      container.innerHTML = `<p class="txt-error">${data.message}<p>`
      container.classList.remove('display')
      throw new Error(data.message)
    }

    await loginReq(email, password)

  } catch (e) {
    console.error(`Erro na requisição, motivo: ${e}`)
  } finally {
    loader.classList.add('display')
  }
}

const token = localStorage.getItem('token')
if (!token) {
  startApp()
} else {
  location.href = './browse.html'
}
