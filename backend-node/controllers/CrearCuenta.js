document.getElementById("CrearCuentaForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Evita el envío del formulario por defecto
    
    const data = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        weight: document.getElementById("weight").value,
        height: document.getElementById("height").value,
        age: document.getElementById("age").value
    };

    fetch("http://localhost:3000/registrar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })  
    .then(async response => {
        const result = await response.json();

        if (!response.ok) {
            // Errores desde el servidor (400 o 500)
            if (result.errores) {
                alert("Errores:\n" + result.errores.join("\n"));
            } else {
                alert("Error: " + (result.message || "No se pudo registrar."));
            }
        } else {
            //  Registro exitoso
            alert(result.message || "Usuario registrado exitosamente.");
            console.log("Success:", result);
            // Opcional: redirigir al login
            window.location.href = "login.html";
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Error en la conexión con el servidor");
    });
});
