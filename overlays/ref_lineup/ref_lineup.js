const ws = new WebSocket("ws://localhost:3000");
let refLineupVisibility = false;
const refLineupWrapper = document.getElementById("refLineupWrapper");
const pieces = document.querySelectorAll(".piece");

ws.onmessage = (event) => {
    if (event.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = function () {
            try {
                const data = JSON.parse(reader.result);
                handleMessage(data);
            } catch (error) {
                console.error("❌ Error parsing JSON:", error);
            }
        };
        reader.readAsText(event.data);
    } else { 
        try {
            const data = JSON.parse(event.data);
            handleMessage(data);
        } catch (error) {
            console.error("❌ Error parsing JSON:", error);
        }
    }
};

function handleMessage(data) {
    if (data.type === "toggleRefLineup") {
        toggleRefLineup();
    }
}

function toggleRefLineup() {
    if (refLineupVisibility) {
        pieces.forEach((el, i) => {
            el.classList.remove(`enter-${i + 1}`); // Remove enter classes
            el.classList.add(`exit-${i + 1}`);
        });

        setTimeout(() => {
            refLineupWrapper.style.animation = "slideDown 1s ease forwards"; // Add animation to the wrapper
            setTimeout(() => {
                pieces.forEach((el) => {
                    el.classList.remove(
                        "exit-1",
                        "exit-2",
                        "exit-3",
                        "exit-4",
                        "exit-5",
                        "exit-6"
                    ); // Remove all classes
                    el.classList.add("piece"); // Add the base class back
                });
                refLineupWrapper.style.display = "none"; // Hide the wrapper after animation
            }, 1200); // RefLineup will be hidden after 500ms
        }, 1200); // RefLineup will be hidden after 500ms
    } else {
        refLineupWrapper.style.display = "flex"; // Show the wrapper
        refLineupWrapper.style.animation = "slideUp 1s ease forwards"; // Add animation to the wrapper
        setTimeout(() => {
            pieces.forEach((el, i) => {
                el.classList.remove(
                    "exit-1",
                    "exit-2",
                    "exit-3",
                    "exit-4",
                    "exit-5",
                    "exit-6"
                );
                el.classList.add(`enter-${i + 1}`); // Add enter classes
            });    
        }, 500);
    }
    refLineupVisibility = !refLineupVisibility; // Toggle visibility state  
}