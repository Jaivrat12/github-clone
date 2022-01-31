function show(ele) {
    ele.classList.remove('js-hidden');
}

function hide(ele) {
    ele.classList.add('js-hidden');
}

function preloadImg(src, onLoad) {

    const img = new Image();
    img.src = src;
    img.addEventListener('load', onLoad);
}

function fillData(elements, data, condition = false) {

    const tasks = [];

    elements.forEach((ele) => {

        const { attrs, vals } = ele.dataset;
        const split = str => str.split(',').map(item => item.trim());
        const attributes = split(attrs);
        const values = split(vals);
        for (let i = 0; i < attributes.length; i++) {

            let val = values[i];
            values[i].match(/{.[^{]*}/gm).forEach((part) => {
                const _part = part.slice(1, -1);
                val = val.replace(part, data[_part] ?? '');
            });

            const task = {
                ele, val,
                attr: attributes[i],
                exec: () => {

                    if (ele.hasAttribute(attributes[i])) {
                        ele.setAttribute(attributes[i], val);
                    } else {
                        ele[attributes[i]] = val;
                    }
                }
            };
            tasks.push(task);
        }
    });

    if (!condition) {
        tasks.forEach((task) => task.exec());
        return [];
    } else {
        return tasks;
    }
}

export { show, hide, preloadImg, fillData };