let citations = []

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
//Function to reverse parameter
function deparam(params,coerce){var obj={},coerce_types={'true':!0,'false':!1,'null':null};$.each(params.replace(/\+/g,' ').split('&'),function(j,v){var param=v.split('='),key=decodeURIComponent(param[0]),val,cur=obj,i=0,keys=key.split(']['),keys_last=keys.length-1;if(/\[/.test(keys[0])&&/\]$/.test(keys[keys_last])){keys[keys_last]=keys[keys_last].replace(/\]$/,'');keys=keys.shift().split('[').concat(keys);keys_last=keys.length-1}else{keys_last=0}if(param.length===2){val=decodeURIComponent(param[1]);if(coerce){val=val&&!isNaN(val)?+val:val==='undefined'?undefined:coerce_types[val]!==undefined?coerce_types[val]:val}if(keys_last){for(;i<=keys_last;i++){key=keys[i]===''?cur.length:keys[i];cur=cur[key]=i<keys_last?cur[key]||(keys[i+1]&&isNaN(keys[i+1])?{}:[]):val}}else{if($.isArray(obj[key])){obj[key].push(val)}else if(obj[key]!==undefined){obj[key]=[obj[key],val]}else{obj[key]=val}}}else if(key){obj[key]=coerce?undefined:''}});return obj}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
function htmlEscape(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}


class WebCitation {
	constructor(
		authorLast,
		authorFirst,
		pageTitle,
		siteTitle,
		datePublished,
		dateAccessed,
		url,
		publisher=undefined
	){
		this.authorLast = authorLast
		this.authorFirst = authorFirst
		this.pageTitle = pageTitle
		this.siteTitle = siteTitle
		this.publisher = publisher
		this.datePublished = datePublished
		this.dateAccessed = dateAccessed
		this.url = url
  }

  get citationText() {
	  return `${this.authorLast}, ${this.authorFirst}. "${this.pageTitle}." \
${this.siteTitle}, ${this.publisher ? this.publisher + ', ' : ''}\
${this.datePublished}, ${this.dateAccessed}, ${this.url}`
  }
  get citationHTML(){
	  return `${this.authorLast}, ${this.authorFirst}. "${this.pageTitle}." \
<i>${this.siteTitle}</i>, ${this.publisher ? this.publisher + ', ' : ''}\
${this.datePublished}, ${this.dateAccessed}, <a href="http://${this.url}">${this.url}</a>`
  }
}

function constructCitationFromObj(obj){//Converts object to web citation
    return new WebCitation(obj.authorLast,obj.authorFirst,obj.pageTitle,obj.siteTitle,obj.datePublished,obj.dateAccessed,obj.url);
}

function updateCitationList() {
    var data = {data: citations} //Wrap citations in object
    var serialized = jQuery.param(data);//Serialize...
    setCookie("cites", serialized,120);//Add to cookies
    let newCitationListHTML = ""
    citations.forEach(element => {
        newCitationListHTML += `<li> ${element.citationHTML} </li>
`
    })
    $("#citationList").html(newCitationListHTML)

}

function resetCitationList() {
    $("#citationList").html('Looks like you don\'t have any citations made yet!')
    citations = []
}


function getMLADate(year, month, day) {
    let date = new Date(year, month - 1, day)
    return date.toLocaleDateString(
        "en-GB",
        dateFormat = {day: "numeric", month: "long", year: "numeric"}
    )
}

function loadCitationParamString(data){//Loads citation from jQuery.param function
    var data = deparam(data)["data"];//Reverse the serialization, returns an array of objects
    for(var i in data){//Convert each object to webcitation, push into citation
        citations.push(constructCitationFromObj(data[i]));
    }

    updateCitationList();//Update citation list to display loaded citations
}
//Load citations from cookies (if cookies exist)
if(getCookie("cites") != ""){
    loadCitationParamString(getCookie("cites"));
}

$(  // only start when DOM ready

    $("#submitButton").on("click", event => {
        event.preventDefault()
        // Handle dates
        let datePublished = getMLADate(
            htmlEscape($("#datePublishedYear").val()),
            htmlEscape($("#datePublishedMonth").val()) -1,
            htmlEscape($("#datePublishedDay").val())
        )
        let dateAccessed = getMLADate(
            htmlEscape($("#dateAccessedYear").val()),
            htmlEscape($("#dateAccessedMonth").val()) - 1,
            htmlEscape($("#dateAccessedDay").val())
        )
        citations.push(new WebCitation(
            htmlEscape($("#authorLast").val()),
            htmlEscape($("#authorFirst").val()),
            htmlEscape($("#pageTitle").val()),
            htmlEscape($("#siteTitle").val()),
            datePublished,
            dateAccessed,
            htmlEscape($("#manualCiteURL").val())
        ))

        updateCitationList()
    })
)
