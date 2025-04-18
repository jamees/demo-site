const apiURL = import.meta.env.VITE_API_URL;

function cargarUsuarios() {
  fetch(apiURL)
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
