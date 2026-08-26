document.getElementById('fuelForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent page reload

    // Fetch input values
    const tankCapacity = parseFloat(document.getElementById('tankCapacity').value);
    const totalKm = parseFloat(document.getElementById('totalKm').value);
    const coveredKm = parseFloat(document.getElementById('coveredKm').value);
    const fuelPercent = parseFloat(document.getElementById('fuelPercent').value);

    // Basic validation
    if (coveredKm >= totalKm) {
        showResult('You have already reached or passed your destination distance!', 'alert-secondary');
        return;
    }

    // Calculations
    const distanceLeft = totalKm - coveredKm;
    const fuelLeftInLiters = tankCapacity * (fuelPercent / 100);
    
    // 1. What you need for the rest of the trip
    const requiredConsumption = (fuelLeftInLiters / distanceLeft) * 100;
    
    // 2. The baseline target for the whole trip (assuming a full tank)
    const targetConsumption = (tankCapacity / totalKm) * 100;

    // Display results
    if (requiredConsumption <= 0) {
        showResult('You have no fuel left!', 'alert-danger');
        return;
    } 

    // Determine if they are over or under the baseline target
    let comparisonHtml = "";
    let alertBoxColor = "alert-success"; // Default to green

    if (requiredConsumption < targetConsumption) {
        // Required is stricter than the baseline -> They've been over-consuming
        alertBoxColor = "alert-warning"; // Change box to yellow/warning
        comparisonHtml = `
            <hr>
            <span class="badge bg-danger fs-6 mb-2 px-3 py-2">Over Target</span><br>
            <span class="text-muted small">
                Your baseline target was <strong>${targetConsumption.toFixed(2)} L/100km</strong>. 
                Because you've been burning more than that, you must now drive more efficiently to make it.
            </span>`;
    } else if (requiredConsumption > targetConsumption) {
        // Required is looser than the baseline -> They've been under-consuming (saving fuel)
        comparisonHtml = `
            <hr>
            <span class="badge bg-success fs-6 mb-2 px-3 py-2">Below Target</span><br>
            <span class="text-muted small">
                Your baseline target was <strong>${targetConsumption.toFixed(2)} L/100km</strong>. 
                You've been driving efficiently, which has given you a comfortable fuel buffer!
            </span>`;
    } else {
        // Exactly on track
        comparisonHtml = `
            <hr>
            <span class="badge bg-info fs-6 mb-2 px-3 py-2">Perfectly On Target</span><br>
            <span class="text-muted small">
                Your baseline target is <strong>${targetConsumption.toFixed(2)} L/100km</strong>. 
                You are perfectly on track to reach your destination exactly on empty.
            </span>`;
    }

    // Assemble the final message
    const message = `
        To travel the remaining <strong>${distanceLeft} km</strong> with <strong>${fuelLeftInLiters.toFixed(1)} L</strong> of fuel, you must maintain a maximum average of:<br><br>
        <span class="fs-1 fw-bold text-dark">${requiredConsumption.toFixed(2)} L/100km</span>
        ${comparisonHtml}
    `;
    
    showResult(message, alertBoxColor);
});

// Helper function to update the UI alert box
function showResult(message, alertClass) {
    const resultBox = document.getElementById('resultBox');
    const resultText = document.getElementById('resultText');
    
    // Reset classes and apply the new alert color
    resultBox.className = `alert mt-4 text-center shadow-sm ${alertClass}`;
    
    // Set message and display
    resultText.innerHTML = message;
    resultBox.classList.remove('d-none');
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch((error) => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}