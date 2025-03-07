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

    // Inicio de sesión con texto
    loginButton.addEventListener("click", () => {
        const username = usernameInput.value;
        const password = passwordInput.value;
        
        if (users[username] && users[username] === password) {
            isLoggedIn = true;
            loginForm.style.display = "none";
            mainContainer.style.display = "block";
            startCamera();
        } else {
            alert("Credenciales incorrectas");
        }
    });

    // Registro con texto
    registerButton.addEventListener("click", () => {
        const username = usernameInput.value;
        const password = passwordInput.value;

        if (!username || !password) {
            alert("Por favor, ingrese un usuario y una contraseña");
            return;
        }

        if (users[username]) {
            alert("El usuario ya existe");
            return;
        }

        users[username] = password;
        localStorage.setItem("users", JSON.stringify(users));
        alert("Usuario registrado exitosamente");
    });

    // Cerrar sesión
    logoutButton.addEventListener("click", () => {
        isLoggedIn = false;
        loginForm.style.display = "block";
        mainContainer.style.display = "none";
        stopCamera();
    });

    // Activar la cámara
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

    // Registrar asistencia
    captureButton.addEventListener("click", async () => {
        if (!isLoggedIn) return alert("Debes iniciar sesión primero");
        if (!video.srcObject) {
            alert("La cámara no está activada.");
            return;
        }

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

    // 🔹 Reconocimiento de voz para iniciar sesión
    voiceLoginButton.addEventListener("click", () => {
        startVoiceRecognition((user, pass) => {
            if (users[user] && users[user] === pass) {
                isLoggedIn = true;
                loginForm.style.display = "none";
                mainContainer.style.display = "block";
                startCamera();
            } else {
                alert("⚠️ Usuario o contraseña incorrectos.");
            }
        });
    });

    // 🔹 Reconocimiento de voz para registro
    voiceRegisterButton.addEventListener("click", () => {
        startVoiceRecognition((user, pass) => {
            if (users[user]) {
                alert("⚠️ El usuario ya existe.");
                return;
            }
            users[user] = pass;
            localStorage.setItem("users", JSON.stringify(users));
            alert("✅ Usuario registrado con éxito.");
        });
    });

    // 🔹 Función para iniciar el reconocimiento de voz
    function startVoiceRecognition(callback) {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = "es-ES";

        recognition.start();
        recognition.onresult = event => {
            const transcript = event.results[0][0].transcript.split(" ");
            const user = transcript[0];
            const pass = transcript.slice(1).join(" ");
            callback(user, pass);
        };

        recognition.onerror = () => {
            alert("⚠️ No se pudo reconocer la voz.");
        };
    }
});
