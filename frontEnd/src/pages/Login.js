document.getElementById("LoginForm").addEventListener("submit", function(event) {
    event.preventDefault();
    const data = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };
    fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        console.log("Success:", result);
    
    })
    .catch(error => {
        console.error("Error:", error);

    });
});
