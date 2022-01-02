if (typeof init === 'undefined') {
    const init = function() {
        const injectElement = document.createElement('div');
        injectElement.className = 'test-element';
        injectElement.innerHTML = 'THIS IS A TEST!!!!';
        document.body.appendChild(injectElement);
        console.log('Changed Content On This Page');
    }
    init();
}