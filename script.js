function createAPICache() {
    const cache = {};

    return async function getUserRepos(username) {
        const today = new Date().toISOString().slice(0, 10);
        const cacheKey = `${username}_${today}`;

        if (cache[cacheKey]) {
            console.log("Returning cached response for user:", username);
            return Promise.resolve(cache[cacheKey]);
        }

        console.log("Making API call for user:", username);
        try {
            const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);

            if (!response.ok) {
                throw new Error("Service Error" );
            }
            const data = await response.json();
            cache[cacheKey] = data;
            return data;
        } catch (error) {
            throw new Error("Service Error");
        }
    };
}

const getUserReposWithCache = createAPICache();

const fetchReposBtn = document.getElementById('fetchReposBtn');
const reposList = document.getElementById('reposList');

fetchReposBtn.addEventListener('click', async () => {
    const username = document.getElementById('usernameInput').value;

    try {
        const data = await getUserReposWithCache(username);
        if (data.length < 1) {
            throw new Error("No repos found");
        }
    
        const reposWithOpenIssues = data.filter(repo => repo.open_issues > 0);
        if (reposWithOpenIssues.length === 0) {
            reposList.innerText = "There are no open issues";
        } else {
            reposList.innerHTML = "";
            const maxIssuesRepo = reposWithOpenIssues.reduce((prev, current) => (prev.open_issues > current.open_issues) ? prev : current);
            reposWithOpenIssues.forEach(repo => {
                const repoElement = document.createElement('div');
                repoElement.classList.add('repo');
                if (repo === maxIssuesRepo && repo.name.trim() !== "") {
                    repoElement.classList.add('max-issues');
                }
                if (repo.name.trim() !== "") {
                    repoElement.innerText = `* ${repo.name} : ${repo.open_issues}`;
                    reposList.appendChild(repoElement);
                }
            });
        }
    } catch (error) {
        if (error.message === "No repos found") {
            reposList.innerText = "No repos found";
        } else {
            reposList.innerText = error.message; // Display the specific error message
        }
    }
    
});
