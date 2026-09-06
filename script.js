const API_BASE = "https://api.github.com";

const searchForm = document.getElementById("searchForm");
const usernameInput = document.getElementById("usernameInput");
const searchButton = document.getElementById("searchButton");

const loading = document.getElementById("loading");
const results = document.getElementById("results");
const errorMessage = document.getElementById("errorMessage");

const avatar = document.getElementById("avatar");
const profileName = document.getElementById("profileName");
const profileUsername = document.getElementById("profileUsername");
const profileBio = document.getElementById("profileBio");

const profileLocation = document.getElementById("profileLocation");
const profileCompany = document.getElementById("profileCompany");
const profileJoined = document.getElementById("profileJoined");

const followers = document.getElementById("followers");
const following = document.getElementById("following");
const publicRepos = document.getElementById("publicRepos");
const publicGists = document.getElementById("publicGists");

const statRepos = document.getElementById("statRepos");
const statStars = document.getElementById("statStars");
const statForks = document.getElementById("statForks");
const statFollowers = document.getElementById("statFollowers");

const repositories = document.getElementById("repositories");


/* =========================
   SEARCH FORM
========================= */

searchForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const username = usernameInput.value.trim();

    if (!username) {
        showError("Please enter a GitHub username.");
        return;
    }

    await searchGitHubUser(username);
});


/* =========================
   SEARCH GITHUB USER
========================= */

async function searchGitHubUser(username) {

    hideError();

    results.classList.add("hidden");
    loading.classList.remove("hidden");

    searchButton.disabled = true;
    searchButton.textContent = "Searching...";

    try {

        const userResponse = await fetch(
            `${API_BASE}/users/${encodeURIComponent(username)}`
        );

        if (!userResponse.ok) {

            if (userResponse.status === 404) {
                throw new Error(
                    "GitHub username not found. Please check the username and try again."
                );
            }

            if (userResponse.status === 403) {
                throw new Error(
                    "GitHub API rate limit reached. Please try again later."
                );
            }

            throw new Error(
                "Unable to fetch GitHub profile information."
            );
        }


        const userData = await userResponse.json();


        const reposResponse = await fetch(
            `${API_BASE}/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`
        );

        if (!reposResponse.ok) {

            if (reposResponse.status === 403) {
                throw new Error(
                    "GitHub API rate limit reached while loading repositories."
                );
            }

            throw new Error(
                "Unable to fetch repository information."
            );
        }


        const repoData = await reposResponse.json();


        renderProfile(userData);
        renderStatistics(userData, repoData);
        renderRepositories(repoData);


        results.classList.remove("hidden");

        results.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

    catch (error) {

        console.error(error);

        showError(
            error.message ||
            "Something went wrong while fetching GitHub data."
        );

    }

    finally {

        loading.classList.add("hidden");

        searchButton.disabled = false;
        searchButton.textContent = "Search";
    }
}


/* =========================
   RENDER PROFILE
========================= */

function renderProfile(user) {

    avatar.src = user.avatar_url;
    avatar.alt = `${user.login} GitHub avatar`;

    profileName.textContent =
        user.name || user.login;

    profileUsername.textContent =
        `@${user.login}`;

    profileBio.textContent =
        user.bio || "No bio available.";


    profileLocation.textContent =
        user.location || "Not available";

    profileCompany.textContent =
        user.company || "Not available";


    profileJoined.textContent =
        formatDate(user.created_at);


    followers.textContent =
        formatNumber(user.followers);

    following.textContent =
        formatNumber(user.following);

    publicRepos.textContent =
        formatNumber(user.public_repos);

    publicGists.textContent =
        formatNumber(user.public_gists);
}


/* =========================
   RENDER STATISTICS
========================= */

function renderStatistics(user, repos) {

    let totalStars = 0;
    let totalForks = 0;


    repos.forEach(repo => {

        totalStars +=
            Number(repo.stargazers_count) || 0;

        totalForks +=
            Number(repo.forks_count) || 0;
    });


    statRepos.textContent =
        formatNumber(user.public_repos);

    statStars.textContent =
        formatNumber(totalStars);

    statForks.textContent =
        formatNumber(totalForks);

    statFollowers.textContent =
        formatNumber(user.followers);
}


/* =========================
   RENDER REPOSITORIES
========================= */

function renderRepositories(repos) {

    repositories.innerHTML = "";


    if (!repos.length) {

        repositories.innerHTML = `
            <div class="empty-repositories">
                This user has no public repositories.
            </div>
        `;

        return;
    }


    repos.forEach(repo => {

        const card = document.createElement("article");

        card.className = "repository-card";


        const description =
            repo.description ||
            "No description available.";


        const language =
            repo.language ||
            "Not specified";


        card.innerHTML = `

            <h3>
                ${escapeHTML(repo.name)}
            </h3>

            <p class="repository-description">
                ${escapeHTML(description)}
            </p>

            <span class="repository-language">
                ${escapeHTML(language)}
            </span>

            <div class="repository-meta">

                <span>
                    ⭐ ${formatNumber(repo.stargazers_count)}
                </span>

                <span>
                    🍴 ${formatNumber(repo.forks_count)}
                </span>

                <span>
                    👁 ${formatNumber(repo.watchers_count)}
                </span>

                <span>
                    Updated ${formatDate(repo.updated_at)}
                </span>

            </div>

            <a
                href="${repo.html_url}"
                target="_blank"
                rel="noopener noreferrer"
                class="repository-link"
            >
                View Repository
            </a>

        `;


        repositories.appendChild(card);
    });
}


/* =========================
   FORMAT NUMBER
========================= */

function formatNumber(number) {

    if (number === null || number === undefined) {
        return "0";
    }

    return new Intl.NumberFormat("en-US").format(number);
}


/* =========================
   FORMAT DATE
========================= */

function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }

    const date = new Date(dateString);

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


/* =========================
   ERROR HANDLING
========================= */

function showError(message) {

    errorMessage.textContent = message;

    errorMessage.classList.remove("hidden");
}


function hideError() {

    errorMessage.textContent = "";

    errorMessage.classList.add("hidden");
}


/* =========================
   HTML ESCAPE
========================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================
   SOURCE CODE BUTTON
========================= */

function checkSourceLink(link) {

    if (
        !link.href ||
        link.getAttribute("href") === "#" ||
        link.getAttribute("href") === ""
    ) {

        alert(
            "Please add the GitHub repository URL for this project's source code."
        );

        return false;
    }

    return true;
}
