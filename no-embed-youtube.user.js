// ==UserScript==
// @name No Embed Youtube
// @version 2.2.0
// @description replace embed iframe, object with anchor link.
// @homepageURL https://github.com/eight04/no-embed-youtube
// @supportURL https://github.com/eight04/no-embed-youtube/issues
// @license MIT
// @author eight04 <eight04@gmail.com>
// @namespace eight04.blogspot.com
// @include http*
// @exclude http://www.youtube.com/*
// @exclude https://www.youtube.com/*
// @run-at document-start
// @grant none
// ==/UserScript==


"use strict";

//http://www.cnet.com/news/youtubes-new-nocookie-feature-continues-to-serve-cookies/

var xpath = `(
	//iframe[
		contains(@src, 'youtube.com/embed/') or
		contains(@src, 'youtube.com/v/') or
		contains(@src, 'youtube-nocookie.com/embed/') or
		contains(@src, 'youtube-nocookie.com/v/') or
		contains(@data-src, 'youtube.com/embed/')
	] |
	//object[./param[contains(@value, 'youtube.com/v/')]] |
	//embed[
		contains(@src, 'youtube.com/v/') and
		not(ancestor::object)
	]
)[not(ancestor::*[@id='YTLT-player'])]`;

var unEmbed = function(node){

	var result = document.evaluate(
		xpath, node, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);

	var element = null;
	var i = 0, j;

	while ((element = result.snapshotItem(i++))) {

		// iframe or embed
		var url = element.src || element.dataset.src;

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

new MutationObserver(function(){
	if (document.body) {
		unEmbed(document.body);
	}
}).observe(document, {
	childList: true,
	subtree: true
});
