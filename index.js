let currentpage = 1;
let lastpage = 1;
let isLoading = false;

window.addEventListener("scroll", function () {
  const endOfPage =
    window.innerHeight + window.pageYOffset >= document.body.scrollHeight - 10;

  if (endOfPage && currentpage < lastpage && !isLoading) {
    currentpage++;
    showpost(false, currentpage);
  }
});

function extractImageUrl(value) {
  const defaultImage = "Photo2.jpg";
  if (!value) return defaultImage;
  if (typeof value === "string") {
    value = value.trim();
    return value !== "" ? value : defaultImage;
  }
  if (typeof value === "object") {
    const keys = ["url", "image", "path", "src", "full", "large", "thumbnail"];
    for (let key of keys) {
      if (value[key] && typeof value[key] === "string" && value[key].trim() !== "") {
        return value[key].trim();
      }
    }
  }
  return defaultImage;
}

function showpost(reload = true, page = 1) {
  isLoading = true;
  document.getElementById("loader").style.display = "flex"; 
  let url1 = `https://tarmeezacademy.com/api/v1/posts?limit=10&page=${page}`;

  axios
    .get(url1)
    .then(function (response) {
      let posts = response.data.data;
      lastpage = response.data.meta.last_page;

      if (reload) {
        document.getElementById("post").innerHTML = "";
      }

      for (let post of posts) {
        let imageUrl = extractImageUrl(post.image);
        if (!imageUrl) imageUrl = "Photo2.jpg";

        let authorImg = extractImageUrl(post.author?.profile_image);
        if (!authorImg) authorImg = "Photo2.jpg";
        const currentUser = getuser();
        const isOwner = currentUser && post.author.id === currentUser.id;

        let content = `
<div class="card shadow-lg mb-4 post-card" data-id="${post.id}" data-author-id="${post.author.id}">
  <div class="card-header shadow-lg">
    <div style="background-color: #2a2a2a;; padding: 4px; color: white; display: flex; align-items: center; gap: 8px;">
      <img src="${authorImg}" alt="author" width="40" height="40" class="rounded-circle border border-1">
      <b>${post.author.name}</b>
    </div>
  </div>
  <div class="card-body">
    <div id="bodycard" onclick="postinfo()">
      <img id="post-img-${post.id}" style="width: 100%;" src="${imageUrl}" alt="post image">
      <h6 style="color: rgb(124, 121, 121);">${post.created_at}</h6>
      <h5 class="card-title" id="post-title-${post.id}">${post.title || ""}</h5>
      <p class="card-text" id="post-body-${post.id}">${post.body || ""}</p>
    </div>
    <hr>
    <div class="d-flex justify-content-between align-items-center" style="display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 5px; color: white;">
        <svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
            class="bi bi-pen" viewBox="0 0 16 16">
         <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.233.131l-5 1a.5.5 0 0 1-.606-.606l1-5a.5.5 0 0 1 .131-.232l10-10zM11.207 2L3 10.207V13h2.793L14 4.793 11.207 2z"/>
        </svg>
        <b> (${post.comments_count}) comments</b>
      </div>
      <div style="display: flex; gap: 8px;">
        ${isOwner ? `
          <button class="btn btn-primary btn-sm edit-btn" data-postid="${post.id}" data-toggle="modal" data-target="#editmodal">Edit</button>
          <button class="btn btn-danger btn-sm delete-btn" data-postid="${post.id}">Delete</button>
        ` : ""}
      </div>
    </div>
  </div>
</div>
`;

        document.getElementById("post").innerHTML += content;
      }
      attachPostEventListeners();
    })
    .catch(function (error) {
      console.log(error);
    })
    .finally(function () {
      isLoading = false;
      document.getElementById("loader").style.display = "none";
    });
}

document.addEventListener("DOMContentLoaded", showpost(true, currentpage));

function loginuser(){
  const username= document.getElementById("username").value;
  const password= document.getElementById("password").value;
  axios.post("https://tarmeezacademy.com/api/v1/login",{
     username:username,
    password:password
  })
  .then((response) => {
    console.log("✅ Login successful", response.data);
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    $('#login').modal('hide');
    setTimeout(() => {
      alert("✅ Login successful");
    },500);
    setupui();
  })
  .catch((error) => {
    console.log("❌ Login error:", error);
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Response:", error.response.data);
      alert("⚠️ " + (error.response.data.message || "Check username and password"));
    } else {
      alert("❌ Connection to server failed");
    }
  });
}

