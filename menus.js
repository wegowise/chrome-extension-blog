var loadInSeparateTab = true;

function checkboxOnClick(info, tab) {
  loadInSeparateTab = info.checked
}

var menus = { 'staging': { 'url': 'https://staging.example.com',
                           'color': 'orange',
                           'title': 'Staging' },
              'localhost':  { 'url': 'http://localhost:3000',
                              'color': 'green',
                              'title': 'Localhost' },
              'production': { 'url': 'https://www.example.com',
                              'color': 'red',
                              'title': 'Production' }
            }

function genericOnClick(info, tab) {
  var url = '';

  url = tab.url.split('/')
  url.splice(0, 3);
  url = menus[info.menuItemId] + "/" + url.join('/');

  if (loadInSeparateTab) {
    chrome.tabs.create({ url: url, index: tab.index+1 });
  } else {
    chrome.tabs.update(tab.id, { url: url })
  }

}

for (key in menus) {
  var menu = menus[key]
  chrome.contextMenus.create({ "id": key,
                               "title": menu.title,
                               "onclick": genericOnClick });
}

chrome.contextMenus.create({ "type": "separator" });


chrome.contextMenus.create({ "title": "Load in separate Tab",
                             "id": "loadInSeparateTab",
                             "type": "checkbox",
                             "checked": true,
                             "onclick": checkboxOnClick });

chrome.tabs.onUpdated.addListener(onTabUpdated);
chrome.tabs.onActivated.addListener(onTabActivated);

function onTabUpdated(tabId, changeInfo, tab) {
  checkForValidUrl(tab);
}

function onTabActivated(activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function(tab) {
    if (tab && tab.url) {
      checkForValidUrl(tab);
    }
  });
}

function checkForValidUrl(tab) {
  var menu = getMenu(tab.url);
  if (menu) {
    showIcon(menu.title, menu.color, tab.id);
  } else {
    chrome.pageAction.hide(tab.id);
  }
};

function getMenu(url) {
  if (url) {
    for (var i in menus) {
      menu = menus[i];
      if (menu && url.indexOf(menu.url) == 0) {
        return menu;
      }
    }
  }
  return null;
}

function showIcon(text, color, tabId) {
  chrome.pageAction.setIcon({ imageData: draw(text, color), tabId: tabId });
  chrome.pageAction.setTitle({ tabId: tabId, title: text });
  chrome.pageAction.show(tabId);
}

function draw(text, color) {    var canvas = document.getElementById('canvas');
  var context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  var gradient = context.createRadialGradient(10,10,2,10,10,12);
  var r = 6;
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, "white");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 19, 19);
  context.font='bold 12px Arial';
  context.fillStyle = 'black';
  context.fillText(text,3,14);
  context.strokeStyle = color;
  context.beginPath();
  context.moveTo(r,0);
  context.lineTo(canvas.width-r,0);
  context.arc(canvas.width-r, r, r, 1.5*Math.PI, 0);
  context.lineTo(canvas.width,canvas.height-r);
  context.arc(canvas.width-r, canvas.height-r, r, 0, 0.5*Math.PI);
  context.lineTo(r,canvas.height);
  context.arc(r, canvas.height-r, r, 0.5*Math.PI, Math.PI);
  context.lineTo(0,r);
  context.arc(r, r, r, Math.PI, 1.5*Math.PI);
  context.stroke();
  return context.getImageData(0, 0, 19, 19);
}
