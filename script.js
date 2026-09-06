const usernameInput = document.getElementById("usernameInput");
const searchBtn = document.getElementById("searchBtn");

const loadingSection = document.getElementById("loadingSection");
const errorSection = document.getElementById("errorSection");
const dashboardSection = document.getElementById("dashboardSection");
const initialSection = document.getElementById("initialSection");

const errorTitle = document.getElementById("errorTitle");
const errorMessage = document.getElementById("errorMessage");
const retryBtn = document.getElementById("retryBtn");

const profileImage = document.getElementById("profileImage");
const profileName = document.getElementById("profileName");
const profileUsername = document.getElementById("profileUsername");
const profileBio = document.getElementById("profileBio");
const profileLocation = document.getElementById("profileLocation");
const profileCompany = document.getElementById("profileCompany");
const profileJoined = document.getElementById("profileJoined");
const githubProfileBtn = document.getElementById("githubProfileBtn");

const repoCount = document.getElementById("repoCount");
const followersCount = document.getElementById("followersCount");
const followingCount = document.getElementById("followingCount");
const starsCount = document.getElementById("starsCount");

const repositoryList = document.getElementById("repositoryList");
const repositoryTotal = document.getElementById("repositoryTotal");

let lastUsername = "";


/* =========================
   API FUNCTIONS
========================= */

async function fetchGitHubProfile(username) {

    const response = await fetch(
        `https://api.github.com/users/${encodeURIComponent(username)}`
    );

    if (!response.ok) {

        if (response.status === 404) {
            throw new Error(
                "The GitHub username you entered could not be found."
            );
        }

        if (response.status === 403) {
            throw new Error(
                "GitHub API rate limit reached. Please try again later."
            );
        }

        throw new Error(
            "Unable to retrieve the GitHub profile."
        );
    }

    return await response.json();
}


async function fetchGitHubRepositories(username) {

    const response = await fetch(
        `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`
    );

    if (!response.ok) {

        if (response.status === 403) {
            throw new Error(
                "GitHub API rate limit reached. Please try again later."
            );
        }

        throw new Error(
            "Unable to retrieve the repositories."
        );
    }

    return await response.json();
}


/* =========================
   SEARCH
========================= */

async function searchGitHub() {

    const username = usernameInput.value.trim();

    if (!username) {

        showError(
            "Username Required",
            "Please enter a GitHub username before searching."
        );

        return;
    }

    lastUsername = username;

    showLoading();

    try {

        /*
         * Promise.all allows both API requests
         * to run asynchronously.
         */
        const [profile, repositories] = await Promise.all([
            fetchGitHubProfile(username),
            fetchGitHubRepositories(username)
        ]);

        renderProfile(profile);
        renderStatistics(profile, repositories);
        renderRepositories(repositories);

        showDashboard();

    } catch (error) {

        console.error("GitHub API Error:", error);

        showError(
            "Unable to Load Data",
            error.message ||
            "Something went wrong while fetching GitHub data."
        );
    }
}


/* =========================
   PROFILE RENDER
========================= */

function renderProfile(profile) {

    profileImage.src = profile.avatar_url;
    profileImage.alt = `${profile.login} GitHub profile`;

    profileName.textContent =
        profile.name || profile.login;

    profileUsername.textContent =
        `@${profile.login}`;

    profileBio.textContent =
        profile.bio || "No bio available.";

    profileLocation.textContent =
        profile.location
            ? `📍 ${profile.location}`
            : "📍 Location not available";

    profileCompany.textContent =
        profile.company
            ? `🏢 ${profile.company}`
            : "🏢 Company not available";

    profileJoined.textContent =
        `📅 Joined ${formatDate(profile.created_at)}`;

    githubProfileBtn.href =
        profile.html_url;
}


/* =========================
   STATISTICS
========================= */

function renderStatistics(profile, repositories) {

    repoCount.textContent =
        formatNumber(profile.public_repos);

    followersCount.textContent =
        formatNumber(profile.followers);

    followingCount.textContent =
        formatNumber(profile.following);


    const totalStars = repositories.reduce(
        (total, repository) => {
            return total + repository.stargazers_count;
        },
        0
    );

    starsCount.textContent =
        formatNumber(totalStars);
}


/* =========================
   REPOSITORIES
========================= */

function renderRepositories(repositories) {

    repositoryList.innerHTML = "";

    repositoryTotal.textContent =
        `${repositories.length} ${
            repositories.length === 1
                ? "repository"
                : "repositories"
        }`;

    if (repositories.length === 0) {

        repositoryList.innerHTML = `
            <div class="initial-card">
                <div class="initial-icon">📦</div>
                <h2>No Public Repositories</h2>
                <p>
                    This GitHub profile does not have any
                    public repositories.
                </p>
            </div>
        `;

        return;
    }


    repositories.forEach(repository => {

        const card = document.createElement("article");

        card.className = "repository-card";

        const description =
            repository.description ||
            "No description available.";

        const language =
            repository.language ||
            "Language not specified.";

        card.innerHTML = `
            <h3>${escapeHTML(repository.name)}</h3>

            <p class="repository-description">
                ${escapeHTML(description)}
            </p>

            <span class="repository-language">
                💻 ${escapeHTML(language)}
            </span>

            <div class="repository-stats">

                <span>
                    ⭐ ${formatNumber(repository.stargazers_count)}
                </span>

                <span>
                    🍴 ${formatNumber(repository.forks_count)}
                </span>

                <span>
                    👁️ ${formatNumber(repository.watchers_count)}
                </span>

                <span>
                    Updated ${formatDate(repository.updated_at)}
                </span>

            </div>

            <a
                class="repository-link"
                href="${repository.html_url}"
                target="_blank"
                rel="noopener noreferrer"
            >
                View Repository ↗
            </a>
        `;

        repositoryList.appendChild(card);
    });
}


/* =========================
   UI STATES
========================= */

function showLoading() {

    initialSection.classList.add("hidden");
    dashboardSection.classList.add("hidden");
    errorSection.classList.add("hidden");

    loadingSection.classList.remove("hidden");

    searchBtn.disabled = true;
    searchBtn.querySelector("span").textContent = "Searching...";
}


function showDashboard() {

    loadingSection.classList.add("hidden");
    errorSection.classList.add("hidden");
    initialSection.classList.add("hidden");

    dashboardSection.classList.remove("hidden");

    searchBtn.disabled = false;
    searchBtn.querySelector("span").textContent = "Search";
}


function showError(title, message) {

    loadingSection.classList.add("hidden");
    dashboardSection.classList.add("hidden");
    initialSection.classList.add("hidden");

    errorSection.classList.remove("hidden");

    errorTitle.textContent = title;
    errorMessage.textContent = message;

    searchBtn.disabled = false;
    searchBtn.querySelector("span").textContent = "Search";
}


/* =========================
   HELPERS
========================= */

function formatNumber(number) {

    return new Intl.NumberFormat("en-US").format(
        number || 0
    );
}


function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }

    const date = new Date(dateString);

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}


/*
 * Prevent API-provided text from being interpreted
 * as HTML when inserted into repository cards.
 */
function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}


/* =========================
   EVENTS
========================= */

searchBtn.addEventListener(
    "click",
    searchGitHub
);


usernameInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {
            searchGitHub();
        }

    }
);


retryBtn.addEventListener(
    "click",
    () => {

        if (lastUsername) {

            usernameInput.value =
                lastUsername;

            searchGitHub();

        } else {

            usernameInput.focus();

        }

    }
);