function closelogin(){
  $('#login').modal('hide');
}

setupui();
function setupui(){
  const information=document.getElementById("information");
  const taken=localStorage.getItem("token");
  if(taken==null){
    addpost.style.setProperty("display" ,"none","important");
    logintn.style.setProperty("display" ,"flex","important");
    registerbtn.style.setProperty("display" ,"flex","important");
    logoutbtn.style.setProperty("display" ,"none","important");
    information.style.setProperty("display" ,"none","important");
  } else {
    addpost.style.setProperty("display" ,"flex","important");
    logintn.style.setProperty("display" ,"none","important");
    registerbtn.style.setProperty("display" ,"none","important");
    logoutbtn.style.setProperty("display" ,"flex","important");
    information.style.setProperty("display" ,"flex","important");
    const userr=getuser();
    document.getElementById("user_name").innerHTML=userr.username;
    document.getElementById("user_image").src=extractImageUrl(userr.profile_image);
  }
}

function logout(){
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  alert("✅ Logout successful");
  setupui();
}

function registerUser() {
  const name = document.getElementById("reg-name").value.trim();
  const username = document.getElementById("reg-username").value.trim().toLowerCase();
  const password = document.getElementById("reg-password").value.trim();
  const imageFile = document.getElementById("reg-image").files[0];

  if (!name || !username || !password) {
    alert("⚠️ Please fill in all required fields.");
    return;
  }

  const formData = new FormData();
  formData.append("name", name);
  formData.append("username", username);
  formData.append("password", password);
  if (imageFile) formData.append("image", imageFile); 

  axios.post("https://tarmeezacademy.com/api/v1/register", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  })
  .then((response) => {
    console.log("✅ Registration successful:", response.data);
    localStorage.setItem("token", response.data.token);
    document.activeElement.blur();
    $('#registerModal').modal('hide');
    setTimeout(() => {
      alert("🎉 Registration successful, welcome " + response.data.user.username);
    }, 100);
  })
  .catch((error) => {
    console.log("❌ Registration error:", error);
    if (error.response) {
      if (error.response.status === 422) {
        const message = error.response.data.message || "⚠️ Invalid registration data or username already exists.";
        alert(message);
      } else {
        alert("⚠️ Registration error: " + error.response.statusText);
      }
    } else {
      alert("❌ Connection to server failed.");
    }
  });
}

async function addposts() {
  try {
    const posttitle = document.getElementById("posttitle").value.trim();
    const postbody = document.getElementById("postbody").value.trim();
    const postaddimage = document.getElementById("postreg-image").files[0];

    const formData = new FormData();
    formData.append("title", posttitle);
    formData.append("body", postbody);
    if (postaddimage) formData.append("image", postaddimage);

    const token = localStorage.getItem("token");
    if (!token) {
      alert("⚠️ Please login first to add a post.");
      return;
    }

    const headers = { "authorization": `Bearer ${token}` };

    const response = await axios.post(
      "https://tarmeezacademy.com/api/v1/posts",
      formData,
      { headers:headers }
    );

    const newPost = response.data.data;
    console.log("✅ Post added successfully:", newPost);
    showpost(true,1);
    $('#creatpost').modal('hide');
    document.getElementById("posttitle").value = "";
    document.getElementById("postbody").value = "";
    document.getElementById("postreg-image").value = "";

    alert("🎉 Post published successfully!");
    showpost(false,currentpage);

  } catch (error) {
    console.error("❌ Error adding post:", error);
    if (error.response) {
      if (error.response.status === 401) {
        alert("⚠️ Make sure you are logged in.");
      } else {
        alert("⚠️ " + (error.response.data?.message || "Error publishing post."));
      }
    } else {
      alert("❌ Connection to server failed.");
    }
  }
}

function getuser(){
  let user= null;
  const userstorage=localStorage.getItem("user");
  if (userstorage != null){
    user=JSON.parse(userstorage);
  }
  return user;
}

let bodycard=document.getElementById("bodycard");
bodycard.addEventListener("click",function postinfo(){
   window.location.href = `postDetails.html?id=${postId}`;
});

window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("updatePosts") === "true") {
    if (typeof showPosts === "function") {
      showpost(false,currentpage); 
    } else if (typeof fetchPosts === "function") {
      fetchPosts();
    }
    localStorage.removeItem("updatePosts");
  }
});

