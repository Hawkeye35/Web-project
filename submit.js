document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("entryForm");

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        const entry = {
            name: form.name.value,
            street: form.street.value,
            city: form.city.value,
            state: form.state.value,
            zip: form.zip.value,
            price: form.price.value
        };

        fetch("/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(entry)
        })
        .then(response => response.text())
        .then(() => {
            alert("Saved successfully!");
            form.reset();
        });

    });

});