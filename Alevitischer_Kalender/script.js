document.addEventListener('DOMContentLoaded', () => {
    console.log("Website loaded successfully!");

    const testBtn = document.getElementById('test-btn');
    
    if (testBtn) {
        testBtn.addEventListener('click', () => {
            alert("JavaScript is working! Your local server is good to go.");
            testBtn.textContent = "Clicked!";
        });
    }
});