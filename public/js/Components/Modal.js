import { getData, searchUsers } from '../lib/fetch.js';
import { fillData, preloadImg } from '../lib/util.js';

function Modal() {

    const modal = {
        self: document.querySelector('.modal'),
        heading: document.querySelector('.modal-heading'),
        subHeading: document.querySelector('.modal-subheading'),
        body: document.querySelector('.modal-body'),
        noContent: document.querySelector('.modal .no-content'),
        bg: document.querySelector('.modal-bg'),
        closeBtn: document.querySelector('.modal .close-btn'),
        loader: document.querySelector('.modal .spinning-loader'),
    };

    const types = {
        followers: (username, url) => ({
            heading: 'Followers',
            subHeading: username,
            getData: async () => await getData(url),
            noContent: `${username} doesn't have any followers yet.`,
        }),
        following: (username, url) => ({
            heading: 'Following',
            subHeading: username,
            getData: async () => await getData(
                url.replace(/\/following.*/, '/following')
            ),
            noContent: `${username} isn't following anybody.`,
        }),
        stargazers: (reponame, url) => ({
            heading: 'Stargazers',
            subHeading: reponame,
            getData: async () => await getData(url),
            noContent: `${reponame} has no stargazers yet.`,
        }),
        searchUsers: (q) => ({
            heading: 'Search Users',
            subHeading: `Searching for '${q}'`,
            getData: async () => await searchUsers(q),
            noContent: `We couldn't find any users matching '${q}'`,
        }),
    };

    async function open(type) {

        function addAnchorCloseEvents() {

            const anchors = document.querySelectorAll('.modal-body .user a');
            anchors.forEach((a) =>
                a.addEventListener('click', (e) => close())
            );
        }

        modal.self.classList.remove('js-hidden');
        modal.loader.classList.remove('js-hidden');

        modal.heading.textContent = type.heading;
        modal.subHeading.textContent = type.subHeading;

        const data = await type.getData();
        if (data.length === 0) {

            modal.noContent.textContent = type.noContent;
            modal.loader.classList.add('js-hidden');
            modal.noContent.classList.remove('js-hidden');
            addAnchorCloseEvents();
        } else {

            let imagesPreloaded = 0;
            data.forEach(user => {

                preloadImg(user.avatar_url, () => {

                    imagesPreloaded++;
                    if (imagesPreloaded === data.length) {

                        const user = document.querySelector('.modal-body .user').outerHTML;
                        const users = new Array(data.length).fill(user).join('');
                        modal.body.innerHTML = users;

                        data.forEach((user, i) => {

                            user.username = user.login;
                            const elements = document.querySelectorAll(
                                `.modal-body .user:nth-child(${i + 1}) *[data-attrs]`
                            );
                            fillData(elements, user);
                        });

                        modal.loader.classList.add('js-hidden');
                        modal.body.classList.remove('js-hidden');
                        addAnchorCloseEvents();
                    }
                });
            });
        }
    }

    function close() {

        [modal.heading, modal.subHeading].forEach(
            (ele) => ele.textContent = ''
        );
        [modal.self, modal.body, modal.noContent].forEach(
            (ele) => ele.classList.add('js-hidden')
        );
    }

    function init() {

        [modal.bg, modal.closeBtn].forEach((ele) => {
            ele.addEventListener('click', (e) => close());
        });
    }

    function addClickListeners() {

        const elements = document.querySelectorAll('*[modal]');
        elements.forEach((ele) => {

            ele.addEventListener('click', (e) => {

                e.preventDefault();
                const modalType = ele.getAttribute('modal');
                const name = ele.getAttribute('modal-subheading');
                const url = ele.getAttribute('modal-data-src');
                open(types[modalType](name, url));
            });
        });
    }

    return ({
        types, init, open, close, addClickListeners
    });
}

export default Modal;