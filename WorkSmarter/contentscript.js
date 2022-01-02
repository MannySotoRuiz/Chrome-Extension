var elementExist = document.querySelectorAll(
  "#long-unique-random-id-for-extension"
);
if (elementExist.length !== 0) {
  console.log("elementExits - stop");
} else {
  if (typeof init === "undefined") {
    const init = function () {
      // create and append css file
      const css = document.createElement("link");
      css.setAttribute("rel", "stylesheet");
      css.setAttribute("type", "text/css");
      css.setAttribute("href", chrome.runtime.getURL("contentscript.css"));
      document.head.appendChild(css);
      // create and append js file
      const injectElement = document.createElement("div");
      injectElement.className = "test-element";
      injectElement.id = "long-unique-random-id-for-extension";
      injectElement.innerHTML = "THIS IS A TEST!!!!";
      document.body.appendChild(injectElement);
      console.log("Changed Content On This Page");
    };
    init();
  } else {
    console.log("Content Already Changed");
  }
}
