function focusBlurListeners (ele, focusKeys, blurKeys) {

    const keysListener = (e, keyList, next) => {

        if (keyList.includes(e.key)) {
            e.preventDefault();
            next();
        }
    };

    return ({
        onFocus: (e) => {
            keysListener(e, focusKeys, () => ele.focus());
        },
        onBlur: (e) => {
            keysListener(e, blurKeys, () => ele.blur());
        }
    });
};

function SearchForm() {

    const searchForm = document.querySelector('#search-form');
    const searchInput = document.querySelector('#search-input');

    const searchToggler = focusBlurListeners(
        searchInput, ['s', '/'], ['Escape']
    );

    document.addEventListener('keydown', searchToggler.onFocus);
    ['focus', 'blur'].forEach((event) => {

        searchInput.addEventListener(event, () => {

            let { onFocus: addFun, onBlur: remFun } = searchToggler;
            if (searchInput === document.activeElement) {
                [addFun, remFun] = [remFun, addFun];
            }
            document.addEventListener('keydown', addFun);
            document.removeEventListener('keydown', remFun);
        });
    });

    function getInputValue() {
        return searchInput.value;
    }

    function setInputValue(value) {
        searchInput.value = value;
    }

    function onSubmit(eventListener) {
        searchForm.addEventListener('submit', eventListener);
    }

    return ({ getInputValue, setInputValue, onSubmit });
}

export default SearchForm;