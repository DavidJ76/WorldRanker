document.addEventListener("DOMContentLoaded", () => {
  const sortSelect = document.getElementById("sortSelect");
  sortSelect.addEventListener("change", sortCountries);
});

function sortCountries() {
  const criterion = document.getElementById("sortSelect").value;
  const container =
    document.querySelector(".country-list .row") ||
    document.querySelector("main .row");
  const cards = Array.from(container.querySelectorAll(".country-card"));

  cards.sort((a, b) => {
    const aVal = parseInt(a.dataset[criterion], 10) || 0;
    const bVal = parseInt(b.dataset[criterion], 10) || 0;
    return bVal - aVal;
  });

  cards.forEach((card) => container.appendChild(card));
}

const BASE_URL = "http://localhost:3006";
const form = document.getElementById("commentForm");
const container = document.getElementById("commentsContainer");

window.addEventListener("load", () => {
  form.addEventListener("submit", handleSubmit);
  loadComments();
});

async function handleSubmit(event) {
  event.preventDefault();
  const data = retrieveData();
  if (!data) {
    alert("Username and comment are required!");
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to post comment");
    form.reset();
    loadComments();
  } catch (err) {
    console.error(err);
    alert("Error saving comment");
  }
}

async function loadComments() {
  const countryId = document.querySelector("input[name=country_id]").value;
  container.innerHTML = "Loading…";

  try {
    const res = await fetch(`${BASE_URL}/reviews/${countryId}`);
    if (!res.ok) throw new Error("Failed to fetch comments");
    const reviews = await res.json();

    if (reviews.length === 0) {
      container.innerHTML = '<p class="text-muted">No comments yet.</p>';
      return;
    }

    container.innerHTML = "";
    reviews.forEach((r) => {
      const div = document.createElement("div");
      div.className = "border rounded p-3 mb-3";
      div.innerHTML = `
        <strong>${escapeHtml(r.username)}</strong>
        <p>${escapeHtml(r.comment)}</p>
        <small class="text-muted">${new Date(
          r.created_at
        ).toLocaleString()}</small>
        <div class="mt-2">
          <button class="btn btn-sm btn-outline-danger"
            onclick="deleteReview(${r.id})">
            Delete
          </button>
        </div>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p class="text-danger">Error loading comments</p>';
  }
}

async function deleteReview(id) {
  if (!confirm("Delete this comment?")) return;

  try {
    const res = await fetch(`${BASE_URL}/reviews/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete comment");
    loadComments();
  } catch (err) {
    console.error(err);
    alert("Could not delete comment");
  }
}

function retrieveData() {
  const country_id = document.querySelector("input[name=country_id]").value;
  const username = document.getElementById("username").value.trim();
  const comment = document.getElementById("comment").value.trim();
  if (!username || !comment) return null;
  return { country_id, username, comment };
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
