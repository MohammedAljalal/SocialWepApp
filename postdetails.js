
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("id");
  const postContent = document.getElementById("post-content");
  const loader = document.getElementById("loader");
  const navLinks = document.getElementById("loginul");
  const addCommentBox = document.getElementById("add-comment");

  let token = localStorage.getItem("token");

  updateNavbar();

  if (!postId) {
    postContent.innerHTML = "<h4>❌ No post selected.</h4>";
  } else {
    fetchPostDetails(postId);
  }
function updateNavbar() {
  token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user")); 

  if (token && user) {
    navLinks.innerHTML = `
      <li>
        <a href="profile.html" style="display:flex; align-items:center; gap:5px; padding:5px 10px;margin-top:4px">
          <img src="${extractImageUrl(user.profile_image) || 'photo2.jpg'}" 
               style="width:30px; height:30px; border-radius:50%;">
          <span style="color:white;">${user.username}</span>
        </a>
      </li>
      <li>
        <a href="#" onclick="logout()" style="color:red;">
          <span class="glyphicon glyphicon-log-out"></span> Logout
        </a>
      </li>
    `;
    addCommentBox.style.display = "block";
  } else {
    navLinks.innerHTML = `
      <li><a href="#" data-toggle="modal" data-target="#login"><span class="glyphicon glyphicon-log-in"></span> Login</a></li>
      <li><a href="#" data-toggle="modal" data-target="#register"><span class="glyphicon glyphicon-user"></span> Register</a></li>
    `;
    addCommentBox.style.display = "none";
  }
}

  function fetchPostDetails(id) {
    loader.style.display = "flex";
    axios.get(`https://tarmeezacademy.com/api/v1/posts/${id}`)
      .then(res => {
        loader.style.display = "none";
        const post = res.data.data;
        const image = extractImageUrl(post.image) || "photo2.jpg";
        const authorImg = extractImageUrl(post.author?.profile_image) || "photo2.jpg";

        let actions = "";
        const userId = JSON.parse(localStorage.getItem("user"))?.id;
        if(userId && post.author.id === userId){
          actions = `
            <div style="margin-top:10px;">
              <button class="btn btn-primary btn-xs" onclick="editPost('${post.id}')">Edit</button>
              <button class="btn btn-danger btn-xs" onclick="deletePost('${post.id}')">Delete</button>
            </div>
          `;
        }

        postContent.innerHTML = `
          <div>
            <div style="display:flex; align-items:center;">
              <img src="${authorImg}" width="45" height="45" style="border-radius:50%; margin-right:10px;">
              <div>
                <strong>${post.author.name}</strong><br>
                <small class="text-muted">${post.created_at}</small>
              </div>
            </div>
            <hr>
            <img src="${image}" class="post-img" alt="Post Image">
            <h3 id="post-title-${post.id}">${post.title || ""}</h3>
            <p id="post-body-${post.id}">${post.body || ""}</p>
            ${actions}
            <hr>
            <b>${post.comments_count}</b> Comments
          </div>
        `;
        showComments(post.comments);
      })
      .catch(() => {
        loader.style.display = "none";
        postContent.innerHTML = "<h4>⚠️ Error loading post.</h4>";
      });
  }

  function showComments(comments) {
    const container = document.getElementById("comments-container");
    container.innerHTML = "";

    if (!comments || comments.length === 0) {
      container.innerHTML = "<p class='text-muted'>No comments yet.</p>";
      return;
    }

    const userId = JSON.parse(localStorage.getItem("user"))?.id;

    comments.forEach(c => {
      const userImg = extractImageUrl(c.author?.profile_image) || "photo2.jpg";
      let actions = "";
      if(userId && c.author.id === userId){
        actions = `
          <div style="margin-top:5px;">
            <button class="btn btn-primary btn-xs" onclick="editComment('${c.id}')">Edit</button>
            <button class="btn btn-danger btn-xs" onclick="deleteComment('${c.id}')">Delete</button>
          </div>
        `;
      }

      container.innerHTML += `
        <div class="comment-box" id="comment-${c.id}">
          <div style="display:flex; align-items:center;">
            <img src="${userImg}" alt="user">
            <b>${c.author.username}</b>
          </div>
          <p style="margin-top:5px;" id="comment-body-${c.id}">${c.body}</p>
          ${actions}
        </div>
      `;
    });
  }
