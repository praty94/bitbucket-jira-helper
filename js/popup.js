/*constants*/
var homeTemplate = 'home-template';
var createPageTemplate = "create-template";
var _linksInStorage = null;

$(document).ready(function () {
    renderAllSites();
    $('#addPage').on('click', function () {
        chrome.tabs.query({
            active: true,
            lastFocusedWindow: true
        }, function (tabs) {
            var tab = tabs[0];
            if (tab.url) {
                /* var url = new URL(tab.url);
                 var linkObj = {
                     url:tab.url,
                     name:"defaultname",
                     hostname:url.hostname
                 }
                 //saving to storage
                 saveLink(linkObj, 0);*/
                renderCreatePage(tab.url);
            } else {
                alert('Please wait for the page to load!');
            }

        });
    });

});

/*data generation functions <start>*/
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

/*data generation functions <end>*/

/*render functions*/
function renderAllSites() {
    chrome.storage.sync.get(["links"], function (links) {
        var curLinks = links.links;

        if (!curLinks) {
            curLinks = getDefaultLinkArray();
        }
        _linksInStorage = curLinks;
        handlebarsCompile(getViewModel(curLinks), homeTemplate);
    });
}

function renderCreatePage(url) {
    chrome.storage.sync.get(["links"], function (links) {
        var curLinks = links.links;

        if (!curLinks) {
            curLinks = getDefaultLinkArray();
        }
        
        //Saving to be used later
        _linksInStorage = curLinks;

        var context = getViewModel(curLinks);
        context.url = url;//additionally adding url to view model
        handlebarsCompile(context, createPageTemplate);
    });
}

function changeGroupSelection(id) {
    var curLinks = _linksInStorage;

    if (!curLinks) {
        curLinks = getDefaultLinkArray();
    }

    handlebarsCompile(getViewModel(curLinks, id), homeTemplate);
}
function changeSelectionCreatePage(id){
    var curLinks = _linksInStorage;

    if (!curLinks) {
        curLinks = getDefaultLinkArray();
    }
    var context = getViewModel(curLinks, id);
    context.name = $('#page-name').val();
    context.url = $('#page-url').val();
    handlebarsCompile(context, createPageTemplate);
}
function handlebarsCompile(context, templateId) {
    var source = $("#"+templateId).html();
    var template = Handlebars.compile(source);

    var html = template(context);
    $('#container').html(html);

    //registering events after recompiling template
    registerEvents();
}
function registerEvents() {
    $('.group-item').on('click', function () {
        var id = $(this).attr('data-id');
        var parent = $(this).attr('data-parent');
        if (parent == homeTemplate) {
            changeGroupSelection(id);
        } else if (parent == createPageTemplate) {
            changeSelectionCreatePage(id);
        }
    });
}
function saveLink(linkObj, group) {
    chrome.storage.sync.get(["links"], function (links) {
        var curLinks = links.links;
        if (!curLinks) {
            curLinks = getDefaultLinkArray();
        }
        if (curLinks[group] && curLinks[group].links) {
            curLinks[group].links.push(linkObj);
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
