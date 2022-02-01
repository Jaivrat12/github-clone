import App from './Components/App.js';
import SearchForm from './Components/SearchForm.js';
import Modal from './Components/Modal.js';
import Loader from './Components/Loader.js';

// if deployed on github pages, update all URLs linking to this page
if (/.github.io\//.test(location.href)) {

    document.querySelectorAll('a[href*="/#/"]').forEach((ele) => {

        const href = ele.getAttribute('href');
        ele.setAttribute('href', '/github-clone' + href);
    });
    document.querySelectorAll('a[data-vals*="/#/"]').forEach((ele) => {

        const vals = ele.getAttribute('data-vals')
                        .replace(/\/#\//, '/github-clone/#/');
        ele.setAttribute('data-vals', vals);
    });
}

// Modal
const modal = Modal();
modal.init();

// Loader
const loader = Loader();

// App
const app = App(loader);
app.load(() => {
    modal.addClickListeners();
    document.querySelector('.loading-screen').remove();
});

window.addEventListener('popstate', async (e) => {

    await app.onPopState(e, () => {

        modal.addClickListeners();
        window.scrollTo(0, 0);
    });
});

// Search Form
const searchForm = SearchForm();
searchForm.onSubmit((e) => {

    e.preventDefault();
    const query = searchForm.getInputValue().trim();
    if (query) {
        modal.open(modal.types.searchUsers(query));
    }
    searchForm.setInputValue('');
});