document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("entryForm");

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        // Split the "name" field into First and Last
        const fName = form.firstName.value.trim();
        const lName = form.lastName.value.trim();

        const entry = {
            firstName: fName,
            lastName: lName,
            city: form.city.value.trim(),
            state: form.state.value.trim(),
            numberOfPeople: form.numberOfPeople.value,
            price: form.price.value
        };

        fetch("/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(entry)
        })
        .then(response => response.text())
        .then(message => {
            alert(message);
            form.reset();
        })
        .catch(err => alert("Submit Error: " + err));
    });
});