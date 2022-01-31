import { Octokit } from 'https://cdn.skypack.dev/@octokit/core';

const octokit = new Octokit();

async function getData(url, options) {

    const response = await octokit.request(url, options);
    // console.log(response.headers);
    return response.data;
}

async function getUserData(username) {

    const url = `GET /users/${ username }`;
    const userData = await getData(url);
    Object.assign(userData, {
        username: userData.login,
        // starred_repos_count: (await getStarredReposData(username)).length
    });
    return userData;
}

async function getReposData(username) {

    const url = `GET /users/${ username }/repos`;
    const options = { sort: 'updated' };
    return await getData(url, options);
}

async function getStarredReposData(username) {

    const url = `GET /users/${ username }/starred`;
    return await getData(url);
}

async function searchUsers(q) {

    const url = 'GET /search/users';
    return (await getData(url, {q})).items;
}

export {
    getData, getUserData, getReposData,
    getStarredReposData, searchUsers
};