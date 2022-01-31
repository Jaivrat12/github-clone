import App from './Components/App.js';
import SearchForm from './Components/SearchForm.js';
import Modal from './Components/Modal.js';
import Loader from './Components/Loader.js';


// Modal
const modal = Modal();
modal.init();

// Loader
const loader = Loader();

// App
const app = App(loader);
app.load(() => modal.addClickListeners());

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