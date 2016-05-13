// ==UserScript==
// @name        No Embed Youtube
// @description	replace embed iframe, object with anchor link.
// @namespace   eight04.blogspot.com
// @include     http*
// @exclude		http://www.youtube.com/*
// @exclude		https://www.youtube.com/*
// @version     2.1.0
// @run-at		document-start
// @grant       none
// ==/UserScript==

"use strict";

//http://www.cnet.com/news/youtubes-new-nocookie-feature-continues-to-serve-cookies/

var xpath = "//iframe[contains(@src,'youtube.com/embed/') and not(ancestor::*[@id='YTLT-player'])]|//iframe[contains(@src,'youtube.com/v/') and not(ancestor::*[@id='YTLT-player'])]|//object[./param[contains(@value,'youtube.com/v/')] and not(ancestor::*[@id='YTLT-player'])]|//embed[contains(@src,'youtube.com/v/') and not(ancestor::object) and not(ancestor::*[@id='YTLT-player'])]|//iframe[contains(@src,'youtube-nocookie.com/embed/') and not(ancestor::*[@id='YTLT-player'])]|//iframe[contains(@src,'youtube-nocookie.com/v/') and not(ancestor::*[@id='YTLT-player'])]";

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

		// https://developers.google.com/youtube/player_parameters#Manual_IFrame_Embeds
		var id = url.match(/(embed|v)\/(.+?)(\?|&|$)/)[2];
		var query = url.match(/\?(.+)/);
		var a = document.createElement("a");
		var pageUrl = "//www.youtube.com/watch?v=" + id;
		a.textContent = "http:" + pageUrl;
		if (query) {
			pageUrl += "&" + query[1];
		}
		a.href = pageUrl;
		a.target = "_blank";
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
