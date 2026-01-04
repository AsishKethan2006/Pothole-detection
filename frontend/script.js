let userLatitude = null;
let userLongitude = null;
let locationAccuracy = null;

/* STEP 1: Get live GPS location */
function getLocation(callback) {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by this browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    position => {
      userLatitude = position.coords.latitude;
      userLongitude = position.coords.longitude;
      locationAccuracy = position.coords.accuracy;

      let accuracyText =
        locationAccuracy > 1000
          ? "Low (Network-based location)"
          : locationAccuracy.toFixed(1) + " meters";

      document.getElementById("result").innerHTML =
        `Live Location Captured<br>
         Latitude: ${userLatitude.toFixed(5)}<br>
         Longitude: ${userLongitude.toFixed(5)}<br>
         Accuracy: ${accuracyText}`;

      updateMap(userLatitude, userLongitude);

      if (callback) callback();
    },
    () => {
      alert("Location permission denied.");
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}

/* STEP 2: Update map (NO API KEY – stable) */
function updateMap(lat, lng) {
  document.getElementById("mapFrame").src =
    `https://maps.google.com/maps?q=${lat},${lng}&z=17&output=embed`;
}

/* STEP 3: Upload issue */
function upload() {
  getLocation(() => {
    const issueType = document.getElementById("issueType").value;

    let formData = new FormData();
    formData.append("issue_type", issueType);
    formData.append("latitude", userLatitude);
    formData.append("longitude", userLongitude);

    fetch("http://127.0.0.1:5000/upload", {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        document.getElementById("result").innerHTML +=
          `<br><br>
           Detected Issue: <b>${data.issue.toUpperCase()}</b><br>
           Severity Level: ${data.severity}`;
      });
  });
}