function attachPostEventListeners() {
  const currentUser = getuser(); 

  document.querySelectorAll(".post-card").forEach(post => {
    const postId = post.getAttribute("data-id");
    const authorId = post.getAttribute("data-author-id");

    post.addEventListener("click", () => {
      window.location.href = `postDetails.html?id=${postId}`;
    });

    const editBtn = post.querySelector(".edit-btn");
    if (editBtn && currentUser && currentUser.id == authorId) {
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation(); 
        openEditModal(postId);
      });
    }

    const deleteBtn = post.querySelector(".delete-btn");
    if (deleteBtn && currentUser && currentUser.id == authorId) {
      deleteBtn.addEventListener("click", async (e) => {
        e.stopPropagation();

        if (!confirm("Are you sure you want to delete this post?")) return;

        const token = localStorage.getItem("token");
        if (!token) {
          alert("⚠️ Please login first.");
          return;
        }

        try {
          await axios.delete(`https://tarmeezacademy.com/api/v1/posts/${postId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
showpost(false, currentpage);
alert("✅ Post deleted successfully!");

        } catch (err) {
          console.error(err);
          alert("❌ Error deleting post.");
        }
      });
    }

    const userHeader = post.querySelector(".card-header div");
if (userHeader) {
  userHeader.addEventListener("click", (e) => {
    e.stopPropagation(); 
    const authorId = post.getAttribute("data-author-id");
    window.location.href = `profile.html?userid=${authorId}`;
  });
}

  });
}

function openEditModal(postId) {
  const titleEl = document.getElementById(`post-title-${postId}`);
  const bodyEl = document.getElementById(`post-body-${postId}`);
  const imgEl = document.getElementById(`post-img-${postId}`);

  if (!titleEl || !bodyEl || !imgEl) return;

  // تعبئة المودال بالقيم الحالية
  document.getElementById("edit-title").value = titleEl.innerText;
  document.getElementById("edit-body").value = bodyEl.innerText;

  // معاينة الصورة
  const previewImg = document.getElementById("edit-image-preview");
  previewImg.src = imgEl.src || "Photo2.jpg";

  const fileInput = document.getElementById("edit-image");
  fileInput.value = ""; // تنظيف الاختيار السابق
  fileInput.onchange = function () {
    const file = fileInput.files[0];
    if (file) previewImg.src = URL.createObjectURL(file);
  };

 
  const saveBtn = document.getElementById("save-edit-btn");
  saveBtn.setAttribute("data-postid", postId);


  $('#editmodal').modal('show');
}

document.getElementById("save-edit-btn").addEventListener("click", async function() {
  const postId = this.getAttribute("data-postid");
  if (!postId) return alert("⚠️ Post not selected");

  const newTitle = document.getElementById("edit-title").value.trim();
  const newBody = document.getElementById("edit-body").value.trim();
  const newImage = document.getElementById("edit-image").files[0];

  const token = localStorage.getItem("token");
  if (!token) return alert("⚠️ Please login first to edit post.");

  const formData = new FormData();
  formData.append("title", newTitle);
  formData.append("body", newBody);
  if (newImage) formData.append("image", newImage);
  formData.append("_method", "PUT"); 

  try {
    await axios.post(
      `https://tarmeezacademy.com/api/v1/posts/${postId}`,
      formData,
      { headers: { Authorization: `Bearer ${token}` } } 
    );

    showpost(true, 1);

    $('#editmodal').modal('hide');
    alert("✅ Post edited successfully!");
  } catch (err) {
    console.error(err);
    alert("❌ Error editing post on server.");
  }
});
function setupNavbarUserClick() {
  const user = getuser(); 
  if (!user) return;

  const userNameEl = document.getElementById("user_name");
  const userImageEl = document.getElementById("user_image");
  if (userNameEl) {
    userNameEl.parentElement.style.cursor = "pointer"; 
    userNameEl.parentElement.addEventListener("click", () => {
      window.location.href = `profile.html?userid=${user.id}`;
    });
  }
  if (userImageEl) {
    userImageEl.parentElement.style.cursor = "pointer";
    userImageEl.parentElement.addEventListener("click", () => {
      window.location.href = `profile.html?userid=${user.id}`;
    });
  }
}
setupui();
setupNavbarUserClick();

document.addEventListener("DOMContentLoaded", () => {
  const currentUser = getuser(); 

  const profileLink = document.getElementById("nav-profile");
  if (profileLink && currentUser) {
    profileLink.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = `profile.html?userid=${currentUser.id}`;
    });
  }

});


document.addEventListener("DOMContentLoaded", () => {
  showpost(true, currentpage);
});
