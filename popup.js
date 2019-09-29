'use strict';

let tablist = document.getElementById('tablist');
let lists;
let presentNames = [];

function updateLists() {
    chrome.storage.sync.get('tablists', function(data) {
        lists = data['tablists'];
        for (let list in lists) {
            if (!presentNames.includes(list)) {
                let child = document.createElement("button");
                child.style.width = '50px';
                child.style.height = '50px';
                name = lists[list].name;
                child.innerText = name;
                child.id = 'listButton-' + name;
                presentNames.push(list);
                tablist.appendChild(child);
            }
        }
        for (let name in presentNames) {
            document.getElementById('listButton-'+presentNames[name])
                .addEventListener("click", function() {
                    openList(presentNames[name]);
                });
        }

    });
}

updateLists();

function shortenTab({index, url, active, selected, pinned}) {
    return {index, url, active, selected, pinned};
}

function saveNewList() {
    let list = new Object();
    list.name = document.getElementById('listNameInput').value;
    chrome.tabs.query({}, function(tabs){
        list.tabs = tabs;
        lists[list.name] = list;
        chrome.storage.sync.set({tablists: lists}, function(){
            updateLists();
            let tabIds = [];
            for (let tab in tabs) {
                tabIds.push(tabs[tab].id);
            }
            chrome.tabs.create({});
            chrome.tabs.remove(tabIds);
        });
    });
}

function openList(name) {
    chrome.storage.sync.get('tablists', function(data){
        let tabs = data.tablists[name]['tabs'];
        for (let tab in tabs) {
            chrome.tabs.create(shortenTab(tabs[tab]));
        }
    });
}

document.getElementById('submitNewList').addEventListener("click", saveNewList);


