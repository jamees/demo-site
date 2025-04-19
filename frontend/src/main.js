const apiURL = import.meta.env.VITE_API_URL;
let currentUserId = "";

import { datadogRum } from '@datadog/browser-rum';

datadogRum.init({
    applicationId: '4f29f2a0-4906-4287-9144-208a2c98d33b',
    clientToken: 'pub5c5f1f2bfdc817369d4ed601ca10eb44',
    // `site` refers to the Datadog site parameter of your organization
    // see https://docs.datadoghq.com/getting_started/site/
    site: 'us5.datadoghq.com',
    service: 'demo-uv',
    env: 'prod',
    // Specify a version number to identify the deployed version of your application in Datadog
    // version: '1.0.0',
    sessionSampleRate: 100,
    sessionReplaySampleRate: 20,
    defaultPrivacyLevel: 'mask-user-input',
});

document.getElementById("buscarBtn").addEventListener("click", () => {
  currentUserId = document.getElementById("userIdInput").value.trim();
  document.getElementById("registerMsg").textContent = "";
  document.getElementById("error").textContent = "";
  const tbody = document.querySelector("#userTable tbody");
  tbody.innerHTML = ""; // Limpiar tabla antes de buscar
  cargarUsuarios();
});

function cargarUsuarios() {
  fetch(apiURL, {
    headers: currentUserId ? { "x-user-id": currentUserId } : {}
  })
    .then(res => {
      if (!res.ok) throw new Error("No autorizado o error de servidor");
      return res.json();
    })
    .then(data => {
      const tbody = document.querySelector("#userTable tbody");
      tbody.innerHTML = "";
      data.forEach(user => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${user.id}</td>
          <td>${user.email}</td>
          <td>${new Date(user.created_at).toLocaleString()}</td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch(err => {
      document.getElementById("error").textContent = "❌ Error cargando datos: " + err.message;
    });
}

cargarUsuarios();

const form = document.getElementById("registerForm");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const msg = document.getElementById("registerMsg");

  try {
    const res = await fetch(`${apiURL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      msg.textContent = "❌ " + (data.error || "Error al registrar usuario");
      msg.className = "error";
    } else {
      msg.textContent = "✅ Usuario registrado exitosamente";
      msg.className = "success";
      form.reset();
      cargarUsuarios();
    }
  } catch (err) {
    msg.textContent = "❌ Error en el servidor";
    msg.className = "error";
  }
});