function addComment() {
  token = localStorage.getItem("token"); 
  if(!token){
    alert("⚠️ You must login first!");
    return;
  }

  const body = document.getElementById("comment-input").value.trim();
  if (!body) {
    alert("⚠️ Please write a comment first!");
    return;
  }

  axios.post(`https://tarmeezacademy.com/api/v1/posts/${postId}/comments`,
    { body },
    { headers: { authorization: `Bearer ${token}` } }
  )
  .then(() => {
    document.getElementById("comment-input").value = "";
    fetchPostDetails(postId); 
  })
  .catch(() => alert("An error occurred while adding the comment."));
}
  function editPost(postId){
    const title = document.getElementById(`post-title-${postId}`).innerText;
    const body = document.getElementById(`post-body-${postId}`).innerText;

    const newTitle = prompt("Edit title:", title);
    if(newTitle === null) return;
    const newBody = prompt("Edit body:", body);
    if(newBody === null) return;

    axios.put(`https://tarmeezacademy.com/api/v1/posts/${postId}`,
      { title: newTitle, body: newBody },
      { headers: { authorization: `Bearer ${token}` } }
    )
    .then(()=>{
      document.getElementById(`post-title-${postId}`).innerText = newTitle;
      document.getElementById(`post-body-${postId}`).innerText = newBody;
      localStorage.setItem("updatePosts","true"); 
    })
    .catch(()=> alert("Error updating post."));
  }

  function deletePost(postId){
    if(!confirm("Are you sure you want to delete this post?")) return;

    axios.delete(`https://tarmeezacademy.com/api/v1/posts/${postId}`,
      { headers: { authorization: `Bearer ${token}` } }
    )
    .then(()=>{
      alert("Post deleted!");
      localStorage.setItem("updatePosts","true"); 
      window.location.href = "index.html"; 
    })
    .catch(()=> alert("Error deleting post."));
  }

  function editComment(commentId){
    const body = document.getElementById(`comment-body-${commentId}`).innerText;
    const newBody = prompt("Edit comment:", body);
    if(newBody === null) return;

    axios.put(`https://tarmeezacademy.com/api/v1/comments/${commentId}`,
      { body: newBody },
      { headers: { authorization: `Bearer ${token}` } }
    )
    .then(()=>{
      document.getElementById(`comment-body-${commentId}`).innerText = newBody;
      localStorage.setItem("updatePosts","true");
    })
    .catch(()=> alert("Error updating comment."));
  }

function deleteComment(commentId){
  token = localStorage.getItem("token"); 
  if(!token){
    alert("⚠️ You must login first!");
    return;
  }

  if(!confirm("Are you sure you want to delete this comment?")) return;

  axios.delete(`https://tarmeezacademy.com/api/v1/comments/${commentId}`,
    { headers: { authorization: `Bearer ${token}` } }
  )
  .then(() => {
    fetchPostDetails(postId); 
  })
  .catch(()=> alert("Error deleting comment."));
}

  function logout() {
    localStorage.removeItem("token");
    alert("You have logged out successfully.");
    updateNavbar();
  }

  function extractImageUrl(value) {
    if (!value) return null;
    if (typeof value === "string" && value.trim() !== "") return value;
    if (typeof value === "object") {
      const keys = ["url", "image", "path", "src"];
      for (let key of keys) if (value[key]) return value[key];
    }
    return null;
  }

 
  window.addEventListener("focus", ()=>{
    if(localStorage.getItem("updatePosts") === "true"){
      if(typeof loadPosts === "function"){
        loadPosts(); 
      }
      localStorage.removeItem("updatePosts");
    }
  });
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
  console.log(res.data); 

 
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
  addCommentBox.style.display = "block"; 
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
    console.log(res.data); 

   
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
    addCommentBox.style.display = "block"; 
  })
  .catch(err => {
    console.error(err);
    alert("❌ Login failed. Check your credentials.");
  });

}


