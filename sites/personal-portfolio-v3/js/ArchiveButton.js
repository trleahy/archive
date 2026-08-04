document.addEventListener("DOMContentLoaded", function() {
    var floatingButton = document.getElementById("floatingButton");

    if (!floatingButton) {
        return;
    }

    floatingButton.addEventListener("click", function() {
        window.location.href = "https://trleahy.github.io/archive";
    });
});
