const form = document.getElementById('fuelForm');
const resultBox = document.getElementById('resultBox');
const resultText = document.getElementById('resultText');

const EPSILON = 0.005; // L/100km tolerance for "on target"

const STATUS = {
  above: {
    alertClass: 'alert-warning',
    badgeClass: 'bg-danger',
    badgeText: 'Above Target',
    blurb: (target) => `Your baseline target was <strong>${target} L/100km</strong>. Because you've been burning more than that, you must now drive more efficiently to make it.`
  },
  below: {
    alertClass: 'alert-success',
    badgeClass: 'bg-success',
    badgeText: 'Below Target',
    blurb: (target) => `Your baseline target was <strong>${target} L/100km</strong>. You've been driving efficiently, which has given you a comfortable fuel buffer!`
  },
  on: {
    alertClass: 'alert-info',
    badgeClass: 'bg-info',
    badgeText: 'On Target',
    blurb: (target) => `Your baseline target is <strong>${target} L/100km</strong>. You are perfectly on track to reach your destination exactly on empty.`
  }
};

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const tankCapacity = parseFloat(document.getElementById('tankCapacity').value);
  const totalKm = parseFloat(document.getElementById('totalKm').value);
  const coveredKm = parseFloat(document.getElementById('coveredKm').value);
  const fuelPercent = parseFloat(document.getElementById('fuelPercent').value);

  const error = validateInputs({ tankCapacity, totalKm, coveredKm, fuelPercent });
  if (error) {
    showResult(error, 'alert-secondary');
    return;
  }

  if (coveredKm >= totalKm) {
    showResult('You have already reached or passed your destination distance!', 'alert-secondary');
    return;
  }

  const distanceLeft = totalKm - coveredKm;
  const fuelLeftInLiters = tankCapacity * (fuelPercent / 100);
  const requiredConsumption = (fuelLeftInLiters / distanceLeft) * 100;
  const targetConsumption = (tankCapacity / totalKm) * 100;

  if (requiredConsumption <= 0) {
    showResult('You have no fuel left!', 'alert-danger');
    return;
  }

  const diff = requiredConsumption - targetConsumption;
  const key = Math.abs(diff) < EPSILON ? 'on' : (diff < 0 ? 'above' : 'below');
  const status = STATUS[key];

  const target = targetConsumption.toFixed(2);
  const message = `
    To travel the remaining <strong>${distanceLeft} km</strong> with <strong>${fuelLeftInLiters.toFixed(1)} L</strong> of fuel, you must maintain a maximum average of:<br><br>
    <span class="fs-1 fw-bold text-dark">${requiredConsumption.toFixed(2)} L/100km</span>
    <hr>
    <span class="badge ${status.badgeClass} fs-6 mb-2 px-3 py-2">${status.badgeText}</span><br>
    <span class="text-muted small">${status.blurb(target)}</span>
  `;

  showResult(message, status.alertClass);
});

function validateInputs({ tankCapacity, totalKm, coveredKm, fuelPercent }) {
  if (![tankCapacity, totalKm, coveredKm, fuelPercent].every(Number.isFinite)) {
    return 'Please enter valid numbers in all fields.';
  }
  if (tankCapacity <= 0) return 'Tank capacity must be greater than 0.';
  if (totalKm <= 0) return 'Total distance must be greater than 0.';
  if (coveredKm < 0) return 'Covered distance cannot be negative.';
  if (fuelPercent < 0 || fuelPercent > 100) return 'Fuel level must be between 0 and 100%.';
  return null;
}

function showResult(message, alertClass) {
  resultBox.className = `alert mt-4 text-center shadow-sm ${alertClass}`;
  resultText.innerHTML = message;
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // Offline support is optional; stay silent if registration fails.
    });
  });
}
