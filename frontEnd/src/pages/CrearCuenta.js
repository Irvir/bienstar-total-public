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
    .then(response => response.json())
    .then(result => {
        console.log("Success:", result);
        alert("Login successful!");
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Login failed!");
    });
});