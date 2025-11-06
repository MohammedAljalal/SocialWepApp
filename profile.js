
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get("userid");


const navLinks = document.querySelector(".navbar-nav.navbar-right");
const addCommentBox = document.getElementById("add-comment-box"); 
const postsContainer = document.getElementById("user-posts"); 
function extractImageUrl(value) {
  const defaultImage = "photo2.jpg";
  if (!value) return defaultImage;
  if (typeof value === "string") {
    value = value.trim();
    return value !== "" ? value : defaultImage;
  }
  if (typeof value === "object") {
    const keys = ["url", "image", "path", "src"];
    for (let key of keys) {
      if (value[key] && typeof value[key] === "string" && value[key].trim() !== "") {
        return value[key].trim();
      }
    }
  }
  return defaultImage;
}


function updateNavbar() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (token && user) {
    navLinks.innerHTML = `
      <li>
        <a href="profile.html?userid=${user.id}" style="display:flex; align-items:center; gap:5px; padding:5px 10px;margin-top:4px">
          <img src="${extractImageUrl(user.profile_image)}" 
               style="width:30px; height:30px; border-radius:50%;">
          <span style="color:white;">@${user.username}</span>
        </a>
      </li>
      <li>
        <a href="#" onclick="logout()" style="color:red;">
          <span class="glyphicon glyphicon-log-out"></span> Logout
        </a>
      </li>
    `;
    if (addCommentBox) addCommentBox.style.display = "block";
  } else {
    navLinks.innerHTML = `
      <li><a href="#" data-toggle="modal" data-target="#login"><span class="glyphicon glyphicon-log-in"></span> Login</a></li>
      <li><a href="#" data-toggle="modal" data-target="#register"><span class="glyphicon glyphicon-user"></span> Register</a></li>
    `;
    if (addCommentBox) addCommentBox.style.display = "none";
  }
}

function getUserInfo() {
  if (!userId) return;

  axios.get(`https://tarmeezacademy.com/api/v1/users/${userId}`)
    .then(response => {
      const user = response.data.data;
      document.querySelector(".profile-header img").src = extractImageUrl(user.profile_image);
      document.querySelector(".profile-header h2").textContent = "@" + user.username;
      document.querySelector(".profile-stats div:nth-child(1) span").textContent = user.posts_count;
      document.querySelector(".profile-stats div:nth-child(2) span").textContent = user.comments_count;
    })
    .catch(err => console.error(err));
}

function getUserPosts() {
  if (!userId) return;

  const currentUser = JSON.parse(localStorage.getItem("user"));

  axios.get(`https://tarmeezacademy.com/api/v1/users/${userId}/posts`)
    .then(response => {
      const posts = response.data.data;
      if (!postsContainer) return;
      postsContainer.innerHTML = "";

      posts.forEach(post => {
        const imageUrl = extractImageUrl(post.image);
        const authorImg = extractImageUrl(post.author?.profile_image);

        let buttonsHTML = "";
        if (currentUser && post.author.id === currentUser.id) {
          buttonsHTML = `
            <button class="btn btn-primary btn-sm">Edit</button>
            <button class="btn btn-danger btn-sm">Delete</button>
          `;
        }

        const postHTML = `
          <div class="post-card">
            <div class="card-header">
              <img src="${authorImg}" alt="">
              <b>@${post.author.username}</b>
            </div>
            <div class="card-body">
              <img class="post-img" src="${imageUrl}" alt="">
              <h5>${post.title || ""}</h5>
              <p>${post.body || ""}</p>
              <hr>
              <div class="post-actions">
                <span>${post.comments_count} comments</span>
                <div>${buttonsHTML}</div>
              </div>
            </div>
          </div>
        `;
        postsContainer.insertAdjacentHTML("beforeend", postHTML);
      });
    })
    .catch(err => console.error(err));
}

function registerUser() {
  const name = document.getElementById("reg-name").value.trim();
  const username = document.getElementById("reg-username").value.trim();
  const password = document.getElementById("reg-password").value.trim();
  const imageFile = document.getElementById("reg-image").files[0];

  if (!name || !username || !password) {
    alert("⚠️ Please fill all fields!");
    return;
  }

  const formData = new FormData();
  formData.append("name", name);
  formData.append("username", username);
  formData.append("password", password);
  if (imageFile) formData.append("profile_image", imageFile);

  axios.post("https://tarmeezacademy.com/api/v1/register", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
    .then(res => {
      const tokenValue = res.data.data?.token || res.data.token;
      const userValue  = res.data.data?.user  || res.data.user;

      if(!tokenValue || !userValue){
        alert("❌ Registration failed: token/user missing.");
        return;
      }

      localStorage.setItem("token", tokenValue);
      localStorage.setItem("user", JSON.stringify(userValue));

      $("#register").modal('hide'); 
      updateNavbar();
      alert("✅ Registered successfully!");
      getUserPosts(); 
    })
    .catch(err => {
      console.error(err);
      alert("❌ Registration failed. Try again.");
    });
}

function loginuser() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("⚠️ Please enter both username and password!");
    return;
  }

  axios.post("https://tarmeezacademy.com/api/v1/login", { username, password })
    .then(res => {
      const tokenValue = res.data.data?.token || res.data.token;
      const userValue  = res.data.data?.user  || res.data.user;

      if(!tokenValue || !userValue){
        alert("❌ Login failed: token/user missing.");
        return;
      }

      localStorage.setItem("token", tokenValue);
      localStorage.setItem("user", JSON.stringify(userValue));

      $("#login").modal('hide'); 
      updateNavbar(); 
      alert("✅ Logged in successfully!");
      getUserPosts();
    })
    .catch(err => {
      console.error(err);
      alert("❌ Login failed. Check your credentials.");
    });
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  updateNavbar();
  alert("👋 Logged out successfully!");
}

document.addEventListener("DOMContentLoaded", () => {
  updateNavbar();
  const profileNavItem = document.querySelector(".nav.navbar-nav li.active");
  if (profileNavItem) {
    profileNavItem.style.display = "none";
  }

  if (!userId) {
    alert("⚠️ User not found!");
    return;
  }
  getUserInfo();
  getUserPosts();
});

