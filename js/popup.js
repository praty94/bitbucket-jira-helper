$(document).ready(function () {
    renderAllSites();
    $('#addPage').on('click', function () {
        chrome.tabs.query({
            active: true,
            lastFocusedWindow: true
        }, function (tabs) {
            var tab = tabs[0];
            if (tab.url) {
                //saving to storage
                saveLink(tab.url, 0);
            } else {
                alert('Please wait for the page to load!');
            }
        });
    });
    
});
function getDefaultLinkArray() {
    var curLinks =
        [
            {
                id: 0,
                name: "API",
                links: []
            },
            {
                id: 1,
                name: "WEB",
                links: []
            },
            {
                id: 2,
                name: "Other",
                links: []
            }
        ];
    return curLinks;
}
function getViewModel(curLinks, curGroup) {
    var viewModel = {};
    if (!curGroup) {
        curGroup = 0;
    }
    viewModel = {
        curGroupName: curLinks[curGroup].name,
        curLinks: curLinks,
        curGroupLinks: curLinks[curGroup].links
    }
    return viewModel;
}
function renderAllSites() {
    chrome.storage.sync.get(["links"], function (links) {
        var curLinks = links.links;

        if (!curLinks) {
            curLinks = getDefaultLinkArray();
        }

        handlebarsCompile(getViewModel(curLinks));
    });
}
function changeGroupSelection(id){
    chrome.storage.sync.get(["links"], function (links) {
        var curLinks = links.links;

        if (!curLinks) {
            curLinks = getDefaultLinkArray();
        }

        handlebarsCompile(getViewModel(curLinks,id));
    });
}
function handlebarsCompile(context) {
    var source = $('#entry-template').html();
    var template = Handlebars.compile(source);

    var html = template(context);
    $('#container').html(html);
    
    //registering events after recompiling template
    registerEvents();
}
function registerEvents(){
    $('.group-item').on('click', function () {
        var id = $(this).attr('data-id');
        changeGroupSelection(id);
    });
}
function saveLink(url, group) {
    chrome.storage.sync.get(["links"], function (links) {
        var curLinks = links.links;
        if (!curLinks) {
            curLinks = getDefaultLinkArray();
        }
        if (curLinks[group] && curLinks[group].links) {
            curLinks[group].links.push(url);
            saveToStorage({ links: curLinks });
            renderAllSites();
        }

    });
}

function saveToStorage(data) {
    chrome.storage.sync.set(data);
}

// List View
function listView() {
    // Get the elements with class="column"
    var elements = document.getElementsByClassName("column");
    for (var i = 0; i < elements.length; i++) {
        elements[i].style.width = "250px";
    }
}

// Grid View
function gridView() {
    // Get the elements with class="column"
    var elements = document.getElementsByClassName("column");
    for (var i = 0; i < elements.length; i++) {
        elements[i].style.width = "125px";
    }
}
