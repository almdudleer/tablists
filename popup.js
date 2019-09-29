'use strict';

let openBtnPrefix = 'openButton-';
let removeBtnPrefix = 'removeButton-';
let tablist = document.getElementById('tablist');
let lists;
let clearTabs = false;
let presentNames = [];

function updateLists(cllbck=()=>{}) {
    chrome.storage.sync.get('tablists', function (data) {
        lists = data['tablists'];
        cllbck();
    });
}

function addBtn(list) {
    let openBtn = document.createElement("button");
    let name = list.name;
    openBtn.innerText = name;
    openBtn.id = openBtnPrefix + name;
    openBtn.classList.add("left-item");
    presentNames.push(list);
    tablist.appendChild(openBtn);
    openBtn.addEventListener("click", function () {
        openList(list.name);
    });

    let removeBtn = document.createElement("button");
    removeBtn.classList.add("right-item");
    removeBtn.innerText = 'x';
    removeBtn.id = removeBtnPrefix + name;
    tablist.appendChild(removeBtn);
    removeBtn.addEventListener("click", function () {
        removeList(list);
    })

}

function rmBtn(list) {
    let openBtn = document.getElementById(openBtnPrefix + list.name);
    let removeBtn = document.getElementById(removeBtnPrefix + list.name);
    tablist.removeChild(openBtn);
    tablist.removeChild(removeBtn);
}

function addBtns(){
    updateLists(function() {
        for (let listId in lists) {
            if (lists.hasOwnProperty(listId) && !presentNames.includes(listId)) {
                addBtn(lists[listId]);
            }
        }
    });
}

function shortenTab({index, url, active, selected, pinned}) {
    return {index, url, active, selected, pinned};
}

function saveNewList() {
    let list = {};
    list.name = document.getElementById('listNameInput').value;
    chrome.tabs.query({}, function (tabs) {
        list.tabs = tabs;
        lists[list.name] = list;
        chrome.storage.sync.set({tablists: lists}, function () {
            updateLists(() => addBtn(list));
            if (clearTabs) {
                let tabIds = [];
                for (let tab in tabs) {
                    if (tabs.hasOwnProperty(tab))
                        tabIds.push(tabs[tab].id);
                }
                chrome.tabs.create({});
                chrome.tabs.remove(tabIds);
            }
        });
    });
}

function openList(name) {
    chrome.storage.sync.get('tablists', function (data) {
        console.log(data.tablists);
        console.log(name);

        let tabs = data.tablists[name]['tabs'];
        for (let tab in tabs)
            if (tabs.hasOwnProperty(tab))
                chrome.tabs.create(shortenTab(tabs[tab]));
    });
}

function removeList(list) {
    delete lists[list.name];
    chrome.storage.sync.set({tablists: lists}, function () {
        updateLists(() => rmBtn(list));
    });
}

addBtns();

document.getElementById('submitNewList').addEventListener("click", saveNewList);
document.getElementById('clearTabsCheck').value = clearTabs;
document.getElementById('clearTabsCheck').addEventListener("click", ()=>{clearTabs = !clearTabs});