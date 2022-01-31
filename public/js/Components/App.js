import {
    getUserData, getReposData,
    getStarredReposData
} from '../lib/fetch.js';
import { fillData, preloadImg } from '../lib/util.js';

const langColors = await (
    await fetch('public/js/data/lang-colors.json')
).json();

function App(loader) {

    let currUsername, currTab;
    let taskQueue = [], isQueueing = false;
    const data = {
        user: null,
        repos: null,
    };

    // const tabs = ['overview', 'repositories', 'stars'];

    const elements = {
        userDataHolders: document.querySelectorAll(
            'aside *[data-attrs], nav *[data-attrs]'
        ),
    };

    function updateDocumentTitle() {

        const presentation = {
            'overview': '',
            'repositories': ' - Repositories',
            'stars': ' - Stars',
        };
        document.title = currUsername + (presentation[currTab] ?? '');
    }

    function getURLState() {

        const getHashPart = (str, pos = 1) => location.hash.split(str)[pos];

        const hash = getHashPart('/');
        const username = (hash && hash.match(/^[\w-]*/)[0]) || 'Jaivrat12';

        const tabs = ['repositories', 'stars'];
        const tabParam = new URL(
            `${location.origin}/${username}/?${getHashPart('?')}`
        ).searchParams.get('tab');
        const tab = tabs.includes(tabParam) ? tabParam : '';

        const expectedURL = `#/${username}` + (tab ? `/?tab=${tab}` : '');
        if (location.hash !== expectedURL) {
            console.log('Invalid URL');
            // history.replaceState();
            // history.pushState({ username, tab }, '', expectedURL);
        }

        return ([ username, tab || 'overview' ]);
    }

    async function fillUserData() {

        data.user = await getUserData(currUsername);
        if(loader.isLoading()) {
            loader.progressTo(65);
        }

        await switchTab();

        const queue = fillData(elements.userDataHolders, data.user, isQueueing);
        taskQueue = [...taskQueue, ...queue];
    }

    function fillReposData(parentSelector, reposData) {

        const repos = document.querySelector(`${parentSelector} .repos`);
        const noRepos = document.querySelector(`${parentSelector} .no-repos`);

        if (reposData.length === 0) {

            const elements = document.querySelectorAll(
                `${parentSelector} .no-repos *[data-attrs]`
            );

            // const queue = fillData(elements, data.user, isQueueing);
            // TaskQueue = [...TaskQueue, ...queue];
            fillData(elements, data.user);

            repos.classList.add('js-hidden');
            noRepos.classList.remove('js-hidden');
        } else {

            const repo = document.querySelector(`${parentSelector} .repo`).outerHTML;
            repos.innerHTML = new Array(reposData.length).fill(repo).join('');

            reposData.forEach((repo, i) => {

                repo.full_name = repo.full_name.split('/').join(' / ');
                repo.language = repo.language ?? '¯\\_(ツ)_/¯';
                repo.lang_color = langColors[repo.language] ?? '#333';
                repo.username = repo.owner.login;

                const months = [
                    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                ];
                const d = new Date(repo.updated_at);
                repo.updated_at = `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

                const elements = document.querySelectorAll(
                    `${parentSelector} .repo:nth-child(${i + 1}) *[data-attrs]`
                );

                // const queue = fillData(elements, repo, isQueueing);
                // TaskQueue = [...TaskQueue, ...queue];
                fillData(elements, repo);
            });

            noRepos.classList.add('js-hidden');
            repos.classList.remove('js-hidden');
        }
    }

    async function switchTab() {

        let reposData;
        switch (currTab) {

            case 'overview': {

                data.repos = await getReposData(currUsername);
                reposData = data.repos.slice(0, 6);
                break;
            }

            case 'repositories': {

                data.repos = await getReposData(currUsername);
                reposData = data.repos;
                break;
            }

            case 'stars': {

                reposData = await getStarredReposData(currUsername);
                break;
            }

            default: {
                throw 'Wrong Tab!!!';
            }
        };

        if(loader.isLoading()) {
            loader.progressTo(90);
        }

        const task = () => {

            fillReposData(`#${currTab}`, reposData);

            document.querySelector('.sticky-navbar li.active')
                    ?.classList.remove('active');
            document.querySelector(`.sticky-navbar li[data-tab="${currTab}"]`)
                    ?.classList.add('active');

            document.querySelector('section.active')
                    ?.classList.remove('active');
            document.querySelector(`section#${currTab}`)
                    ?.classList.add('active');

            updateDocumentTitle();
        };

        if (isQueueing) {
            taskQueue.push({exec: task});
        } else {
            task();
        }
    }

    async function onPopState(e, onComplete) {

        const [username, tab] = getURLState();
        if (username !== currUsername) {

            loader.start(15);
            isQueueing = true;

            [currUsername, currTab] = [username, tab];
            await fillUserData();

            const images = taskQueue.filter(task =>
                task.ele?.localName === 'img' && task.attr === 'src'
            );
            let imagesPreloaded = 0;
            images.forEach((img) => preloadImg(img.val, onImgLoad));

            function onImgLoad() {

                imagesPreloaded++;
                if (imagesPreloaded === images.length) {

                    taskQueue.forEach((task) => task.exec());
                    taskQueue = [];
                    isQueueing = false;
                    loader.complete();
                    onComplete();
                }
            }
        } else if (tab !== currTab) {

            loader.start(15);
            currTab = tab;
            await switchTab();
            onComplete();
            loader.complete();
        }
    }

    async function load(next) {

        [currUsername, currTab] = getURLState();
        await fillUserData();
        next();
    }

    return ({
        load, onPopState,
    });
};

export default App;