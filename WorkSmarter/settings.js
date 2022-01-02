$(document).ready(function() {
    console.log('settings.js');

    let output = document.getElementById('output');
    let urlStorage = [];

    // call this when user opens popup
    // display any saved  blocked URLs to the output div 
    chrome.runtime.sendMessage({ cmd: 'GET_DATA' }, response => {
        if (response.link.length != 0) {
            urlStorage = response.link;
            let listOfSites = document.getElementById('ListOfSites');
            for (let i = 0; i < urlStorage.length; i++) {
                let newSite = document.createElement('li');
                newSite.appendChild(document.createTextNode(urlStorage[i]));
                listOfSites.appendChild(newSite);
                //output.innerHTML += urlStorage[i] + '<br>';
            }
        }
    });

    // when user clicks to save url
    document.getElementById('submit').onclick = function(event) {
        let siteFromUser = document.getElementById('site').value;
        document.getElementById('limitReached').classList.add('hidden');
        document.getElementById('incorrectFormat').classList.add('hidden');
        document.getElementById('alreadyExists').classList.add('hidden');
        $.ajax({
            success: function(data, status) {
                // user have reached limit of URLs
                if (urlStorage.length == 11) {
                    document.getElementById('limitReached').classList.remove('hidden');
                // user gave an incorrect URL input
                } else if (!ifValidURL(siteFromUser)) {
                    console.log('incorrect format');
                    document.getElementById('incorrectFormat').classList.remove('hidden');
                // user gave correct URL input
                } else {
                    chrome.runtime.sendMessage({ cmd: 'STORE_URL', link: siteFromUser });
                    chrome.runtime.sendMessage({ cmd: 'GET_DATA' }, response => {
                        // URL input from user already exits in array of blocked URLs
                        if (urlStorage.length == response.link.length) {
                            console.log('site already exists in array');
                            document.getElementById('alreadyExists').classList.remove('hidden');
                        // add the URL to blocked URLs array
                        } else {
                            urlStorage = response.link;
                            let listOfSites = document.getElementById('ListOfSites');
                            let newSite = document.createElement('li');
                            newSite.appendChild(document.createTextNode(urlStorage[urlStorage.length - 1]));
                            listOfSites.appendChild(newSite);
                        }
                    });
                }
            },
            error: function(request, data, status) {
                console.log('error happened');
            }
        }); // end of ajax call
    }; // end of onclick call for submit button

    // button to clear all array of blocked URLs
    document.getElementById('clearAllURLS').onclick = function(event) {
        $("li").remove();
        urlStorage = [];
        chrome.runtime.sendMessage({ cmd: 'CLEAR_URLs', arr: urlStorage });
        document.getElementById('limitReached').classList.add('hidden');
        document.getElementById('incorrectFormat').classList.add('hidden');
        document.getElementById('alreadyExists').classList.add('hidden');
    }; // end of onclick call for clear button
})

// method to see if user input is a valid URL input
function ifValidURL(site) {
    try {
        const url = new URL(site);
        return true;
    } catch (error) {
        console.log('INVALID URL');
        return false;
    }
}