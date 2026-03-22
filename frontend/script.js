document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded");

  const auth = firebase.auth();
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const userInfo = document.getElementById("userInfo");

  function loadMyReports() {
    const user = firebase.auth().currentUser;
    const container = document.getElementById("myReports");

    if (!container) return;

    if (!user) {
      container.innerHTML = "Please login to view your reports.";
      return;
    }

    fetch("http://127.0.0.1:5000/reports")
      .then(res => res.json())
      .then(data => {
        container.innerHTML = "";

        const myReports = data.filter(r => r.user_uid === user.uid);

        if (myReports.length === 0) {
          container.innerHTML = "No reports yet.";
          return;
        }

        myReports.forEach(report => {
          const div = document.createElement("div");
          div.style.border = "1px solid #ddd";
          div.style.padding = "10px";
          div.style.marginBottom = "10px";

          div.innerHTML = `
            <div style="display:flex;gap:12px;align-items:flex-start">
              <img src="http://127.0.0.1:5000/uploads/${report.image}"style="width:72px;height:72px;object-fit:cover;border-radius:8px;flex-shrink:0"onerror="this.style.display='none'" />
    <div>
      <strong style="text-transform:capitalize">${report.issue_type}</strong><br>
      📍 ${Number(report.latitude).toFixed(5)}, ${Number(report.longitude).toFixed(5)}<br>
      <small>${new Date(report.timestamp).toLocaleString()}</small><br>
      <button onclick="deleteReport('${report.id}')"
              style="margin-top:8px;width:auto;padding:6px 14px;font-size:13px;background:#ef4444">
        🗑 Delete
      </button>
    </div>
  </div>
`;

          container.appendChild(div);
        });
      })
      .catch(() => {
        container.innerHTML = "Failed to load reports.";
      });
    }
  let publicMap = null;

function loadPublicMap() {
  fetch("http://127.0.0.1:5000/reports")
    .then(res => res.json())
    .then(data => {
      if (!Array.isArray(data)) return;

      const mapContainer = document.getElementById("publicMap");
      if (!mapContainer) return;

      const validReports = data.filter(r => {
        const lat = Number(r.latitude);
        const lng = Number(r.longitude);
        return !isNaN(lat) && !isNaN(lng);
      });

      // Destroy old map instance before re-rendering
      if (publicMap) {
        publicMap.remove();
        publicMap = null;
      }

      const centerLat = validReports.length > 0 ? Number(validReports[0].latitude) : 12.9716;
      const centerLng = validReports.length > 0 ? Number(validReports[0].longitude) : 77.5946;

      publicMap = L.map("publicMap").setView([centerLat, centerLng], 14);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap © CartoDB"
      }).addTo(publicMap);

      const clusterGroup = L.markerClusterGroup();

      const icons = {
        pothole: L.divIcon({
          className: "",
          html: `<div style="background:#ef4444;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        }),
        streetlight: L.divIcon({
          className: "",
          html: `<div style="background:#f59e0b;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        })
      };

      validReports.forEach(report => {
        const lat = Number(report.latitude);
        const lng = Number(report.longitude);
        const icon = icons[report.issue_type] || icons.pothole;

        const marker = L.marker([lat, lng], { icon });
        marker.bindPopup(`
          <div style="min-width:180px">
            <strong style="text-transform:capitalize">${report.issue_type}</strong><br>
            <img src="http://127.0.0.1:5000/uploads/${report.image}" style="width:100%;border-radius:6px;margin:6px 0" onerror="this.style.display='none'" /><br> 📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}<br>
    <small>${new Date(report.timestamp).toLocaleString()}</small>
  </div>
`);
        clusterGroup.addLayer(marker);
      });

      publicMap.addLayer(clusterGroup);

      if (validReports.length > 0) {
        publicMap.fitBounds(clusterGroup.getBounds(), { padding: [40, 40] });
      }
    })
    .catch(err => console.log("Public map load failed:", err));
}




  window.deleteReport = function(reportId) {
    const user = firebase.auth().currentUser;

    fetch("http://127.0.0.1:5000/delete-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        report_id: reportId,
        user_uid: user.uid
      })
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      loadMyReports();
      loadPublicMap();

    })
    .catch(() => alert("Delete failed"));
  };


  // ---------- AUTH ----------
  loginBtn.addEventListener("click", () => {
    console.log("Login clicked");
    auth.signInWithPopup(provider)
      .then(result => {
        console.log("Logged in:", result.user.email);
      })
      .catch(error => {
        console.error("Login error:", error);
        alert(error.message);
      });
  });

  logoutBtn.addEventListener("click", () => {
    auth.signOut();
  });

  auth.onAuthStateChanged(user => {
  const container = document.getElementById("myReports");

  if (user) {
    userInfo.innerText =
      `Logged in as ${user.displayName} (${user.email})`;

    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";

    loadMyReports();   // ← THIS is the important addition
  } else {
    userInfo.innerText = "Please login to report an issue";

    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";

    if (container) {
      container.innerHTML = "Please login to view your reports.";
    }
  }
  loadPublicMap(); 
});




  // ---------- LOCATION ----------
  let userLatitude = null;
  let userLongitude = null;
  let locationAccuracy = null;

  function getLocation(callback) {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        userLatitude = position.coords.latitude;
        userLongitude = position.coords.longitude;
        locationAccuracy = position.coords.accuracy;

        document.getElementById("result").innerHTML =
          `Live Location Captured<br>
           Latitude: ${userLatitude.toFixed(5)}<br>
           Longitude: ${userLongitude.toFixed(5)}<br>
           Accuracy: ${locationAccuracy.toFixed(1)} meters`;

        updateMap(userLatitude, userLongitude);
        if (callback) callback();
      },
      () => alert("Location permission denied"),
      { enableHighAccuracy: true }
    );
  }

  function updateMap(lat, lng) {
    document.getElementById("mapFrame").src =
      `https://maps.google.com/maps?q=${lat},${lng}&z=17&output=embed`;
  }

  // ---------- UPLOAD ----------
  window.upload = function () {
    const user = firebase.auth().currentUser;
    if (!auth.currentUser) {
      alert("Please login first");
      return;
    }

    getLocation(() => {
      const issueType = document.getElementById("issueType").value;
      const file = document.getElementById("fileInput").files[0];

      if (!file) {
        alert("Please upload an image");
        return;
      }

      let formData = new FormData();
      formData.append("issue_type", issueType);
      formData.append("latitude", userLatitude);
      formData.append("longitude", userLongitude);
      formData.append("file", file);
      
      formData.append("user_email", user.email);
      formData.append("user_uid", user.uid);
      formData.append("user_name", user.displayName || "Unknown");


      fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData
      })
        .then(res => res.json())
        .then(data => {document.getElementById("result").innerHTML = `✅ ${data.message}`;

        loadMyReports();
        loadPublicMap();
      })

        .catch(err => {
          document.getElementById("result").innerHTML = `❌ ${err.message}`;
        });
    });
  };
});
