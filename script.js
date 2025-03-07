document.addEventListener("DOMContentLoaded", async () => {
    const video = document.getElementById("video");
    const captureButton = document.getElementById("capture");
    const errorMessage = document.getElementById("mensaje");
    const cameraIcon = document.getElementById("camera-icon");
    const photoContainer = document.getElementById("photo-container");
    const loginForm = document.getElementById("login-form");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const loginButton = document.getElementById("login-button");
    const registerButton = document.getElementById("register-button");
    const voiceLoginButton = document.getElementById("voice-login");
    const voiceRegisterButton = document.getElementById("voice-register");
    const logoutButton = document.getElementById("logout-button");
    const attendanceTable = document.querySelector("#attendance-table tbody");
    const mainContainer = document.querySelector(".container");

    let isLoggedIn = false;
    let users = JSON.parse(localStorage.getItem("users")) || {};
    let attendance = JSON.parse(localStorage.getItem("attendance")) || [];
    let stream = null;

    mainContainer.style.display = "none";
    renderAttendanceTable();

    loginButton.addEventListener("click", () => authenticate(false));
    registerButton.addEventListener("click", () => authenticate(true));

    logoutButton.addEventListener("click", () => {
        isLoggedIn = false;
        loginForm.style.display = "block";
        mainContainer.style.display = "none";
        stopCamera();
    });

    async function startCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
            video.srcObject = stream;
            video.style.display = "block";
            cameraIcon.style.display = "none";
            errorMessage.textContent = "";
        } catch (error) {
            console.error("Error al acceder a la cámara:", error);
            errorMessage.textContent = "⚠️ No se pudo acceder a la cámara.";
        }
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
        }
    }

    captureButton.addEventListener("click", () => {
        if (!isLoggedIn) return alert("Debes iniciar sesión primero");

        const today = new Date().toISOString().split("T")[0];
        const username = usernameInput.value;

        if (attendance.some(record => record.username === username && record.date === today)) {
            alert("⚠️ Ya has registrado asistencia hoy");
            return;
        }

        attendance.push({ username, date: today });
        localStorage.setItem("attendance", JSON.stringify(attendance));
        alert("✅ Asistencia registrada exitosamente");
        renderAttendanceTable();
    });

    function renderAttendanceTable() {
        attendanceTable.innerHTML = "";
        attendance.forEach(record => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${record.username}</td><td>${record.date}</td>`;
            attendanceTable.appendChild(row);
        });
    }

    function authenticate(isRegister) {
        const username = usernameInput.value;
        const password = passwordInput.value;

        if (!username || !password) {
            alert("Por favor, ingrese un usuario y una contraseña");
            return;
        }

        if (isRegister) {
            if (users[username]) return alert("⚠️ El usuario ya existe");
            users[username] = password;
            localStorage.setItem("users", JSON.stringify(users));
            alert("✅ Usuario registrado exitosamente");
        } else {
            if (users[username] !== password) return alert("⚠️ Credenciales incorrectas");
            isLoggedIn = true;
            loginForm.style.display = "none";
            mainContainer.style.display = "block";
            startCamera();
        }
    }
});
