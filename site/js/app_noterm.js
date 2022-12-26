var notif = new Notyf();


hljs.configure({languages:[]});
hljs.configure({languages: ['bash']});

hljs.initHighlightingOnLoad();


var docTitle='';

$(document).ready(function(){

   //labtitle
    $.ajax({
        url: "meta/metadata"
    }).then(function(data) {
	var jsonMeta = $.parseJSON(data);
	docTitle = jsonMeta.title;
	$('.header_labtitle').text(docTitle);
	document.title="IPP Labs - " + docTitle;
    });



   $('#labguide').load('lab.html', function() {
    const highlights = document.querySelectorAll("div.highlight-source-shell");
   
    $('#labguide a').each(function() {
        if ($(this).html().indexOf("%location.hostname%") >0) {
            $(this).html($(this).html().replace('%location.hostname%', location.hostname));
        }
        $(this).attr('target', '_blank');
        var alink = $(this).attr('href');
        if (alink.toLowerCase().indexOf("location.hostname") >0) {
            $(this).prop("href", alink.replace('location.hostname', location.hostname));
        }
    });
    $('#labguide code').each(function() {
        if ($(this).text().indexOf("%location.hostname%") >0) {
          $(this).text($(this).text().replaceAll('%location.hostname%', location.hostname));
        }
    });
    $('#labguide pre').each(function() { 
        if ($(this).html().indexOf("%location.hostname%") >0) {
            $(this).html($(this).html().replaceAll('%location.hostname%', location.hostname));
        }
    });


    if ($("#labguide").html().length == 0) {
	toggleLab();
    }

    highlights.forEach(div => {
	// create the copy button
	const copy = document.createElement("button")
	copy.innerHTML = "Run in terminal";
	// add the event listener to each click
	copy.addEventListener("click", handleCopyClick)
	// append the copy button to each code block
	div.append(copy)
    });



    // first, find all the div.code blocks
    document.querySelectorAll('div.highlight-source-shell pre').forEach(el => {
	// then highlight each
	hljs.highlightElement(el);
	//hljs.highlight(el, {language: 'bash'}).value
    });



    const headers = document.querySelectorAll('h1');
    const  menu = document.getElementsByClassName('sidebarMenuInner')[0];    
    headers.forEach(h1 => {
        const alink = h1.getElementsByTagName('a')[0];
	const li = document.createElement("li");
	li.innerHTML = '<a href="javascript:scrollLab(\'' + alink.id + '\')">' + h1.innerText + '</a>';
	menu.append(li);
    });


   });


});


scrollLab = function(chapter) {
    var container = $('#labguide');
    var scrollTo = $('#' + chapter);
    container.parent().animate({
	scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop()
    });

    $('#openSidebarMenu').click();
};










$('#pdf-link').click(function() {
    printDiv('labguide', docTitle);
});

function printDiv(divId, title) {
  let printWindow = window.open('', 'PRINT', 'height=650,width=900,top=100,left=150');
  printWindow.document.write(`<html><head><title>${title}</title>`);
  printWindow.document.write('</head><body >');
  printWindow.document.write(document.getElementById(divId).innerHTML);
  printWindow.document.write('</body></html>');
  printWindow.document.close(); // necessary for IE >= 10
  printWindow.focus(); // necessary for IE >= 10*/
  printWindow.print();
  printWindow.close();
}


$(".updater" ).dblclick(function() {
    //notif.success('Updating content...');
    $.ajax({
        url: "/utils/update"
    }).then(function(data) {
	notif.success('Content updated. Reloading...');

	$.ajax({
        url: window.location.href,
        headers: {
            "Pragma": "no-cache",
            "Expires": -1,
            "Cache-Control": "no-cache"
        }
    }).done(function () {
        window.location.reload(true);
    });
    });
});



