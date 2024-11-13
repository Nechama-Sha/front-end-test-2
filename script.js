function createAPICache() {
    const cache = {};

    return function getUserRepos(username) {
        const today = new Date().toISOString().slice(0, 10); // Get the current date in YYYY-MM-DD format
        const cacheKey = `${username}_${today}`;

        if (cache[cacheKey]) {
            console.log("Returning cached response for user:", username);
            return Promise.resolve(cache[cacheKey]);
        } else {
            console.log("Making API call for user:", username);
            return fetch(`https://api.github.com/users/${username}/repos?per_page=100`)
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error("API request failed");
                    }
                })
                .then(data => {
                    cache[cacheKey] = data;
                    return data;
                });
        }
    };
}

const getUserReposWithCache = createAPICache();

document.getElementById('fetchReposBtn').addEventListener('click', () => {
    const username = document.getElementById('usernameInput').value;

    getUserReposWithCache(username)
        .then(data => {
            if (data.length < 1) {
                throw new Error("No repos found");
            }
            const reposWithOpenIssues = data.filter(repo => repo.open_issues > 0);
            if (reposWithOpenIssues.length === 0) {
                document.getElementById('reposList').innerText = "There are no open issues";
            } else {
                const maxIssuesRepo = reposWithOpenIssues.reduce((prev, current) => (prev.open_issues > current.open_issues) ? prev : current);
                document.getElementById('reposList').innerHTML = "";
                reposWithOpenIssues.forEach(repo => {
                    const repoElement = document.createElement('div');
                    repoElement.classList.add('repo');
                    if (repo === maxIssuesRepo) {
                        repoElement.classList.add('max-issues');
                    }
                    repoElement.innerText = `* ${repo.name} : ${repo.open_issues}`;
                    document.getElementById('reposList').appendChild(repoElement);
                });
            }
        })
        .catch(error => {
            if (error.message === "No repos found") {
                document.getElementById('reposList').innerText = "No repos found";
            } else {
                document.getElementById('reposList').innerText = "Service Error";
            }
        });
});
