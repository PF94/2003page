//
//  iWeb - RSSFeed.js
//  Copyright (c) 2007-2008 Apple Inc. All rights reserved.
//

var RSSFeedWidget=Class.create(JSONFeedRendererWidget,{widgetIdentifier:"com-apple-iweb-widget-rssfeed",initialize:function($super,instanceID,widgetPath,sharedPath,sitePath,preferences,runningInApp)
{if(instanceID)
{$super(instanceID,widgetPath,sharedPath,sitePath,preferences,runningInApp);this.m_loaded=false;this.m_initializingDefaultPreferences=true;this.initializeDefaultPreferences({showDate:true,numberOfEntries:10,photoSize:1.0,articleLength:400,orientation:0,display:0});this.m_initializingDefaultPreferences=undefined;if(this.runningInApp)
{window.onresize=this.resize.bind(this);}
var parentDiv=this.div("rssFeed");this.m_views={};if(this.runningInApp)
{this.m_views["no-feed"]=new NoFeedStatusView(this,parentDiv);this.m_views["user-offline"]=new UserOfflineStatusView(this,parentDiv);this.m_views["bad-feed"]=new BadFeedStatusView(this,parentDiv);this.m_views["bad-feed-address"]=new BadFeedURLStatusView(this,parentDiv);this.m_views["feed-offline"]=new FeedOfflineStatusView(this,parentDiv);}
else
{this.m_views["no-feed"]=new PublishedErrorStatusView(this,parentDiv);this.m_views["user-offline"]=this.m_views["no-feed"];this.m_views["bad-feed"]=this.m_views["no-feed"];this.m_views["bad-feed-address"]=this.m_views["no-feed"];this.m_views["feed-offline"]=this.m_views["no-feed"];}
this.m_views["large-enclosures"]=new LargeEnclosuresLoadingStatusView(this,parentDiv);this.m_views["loading"]=new LoadingStatusView(this,parentDiv);this.m_views["feed"]=new RSSFeedView(this);this.m_callbackName="jsonCallback"+instanceID;window[instanceID]=this;eval("window['"+this.m_callbackName+"'] = function(result) { window['"+instanceID+"'].parseFeed(result); }");this.loadFeed();}},onload:function($super)
{$super();this.changedPreferenceForKey("sfr-stroke");this.changedPreferenceForKey("sfr-reflection");this.changedPreferenceForKey("sfr-shadow");},changedPreferenceForKey:function($super,key)
{if(!this.m_initializingDefaultPreferences)
{if((key=="address")||(key=="x-online")||((key=="numberOfEntries")&&(this.m_requestedMaxEntries)&&(this.preferenceForKey("numberOfEntries")>this.m_requestedMaxEntries)))
{this.loadFeed();}
else if((this.m_views)&&(this.m_currentView)&&(this.m_currentView==this.m_views["feed"]))
{if(key=="display")
{var displayLayout=parseInt(this.preferenceForKey("display"));var datesEnabled=this.preferenceForKey("showDate");var newViewProperties=this.m_views["feed"].m_entriesView.m_layoutNonCSSProperties[displayLayout];if(datesEnabled&&newViewProperties.dateOnByDefault==false)
{this.setPreferenceForKey(false,"showDate");}
if(newViewProperties.defaultFullWidthPhoto)
{this.setPreferenceForKey(1.0,"photoSize");}
this.m_views["feed"].render();}
else
{this.invalidateFeedItems(key);}}
$super(key);}},p_massageURL:function(url)
{url=url.strip();if((url.search(/:\/\//)==-1)&&(url.indexOf(".")!=-1))
{url="http://"+url;}
url=url.replace(/^feed:/,"http:");return url;},loadFeed:function(refreshOnly)
{var url=this.preferenceForKey("address");if((this.preferenceForKey("x-online")===false)&&url&&(url.length>0))
{this.showView("user-offline");}
else if(url&&url.length>0)
{var callback=this.m_callbackName;var maxEntries=parseInt(this.preferenceForKey("numberOfEntries"));this.m_requestedMaxEntries=(this.runningInApp?Math.max(99,maxEntries):maxEntries);url=this.p_massageURL(url);if(url.isHTTPURL())
{refreshOnly||this.showView("loading");var parameters=$H({url:encodeURI(url),callback:encodeURIComponent(callback),maxEntries:encodeURIComponent(this.m_requestedMaxEntries||99)});var jsonURL='http://reader.mac.com/mobile/v2/?'+parameters.toQueryString();var script=document.createElement('script');$(script).writeAttribute({src:jsonURL,charset:'UTF-8'});var head=document.getElementsByTagName('head')[0];head.appendChild(script);}
else
{this.showView("bad-feed-address");}}
else
{this.showView("no-feed");}},p_parseContent:function(markup,enclosure)
{var inlineImages=null;var content='';var loadDiv=new Element('div',{style:'position: absolute; visibility: hidden;'});loadDiv.innerHTML=markup;try
{function parseNodeList(nodeList,linkAncestor)
{var result='';if(nodeList)
{for(var i=0,length=nodeList.length;i<length;i++)
{result+=parseNode(nodeList[i],linkAncestor);}}
return result;}
function parseNode(node,linkAncestor)
{var result='';if(node.nodeType==Node.TEXT_NODE)
{if(node.nodeValue)
{result+=node.nodeValue.escapeHTML();}}
else if(node.nodeType==Node.ELEMENT_NODE)
{var children=node.childNodes;var tagName=node.tagName;tagName=tagName?tagName.toLowerCase():'';if(tagName=='a')
{result+='<a href="'+node.getAttribute('href')+'">';result+=parseNodeList(children,true);result+='</a>';}
else if(tagName=='img'&&linkAncestor)
{result+=node.getAttribute('alt')||'';}
else if(tagName=='b'||tagName=='i'||tagName=='s'||tagName=='u')
{result+='<'+tagName+'>';result+=parseNodeList(children,linkAncestor);result+='</'+tagName+'>';}
else if(tagName=='p')
{result+=parseNodeList(children,linkAncestor);result+='<br />';}
else if(tagName=='br')
{result+='<br />';}
else
{result+=parseNodeList(children,linkAncestor);}}
return result;}
content=parseNode(loadDiv,false);}
catch(e)
{content=getTextFromNode(loadDiv);}
if(!enclosure||!enclosure.url)
{var imgs=loadDiv.select('img');if(imgs&&imgs.length>0)
{inlineImages=imgs.pluck('src');}}
return{content:content,inlineImages:inlineImages};},parseFeed:function(result)
{if(result.feed)
{var entries=$A(result.feed.entries);entries.each(function(entry){var parsedResult=this.p_parseContent(entry.content,entry.enclosure);entry.content=parsedResult.content;if(parsedResult.inlineImages)
{entry.inlineImages=parsedResult.inlineImages;entry.enclosure=null;}
entry.date=entry.date.escapeHTML();entry.link=entry.link.escapeHTML();entry.title=entry.title.escapeHTML();}.bind(this));if(!this.m_loaded&&this.m_currentView!=this.m_views["feed"])
{var enclosures=entries.pluck('enclosure');var enclosureSize=enclosures.inject(0,function(acc,enclosure){var total=acc;if(enclosure&&enclosure.length&&enclosure.url)
{var pathExtension=enclosure.url.pathExtension();if(RSSEntriesView.prototype.extensionRefersToWebImage(pathExtension))
{total+=parseInt(enclosure.length);}}
return total;}.bind(this));if(enclosureSize>262144)
this.showView("large-enclosures");this.m_loaded=true;}
this.m_feedTitle=result.feed.title.escapeHTML();this.m_feedLink=result.feed.link.escapeHTML();this.m_views["feed"].setFeed(result.feed);}
else if(result.error)
{var error=result.error;if(error.code&&error.code==502)
{this.showView("bad-feed");}
else
{this.showView("feed-offline");}}
setTimeout(this.loadFeed.bind(this,true),1000*60*5);},resize:function()
{$H(this.m_views).each(function(pair){pair.value.resize();});},renderFeedItems:function(reason)
{if(this.pendingRender)
{clearTimeout(this.pendingRender);this.pendingRender=null;}
if(this.onloadReceived==false)
{this.invalidateFeedItems();return;}
this.m_views["feed"].reapplySettings(reason);},vectorAssetURL:function(name)
{var url=this.preferenceForKey(name);if(!url)
{url=this.widgetPath+'/'+name+'.pdf';}
return url;}});RSSEntriesView=Class.create(View,{m_divId:"entriesContainer",m_divClass:"EntriesView",m_imgExtensions:['jpg','jpeg','png','gif'],m_audioExtensions:['aac','aif','aiff','aifc','amr','bwf','cdda','m4a','m4b','m4p','mp3','swa','wav'],m_movieExtensions:['3g2','3gp','3gp2','3gpp','m4v','mov','mp4','mqv','qt','mpeg','mpg','swf'],m_layoutNonCSSProperties:[{photoMaxPercent:1,cellsPerRow:1,clearThreshold:1,margin:2,dateOnByDefault:true,defaultFullWidthPhoto:false},{photoMaxPercent:1,cellsPerRow:1,clearThreshold:1,margin:2,dateOnByDefault:true,defaultFullWidthPhoto:true},{photoMaxPercent:1,cellsPerRow:1,clearThreshold:0.8,margin:2,dateOnByDefault:true,defaultFullWidthPhoto:false},{photoMaxPercent:1,cellsPerRow:1,clearThreshold:0.8,margin:2,dateOnByDefault:true,defaultFullWidthPhoto:false},{photoMaxPercent:1,cellsPerRow:1,clearThreshold:1,margin:1,dateOnByDefault:false,defaultFullWidthPhoto:true},{photoMaxPercent:0.5,cellsPerRow:2,clearThreshold:1,margin:1,dateOnByDefault:false,defaultFullWidthPhoto:true},{photoMaxPercent:0.33,cellsPerRow:3,clearThreshold:1,margin:1,dateOnByDefault:false,defaultFullWidthPhoto:true}],m_orientationMap:["Original","Square","Landscape","Portrait"],initialize:function($super,widget,parentDiv,footerView)
{$super(widget,parentDiv);this.m_footerView=footerView;var entriesDiv=this.ensureDiv();this.m_scrollArea=new IWScrollArea(entriesDiv);this.show();},setFeed:function(feed)
{this.m_feed=feed;},p_findAndLoadInlineFromList:function(index,entry,inlineIndex)
{if(inlineIndex<entry.inlineImages.length)
{var src=entry.inlineImages[inlineIndex];if(!src.match(/\bad\b/)&&!src.match(/\bads\b/))
{var img=new Image();img.onload=function(img,index,entry,inlineIndex){if(img.width>48&&img.height>48)
{entry.m_imageURL=img.src;this.m_feed.m_lastImageWidth=-1;this.m_widget.invalidateFeedItems();}
else
{this.p_findAndLoadInlineFromList(index,entry,inlineIndex+1);}}.bind(this,img,index,entry,inlineIndex);img.src=src;}
else
{this.p_findAndLoadInlineFromList(index,entry,inlineIndex+1);}}},render:function()
{if(this.m_feed)
{var dateFormat=this.m_widget.preferenceForKey("dateFormat");var dateTimeFormat=this.m_widget.preferenceForKey("dateTimeFormat");this.m_feed.dateFormat=(dateTimeFormat||"EEEE, MMMM d, yyyy");this.m_feed.contextualDateFormat=(dateFormat&&dateTimeFormat)?dateTimeFormat.replace(dateFormat,"CCCCC"):"CCCCC";var displayLayout=parseInt(this.m_widget.preferenceForKey("display"));var feedDiv=this.ensureDiv();feedDiv.update("<table id='"+this.m_widget.getInstanceId('feed-table')+"'class='FeedTable' />");var feedTable=this.m_widget.getElementById('feed-table');var itemIndex=0;var feedTableMarkup="";$A(this.m_feed.entries).each(function(entry)
{if((itemIndex%(this.m_layoutNonCSSProperties[displayLayout].cellsPerRow))==0)
{feedTableMarkup+="<tr>";}
var entryDivId=this.p_adjustedNodeId("item",itemIndex);feedTableMarkup+='<td class="FeedEntry" id="'+entryDivId+'">';var dateString=entry.date||"";feedTableMarkup+='<div id="'+this.p_adjustedNodeId("date",itemIndex)+'" class="RSS_Date">'+
dateString+'</div>';feedTableMarkup+='<div id="'+this.p_adjustedNodeId("headline",itemIndex)+'" class="RSS_Headline">'+'<a href="'+entry.link+'" target="_blank">'+
entry.title+'</a></div>\n';feedTableMarkup+='<div>';if(entry.enclosure||entry.inlineImages)
{var href=entry.link;var imgURL=null;var smallSize=false;if(entry.enclosure)
{var pathExtension=entry.enclosure.url.pathExtension();if(entry.enclosure.forceImage||this.m_imgExtensions.contains(pathExtension))
{imgURL=entry.enclosure.url;}
else
{imgURL=(this.m_audioExtensions.contains(pathExtension)?this.m_widget.vectorAssetURL("placeholder-audio"):(this.m_movieExtensions.contains(pathExtension)?this.m_widget.vectorAssetURL("placeholder-MooV"):null));href=entry.enclosure.url;smallSize=true;}}
else
{this.p_findAndLoadInlineFromList(itemIndex,entry,0);}
if(imgURL)
{entry.m_imageURL=imgURL;}
feedTableMarkup+="<div class='RSS_Feed_Entry_Image' id='"+this.p_adjustedNodeId("image",itemIndex)+"'>";feedTableMarkup+="<a href='"+href+"' target='_blank'>";feedTableMarkup+="<div "+(smallSize?"class='small' ":"")+" id='"+this.p_adjustedNodeId("image-group",itemIndex)+"'>";feedTableMarkup+="</div>";feedTableMarkup+="</a>";feedTableMarkup+="</div>";}
this.m_feed.m_lastImageWidth=-1;feedTableMarkup+="<div id='"+this.p_adjustedNodeId("clearing-block",itemIndex)+"' ></div>";feedTableMarkup+="<div id='"+this.p_adjustedNodeId("body",itemIndex)+"' class='RSS_Body'></div>";feedTableMarkup+="</div>";feedTableMarkup+='</td>';if(((itemIndex+1)==(this.m_feed.entries.length))||((itemIndex+1)%(this.m_layoutNonCSSProperties[displayLayout].cellsPerRow)==0))
{feedTableMarkup+="</tr>";}
itemIndex++;}.bind(this));feedTable.update(feedTableMarkup);this.reapplySettings();if(this.m_widget.privateFeedDidRender)
{this.m_widget.privateFeedDidRender();}}},p_imageWidth:function()
{var photoSizeSliderVal=parseFloat(this.m_widget.preferenceForKey("photoSize"));var displayLayout=parseInt(this.m_widget.preferenceForKey("display"));var widgetWidth=this.m_widget.div().offsetWidth;var widgetHeight=this.m_widget.div().offsetHeight;var scaledImageMinimum=0.1;var scaledImageMaximum=this.m_layoutNonCSSProperties[displayLayout].photoMaxPercent;var imageMargin=this.m_layoutNonCSSProperties[displayLayout].margin;var scaledPhotoSize=(photoSizeSliderVal*(scaledImageMaximum-scaledImageMinimum))+scaledImageMinimum;var feedDiv=this.ensureDiv();var entriesViewPaddingTotal=parseFloat(feedDiv.getStyle("padding-left"))+
parseFloat(feedDiv.getStyle("padding-right"));var imageMarginTotal=2*imageMargin;var availableImageWidth=widgetWidth-entriesViewPaddingTotal-imageMarginTotal;var imageWidth=availableImageWidth*scaledPhotoSize;if(this.m_widget.sfrStroke)
{var strokeExtra=this.m_widget.sfrStroke.strokeExtra();imageWidth-=(strokeExtra.left+strokeExtra.right);imageWidth=Math.max(0,imageWidth);}
return imageWidth;},p_reRenderImage:function(itemIndex,entry)
{var renderingImage=false;var imageDiv=$(this.p_adjustedNodeId("image",itemIndex));var imageGroupDiv=$(this.p_adjustedNodeId("image-group",itemIndex));if(imageDiv&&imageGroupDiv&&entry.m_imageURL)
{var currentImageWidth=this.p_imageWidth();if(imageGroupDiv.hasClassName('small'))
{currentImageWidth=Math.min(currentImageWidth,60);}
var orientation=parseInt(this.m_widget.preferenceForKey("orientation"));var photoProportions=this.m_orientationMap[orientation];this.m_widget.rerenderImage(imageGroupDiv,imageDiv,entry.m_imageURL,true,photoProportions,currentImageWidth,this.reposition.bind(this,itemIndex),this.imageDoneLoading.bind(this,itemIndex));renderingImage=true;}
return renderingImage;},reapplySettings:function(reason)
{if(this.m_feed)
{var widgetWidth=this.m_widget.div().offsetWidth;var widgetHeight=this.m_widget.div().offsetHeight;var datesEnabled=this.m_widget.preferenceForKey("showDate");var displayLayout=parseInt(this.m_widget.preferenceForKey("display"));var numberOfEntries=Math.min(parseInt(this.m_widget.preferenceForKey("numberOfEntries")),this.m_feed.entries.length);var photoSizeSliderVal=parseFloat(this.m_widget.preferenceForKey("photoSize"));var orientation=parseInt(this.m_widget.preferenceForKey("orientation"));var feedDiv=this.ensureDiv();var entriesViewPaddingTotal=parseFloat(feedDiv.getStyle("padding-left"))+
parseFloat(feedDiv.getStyle("padding-right"));var imageWidth=this.p_imageWidth();var layoutClass="FeedEntryLayout"+(displayLayout+1);feedDiv.className="EntriesView "+layoutClass;var feedDivWidth=px(widgetWidth-entriesViewPaddingTotal);feedDiv.setStyle({width:feedDivWidth});var feedTable=this.m_widget.getElementById('feed-table');var descriptionClear=(photoSizeSliderVal>this.m_layoutNonCSSProperties[displayLayout].clearThreshold);var rerenderImages=((this.m_feed.m_lastOrientation!=orientation)||(this.m_feed.m_lastImageWidth!=imageWidth)||(this.m_feed.m_lastLayoutClass!=layoutClass)||(this.m_feed.m_numberOfEntries!=numberOfEntries)||(reason=="sfr-shadow")||(reason=="sfr-reflection")||(reason=="sfr-stroke"));this.m_imagesWaitingToLoad=0;for(itemIndex=0;;itemIndex++)
{var entryDiv=$(this.p_adjustedNodeId("item",itemIndex));if(!entryDiv)break;if(itemIndex>=numberOfEntries)
{entryDiv.hide();}
else
{entryDiv.show();var dateDiv=$(this.p_adjustedNodeId("date",itemIndex));Element[(datesEnabled>0)?'show':'hide'](dateDiv);var entry=$A(this.m_feed.entries)[itemIndex];var imageDiv=$(this.p_adjustedNodeId("image",itemIndex));var imageGroupDiv=$(this.p_adjustedNodeId("image-group",itemIndex));if(rerenderImages)
{if(this.p_reRenderImage(itemIndex,entry))
{this.m_imagesWaitingToLoad++;}}
var clearingBlock=$(this.p_adjustedNodeId("clearing-block",itemIndex));clearingBlock.className=descriptionClear?"ClearBothSeparator":"NoEffect";var excerptLength=this.m_widget.preferenceForKey("articleLength");if(!(entry.m_truncatedDescriptionCache)||(entry.m_truncatedDescriptionCache.length!=excerptLength))
{if(!entry.m_descriptionFilteredMarkup)
{entry.m_descriptionFilteredMarkup=entry.content;}
if(!entry.m_truncatedDescriptionCache)
{entry.m_truncatedDescriptionCache={};}
entry.m_truncatedDescriptionCache.length=excerptLength;entry.m_truncatedDescriptionCache.markup=this.m_widget.summaryExcerpt(entry.m_descriptionFilteredMarkup,excerptLength);}
entryDiv.select("div.RSS_Body")[0].update(entry.m_truncatedDescriptionCache.markup);}}
this.m_feed.m_lastOrientation=orientation;this.m_feed.m_lastImageWidth=imageWidth;this.m_feed.m_lastLayoutClass=layoutClass;this.m_feed.m_numberOfEntries=numberOfEntries;this.p_checkImageLoadPendingCount();this.m_scrollArea.refresh();}},reposition:function(itemIndex)
{var imageDiv=$(this.p_adjustedNodeId("image",itemIndex));var imageGroupDiv=$(this.p_adjustedNodeId("image-group",itemIndex));var cropDiv=imageDiv.down('.crop');if(cropDiv)
{var displayLayout=parseInt(this.m_widget.preferenceForKey("display"));if(displayLayout==6||displayLayout==5||displayLayout==4||displayLayout==1)
{var options={setLeft:false,setTop:false,setWidth:true,setHeight:false};imageGroupDiv.clonePosition(cropDiv,options);imageDiv.clonePosition(cropDiv,options);}}},imageDoneLoading:function(itemIndex)
{this.m_imagesWaitingToLoad--;this.p_checkImageLoadPendingCount();var imageDiv=$(this.p_adjustedNodeId("image",itemIndex));var imageGroupDiv=$(this.p_adjustedNodeId("image-group",itemIndex));var displayLayout=parseInt(this.m_widget.preferenceForKey("display"));var imageMargin=px(this.m_layoutNonCSSProperties[displayLayout].margin);imageDiv.setStyle({margin:imageMargin});if(windowsInternetExplorer)
{var cropDiv=imageDiv?imageDiv.down('.crop'):null;if(cropDiv)
{if(displayLayout==6||displayLayout==5||displayLayout==4)
{imageGroupDiv.setStyle({marginLeft:0,marginRight:0});}}}},resize:function()
{this.reapplySettings();},addScrollbarView:function(scrollbarView)
{this.m_scrollArea.addScrollbar(scrollbarView.m_scrollbar);},extensionRefersToWebImage:function(pathExtension)
{return(this.m_imgExtensions.contains(pathExtension));},p_adjustedNodeId:function(rootNodeId,index)
{return this.m_widget.getInstanceId(rootNodeId)+"$"+index;},p_checkImageLoadPendingCount:function()
{if(this.m_imagesWaitingToLoad==0)
{this.m_widget.showView("feed");}}});RSSFooterView=Class.create(View,{m_divId:"footer",m_divClass:"FooterView",initialize:function($super,widget,parentDiv)
{$super(widget,parentDiv);this.render();this.show();},resize:function($super)
{$super();var footerDiv=this.ensureDiv();var footerHeight=footerDiv.getHeight();this.m_widget.div().select('.FeedViewTable').each(function(table){var tableHeight=table.getHeight();if(tableHeight>0)
{if(!this.m_widget.runningInApp)
{var cellDiv=table.selectFirst('.FeedViewCell');cellDiv.setStyle({position:'absolute',height:px(tableHeight-footerHeight)});}
var scrollbarDiv=table.selectFirst('.RSSScrollbarView');scrollbarDiv.setStyle({height:px(tableHeight-footerHeight-3)});}}.bind(this));},render:function()
{var footerDiv=this.ensureDiv();if((this.m_widget.m_feedTitle)&&(this.m_widget.m_feedTitle.length>0)&&(this.m_widget.m_feedLink)&&(this.m_widget.m_feedLink.length>0))
{var markup='<table><tr>';markup+='<td><a href="'+this.m_widget.m_feedLink+'" target="_blank" class="RSS_Footer">'
markup+=this.m_widget.m_feedTitle;markup+='</a></td>';markup+='<td><a href="'+this.m_widget.m_feedLink+'" target="_blank" class="RSS_Footer">';markup+=imgMarkup(this.m_widget.widgetPath+'/arrow-link.png',"","class='FooterLinkArrow'","");markup+='</a></td>';markup+='</tr></table>';footerDiv.update(markup);footerDiv.style.visibility="visible";}
else
{footerDiv.update("");footerDiv.style.visibility="hidden";}
this.resize();if(this.m_widget.privateFeedDidRender)
{this.m_widget.privateFeedDidRender();}}});var RSSFeedView=Class.create(View,{m_divId:'feedContainer',m_divClass:'RSSFeedContainer',initialize:function($super,widget)
{$super(widget,widget.div("rssFeed"));this.p_constructDOM();this.m_footerView=new RSSFooterView(widget,this.ensureDiv());this.m_entriesView=new RSSEntriesView(widget,this.ensureDiv(),this.m_footerView);this.m_scrollbarView=new RSSScrollBarView(widget,this.ensureDiv(),this.m_entriesView,this.m_footerView);this.m_footerView.show();this.m_entriesView.show();this.m_scrollbarView.show();},setFeed:function(feed)
{this.m_entriesView.setFeed(feed);this.resize();this.render();},render:function()
{this.m_footerView.render();this.m_entriesView.render();this.m_scrollbarView.render();},resize:function()
{this.m_footerView.resize();this.m_entriesView.resize();this.m_scrollbarView.resize();},reapplySettings:function(reason)
{this.m_entriesView.reapplySettings(reason);},p_constructDOM:function()
{var template=new Template(''+'<table class="FeedViewTable">'+'<tr class="FeedViewMain"><td>'+'<div class="FeedViewCell">'+'<div class="EntriesView" id="#{widget_id}-entriesContainer"></div>'+'<div class="RSSScrollbarView" id="#{widget_id}-scrollbar"></div>'+'</div>'+'</td></tr>'+'<tr class="FeedViewFooter"><td>'+'<div class="FooterView" id="#{widget_id}-footer"></div>'+'</td></tr>'+'</table>');var div=$(this.ensureDiv());div.update(template.evaluate({widget_id:this.m_widget.instanceID}));}});var RSSScrollBarView=Class.create(View,{m_divId:"scrollbar",m_divClass:"RSSScrollbarView",initialize:function($super,widget,parentDiv,entriesView,footerView)
{$super(widget,parentDiv);this.m_footerView=footerView;this.m_scrollbar=new IWVerticalScrollbar(this.ensureDiv());entriesView.addScrollbarView(this);this.m_scrollbar.setSize(6);this.m_scrollbar.setTrackStart(transparentGifURL(),1);this.m_scrollbar.setTrackMiddle(transparentGifURL());this.m_scrollbar.setTrackEnd(transparentGifURL(),1);this.m_scrollbar.setThumbStart(this.m_widget.widgetPath+"/"+"RSS-scroll-top.png",3);this.m_scrollbar.setThumbMiddle(this.m_widget.widgetPath+"/"+"RSS-scroll-fill.png");this.m_scrollbar.setThumbEnd(this.m_widget.widgetPath+"/"+"RSS-scroll-bottom.png",3);this.resize();},resize:function()
{this.m_scrollbar.refresh();}});var NoFeedStatusView=Class.create(StatusView,{m_divId:"no-feed-status",m_divClass:"StatusView",badgeImage:"RSS-placeholder-default.png",badgeImageWidth:128,badgeImageHeight:69});var LoadingStatusView=Class.create(StatusView,{m_divId:"loading-status",m_divClass:"StatusView",statusMessageKey:"<b>Downloading RSS feed…</b>",upperRightBadgeWidth:24,upperRightBadgeHeight:95,badgeImage:"Indeterminate-Spinner-Gray-Fast.gif",badgeImageWidth:32,badgeImageHeight:32});var LargeEnclosuresLoadingStatusView=Class.create(StatusView,{m_divId:"large-enclosures-status",m_divClass:"StatusView",statusMessageKey:"<b>The feed contains large files.</b><br />Download times may increase.",upperRightBadge:"error-glyph.png",upperRightBadgeWidth:24,upperRightBadgeHeight:19,badgeImage:"Indeterminate-Spinner-Gray-Fast.gif",badgeImageWidth:32,badgeImageHeight:32});var UserOfflineStatusView=Class.create(StatusView,{m_divId:"user-offline-status",m_divClass:"StatusView",badgeImage:"RSS-placeholder-default_disabled.png",badgeImageWidth:128,badgeImageHeight:69,statusMessageKey:"<b>You are offline.</b><br />You must be connected to the Internet to access this feed.",upperRightBadge:"error-glyph.png",upperRightBadgeWidth:24,upperRightBadgeHeight:19});var BadFeedStatusView=Class.create(StatusView,{m_divId:"bad-feed-status",m_divClass:"StatusView",badgeImage:"RSS-placeholder-default_disabled.png",badgeImageWidth:128,badgeImageHeight:69,statusMessageKey:"<b>The feed can&#8217;t be processed.</b><br />Check your source, and then click Apply again.",upperRightBadge:"error-glyph.png",upperRightBadgeWidth:24,upperRightBadgeHeight:19});var FeedOfflineStatusView=Class.create(StatusView,{m_divId:"feed-offline-status",m_divClass:"StatusView",badgeImage:"RSS-placeholder-default_disabled.png",badgeImageWidth:128,badgeImageHeight:69,statusMessageKey:"<b>The RSS feed source can&#8217;t be reached.</b><br />Try again later.",upperRightBadge:"error-glyph.png",upperRightBadgeWidth:24,upperRightBadgeHeight:19});var BadFeedURLStatusView=Class.create(StatusView,{m_divId:"bad-feed-url-status",m_divClass:"StatusView",badgeImage:"RSS-placeholder-default_disabled.png",badgeImageWidth:128,badgeImageHeight:69,statusMessageKey:"<b>The URL you entered is invalid.</b><br />Double-check the feed address, and then try again.",upperRightBadge:"error-glyph.png",upperRightBadgeWidth:24,upperRightBadgeHeight:19});var PublishedErrorStatusView=Class.create(StatusView,{m_divId:"published-error-status",m_divClass:"StatusView",badgeImage:"RSS-placeholder-default.png",badgeImageWidth:128,badgeImageHeight:69});