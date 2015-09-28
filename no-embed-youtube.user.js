// ==UserScript==
// @name        No Embed Youtube
// @description	replace embed iframe, object with anchor link.
// @namespace   eight04.blogspot.com
// @include     http*
// @exclude		http://www.youtube.com/*
// @exclude		https://www.youtube.com/*
// @version     2.0.0
// @run-at		document-start
// @grant       none
// ==/UserScript==

"use strict";

var xpath = "//iframe[contains(@src,'youtube.com/embed/') and not(ancestor::*[@id='YTLT-player'])]|" +
	"//iframe[contains(@src,'youtube.com/v/') and not(ancestor::*[@id='YTLT-player'])]|" +
	"//object[./param[contains(@value,'youtube.com/v/')] and not(ancestor::*[@id='YTLT-player'])]|" +
	"//embed[contains(@src,'youtube.com/v/') and not(ancestor::object) and not(ancestor::*[@id='YTLT-player'])]";

var unEmbed = function(node){

	var result = document.evaluate(
		xpath, node, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);

	var element = null;
	var i = 0, j;

	while(element = result.snapshotItem(i++)){

		// iframe or embed
		var url = element.src;

		// object
		if(!url){
			for(j = 0; j < element.childNodes.length; j++){
				var pa = element.childNodes[j];
				if(pa.nodeName == "PARAM" && pa.getAttribute("name") == "movie"){
					url = pa.getAttribute("value");
					break;
				}
			}
		}

		if(!url){
			continue;
		}

		var id = url.match(/(embed|v)\/(.+?)(\?|&|$)/)[2];
		var a = document.createElement("a");
		var pageUrl = "http://www.youtube.com/watch?v=" + id;
		a.appendChild(document.createTextNode(pageUrl));
		a.setAttribute("href", pageUrl.replace("http:", ""));
		a.setAttribute("target", "_blank");
		a.className = "unembed";

		element.parentNode.replaceChild(a, element);
	}
};

new MutationObserver(function(mutations){
	if (document.body) {
		unEmbed(document.body);
	}
}).observe(document, {
	childList: true,
	subtree: true
});
