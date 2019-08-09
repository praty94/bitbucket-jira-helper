/*constants*/
var homeTemplate = 'home-template';
var createPageTemplate = "create-template";
var alertTemplate = "alert-template";
var _linksInStorage = null;

var invalidPageNameMsg = 'Please enter a valid page name';
var invalidPageURLMsg = 'Please enter a valid page URL';

var success_pageCreation = 'New Page created succcessfully';

$(document).ready(function () {
    registerHandlebarsHelpers();
    renderAllSites();

    $('#addPage').on('click', function () {
        chrome.tabs.query({
            active: true,
            lastFocusedWindow: true
        }, function (tabs) {
            var tab = tabs[0];
            if (tab && tab.url) {
                renderCreatePage(tab.url);
            } else {
                alert('Please wait for the page to load!');
            }

        });
    });
    $('#home-btn').on('click', function () {
        renderAllSites();
        renderAlertMessage();//resetting alert message
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
        curid: curGroup,
        curGroupLinks: curLinks[curGroup].links
    }
    return viewModel;
}

/*data generation functions <end>*/

/*render functions<start>*/
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
        renderAlertMessage();//resetting alert message 
        registerSubmit();
    });
}
function renderAlertMessage(alertType, message) {
    var context = {
        type: alertType,
        message: message
    }
    handlebarsCompile(context, alertTemplate, "alertNode");
}
/*render funtions <end>*/
function registerSubmit() {
    $('#create-page-submit').on('click', function () {
        var pageName = $('#page-name').val();
        var pageUrl = $('#page-url').val();
        var groupid = $('#page-group').attr('data-id');
        //perform validations
        if (validateCreatePage(pageName, pageUrl))
            createNewPage(pageName, pageUrl, groupid);
    });
}
function validateCreatePage(pageName, pageUrl) {

    if (!isValid(pageName)) {
        renderAlertMessage('failure', invalidPageNameMsg);
        return false;
    } else if (!isValid(pageUrl, true)) {
        renderAlertMessage('failure', invalidPageURLMsg);
        return false;
    }
    return true;
}
function createNewPage(pageName, pageUrl, groupid) {
    var url = new URL(pageUrl);
    var linkObj = {
        url: pageUrl,
        name: pageName,
        hostname: url.hostname
    }
    //saving to storage
    saveLink(linkObj, groupid);
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
            renderAlertMessage('success', success_pageCreation);
            renderAllSites();
        }

    });
}

function changeGroupSelection(id) {
    var curLinks = _linksInStorage;

    if (!curLinks) {
        curLinks = getDefaultLinkArray();
    }

    handlebarsCompile(getViewModel(curLinks, id), homeTemplate);
}
function changeSelectionCreatePage(id) {
    var curLinks = _linksInStorage;

    if (!curLinks) {
        curLinks = getDefaultLinkArray();
    }
    var context = getViewModel(curLinks, id);
    context.name = $('#page-name').val();
    context.url = $('#page-url').val();
    handlebarsCompile(context, createPageTemplate);
    registerSubmit();
}
function handlebarsCompile(context, templateId, targetNode) {
    var source = $("#" + templateId).html();
    var template = Handlebars.compile(source);

    var html = template(context);
    if (!targetNode)
        $('#container').html(html);
    else
        $('#' + targetNode).html(html);
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

function saveToStorage(data) {
    chrome.storage.sync.set(data);
}

/* Helper Methods */
function isValid(val, validateURL) {
    if (!validateURL) {
        if (val && val.trim() && val.trim().length > 0)
            return true;
    } else {
        if (val && val.trim() && val.trim().length > 0) {
            try {
                var url = new URL(val);
                return true;
            } catch (error) {
                return false;
            }
        }
    }
    return false;
}
/*handlebars helpers*/
function registerHandlebarsHelpers() {
    Handlebars.registerHelper("equal", function (context, options) {
        var params = options.hash;
        var condition = objectComparison(context, params["to"], params["ignoreCase"]);

        if (condition) {
            return options.fn(this, options);
        } else {
            return options.inverse(this, options);
        }
    });
}
var objectComparison = function (obj1, obj2, ignoreCase) {
    var result = false;

    if (obj1 != null && obj2 != null) {
        if (ignoreCase && obj1.toLowerCase && obj2.toLowerCase) {
            obj1 = obj1.toLowerCase();
            obj2 = obj2.toLowerCase();
        }

        if (obj1.equal) {
            result = obj1.equal(obj2);
        } else {
            // '==' not '===' so that we can handle string/number conversion
            result = (obj1 == obj2);
        }
    }

    return result;
};