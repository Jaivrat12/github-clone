function getDur(propName) {

    const val = getComputedStyle(document.documentElement)
                .getPropertyValue(propName)
    const dur = val.match(/[\d\.]+/)[0];
    const multiplier = /ms$/.test(val) ? 1 : 1000;
    return dur * multiplier;
}

function Loader() {

    let progress, isLoading = false;
    let loaderEl = createLoaderEl();
    const dur = getDur('--load-dur');

    function createLoaderEl() {

        const ele = document.createElement('div');
        ele.classList.add('loader');

        const shimmer = document.createElement('div');
        shimmer.classList.add('shimmer');
        ele.appendChild(shimmer);

        return document.body.appendChild(ele);
    }

    function updateProgress(val = 0) {
        progress = Math.min(val, 100);
        loaderEl.style.width = progress + '%';
    }

    function progressTo(val = 10) {
        updateProgress(val);
    }

    function start(val = 0) {
        isLoading = true;
        progressTo(val);
    }

    function progressBy(val = 10) {
        updateProgress(progress + val);
    }

    function complete() {

        updateProgress(100);
        isLoading = false;
        setTimeout(() => {

            loaderEl.style.setProperty('opacity', 0);
            loaderEl.setAttribute('remove', '');
            setTimeout(() => {
                document.querySelector('.loader[remove]').remove()
            }, dur);
            loaderEl = createLoaderEl();
        }, dur);
    }

    return ({
        isLoading: () => isLoading,
        start, progressTo,
        progressBy, complete
    });
}

export default Loader;