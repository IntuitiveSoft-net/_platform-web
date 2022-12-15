var split = Split(['#left', '#right']);
var notif = new Notyf();


hljs.configure({languages:[]});
hljs.configure({languages: ['bash']});

hljs.initHighlightingOnLoad();


var docTitle='';

$(document).ready(function(){

    addTerminal();
   //labtitle
    $.ajax({
        url: "meta/metadata"
    }).then(function(data) {
	var jsonMeta = $.parseJSON(data);
	docTitle = jsonMeta.title;
	$('.header_labtitle').text(docTitle);
	document.title="Cisco ET&I Labs - " + docTitle;
    });



    //labguide hide button
    $("div.gutter-horizontal").html('<a href="javascript:toggleLab()"><div id="hidelab" class="open"/></a>');
    $("div.gutter-horizontal" ).dblclick(function() {
	toggleLab();
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

    var height = $(window).height()-60;
    $('.split').css('height', height);

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





const copyToClipboard = str => {
  const el = document.createElement("textarea") // Create a <textarea> element
  el.value = str // Set its value to the string that you want copied
  el.setAttribute("readonly", "") // Make it readonly to be tamper-proof
  el.style.position = "absolute"
  el.style.left = "-9999px" // Move outside the screen to make it invisible
  document.body.appendChild(el) // Append the <textarea> element to the HTML document
  const selected =
    document.getSelection().rangeCount > 0 // Check if there is any content selected previously
      ? document.getSelection().getRangeAt(0) // Store selection if found
      : false // Mark as false to know no selection existed before
  el.select() // Select the <textarea> content
  document.execCommand("copy") // Copy - only works as a result of a user action (e.g. click events)
  document.body.removeChild(el) // Remove the <textarea> element
  if (selected) {
    // If a selection existed before copying
    document.getSelection().removeAllRanges() // Unselect everything on the HTML document
    document.getSelection().addRange(selected) // Restore the original selection
  }
};

function handleCopyClick(evt) {
  evt.target.classList.add("task_done");
  const txt = evt.target.innerHTML;
  if (!txt.includes("<i")) {
    evt.target.innerHTML=txt + ' <i class="fa-solid fa-check"></i>';
  }
  const { children } = evt.target.parentElement;
  const { innerText } = Array.from(children)[0]
  //copyToClipboard(innerText)

  var terminal = getCurrentTerminal();

  terminal.paste(innerText);
  $('#' + currentTerminalId).find('textarea.xterm-helper-textarea')[0].dispatchEvent(new KeyboardEvent('keypress', {charCode: 13}));
  //$("xterm-helper-textarea").dispatchEvent(new KeyboardEvent('keypress', {charCode: 13}))

};


scrollLab = function(chapter) {
    var container = $('#labguide');
    var scrollTo = $('#' + chapter);
    container.parent().animate({
	scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop()
    });

    $('#openSidebarMenu').click();
};

toggleLab = function() {
    var button = $('#hidelab');
    if (button.hasClass('open')) {
	button.removeClass('open');
	button.addClass('closed');
//	split.setSizes([0, 100]);
	$('#left').width("calc(0%)");
	$('#right').width("calc(100%)");
	$('.header_menu').hide();
    } else {
	button.removeClass('closed');
	button.addClass('open');
	split.setSizes([50, 50]);
	$('.header_menu').show();
    }
    resizeLater(1000);
//    forceResize();
};


$('.gutter-horizontal').mouseup(function() {
    var button = $('#hidelab');
    if ($('#left').width() > 0 ) {
	button.removeClass('closed');
	button.addClass('open');
    } else {
	button.removeClass('open');
	button.addClass('closed');
    }
    resizeLater(1000);

//    forceResize();    
});

const timer = ms => new Promise(res => setTimeout(res, ms));
async function wait(milisec) {
  await timer(milisec);
}

async function addTerminal() {
    const currentTerminalsCount = terminals.length;
    var newid = Math.random().toString(36).slice(-3) + Date.now();
    var newli = '';
    if (currentTerminalsCount == 0) {
	newli = '<li><a href="#' + newid + '"><span>Terminal ' + (terminals.length+1) + '</span></a></li>';
    } else {
	newli = '<li><a href="#' + newid + '"><button class="close closeTab" type="button" >×</button><span>Terminal ' + (terminals.length+1) + '</span></a></li>';    
    }
    var newcontainer = '<div class="tab-pane" id="' + newid + '"></div>';
    $(newli).insertBefore("#add_elem");
    $('.tab-content').append(newcontainer);

    createNewTerminal(new TTerminal().renderNew(newid), document.getElementById(newid));
    currentTerminalId = newid;
    showTab(newid);
    registerCloseEvent();

    while (terminals.length == currentTerminalsCount) {
	await wait(1000);
    }
    forceResize();
}



forceResize = function() {
    let height = document.body.clientHeight-95;
    let num = 15;
    if (window.navigator.userAgent.toLowerCase().indexOf("firefox")>-1) {
	num = 16;
    }
    let rows = parseInt(height/num, 10);
    var term = getCurrentTerminal();
    term.fit();
    term.resize(term.cols+3, rows);

}

$( "#add_terminal" ).click(function() {
    addTerminal();
});


removeTerminalFromArray = function(terminalId) {
  for (var i = 0; i < terminals.length; i++) {
    if (terminals[i].containerId == terminalId) {
	terminals.splice(i,1);
    }
  }
};

getTerminal = function(terminalId) {
  for (let terminal of terminals) {
    if (terminal.containerId == terminalId) {
      return terminal;
    }
  }
};

getCurrentTerminal = function() {
  return getTerminal(currentTerminalId);
};

selectTerminal = function() {
    var terminal = getCurrentTerminal();
    terminal.focus();
    forceResize();
}

removeTerminal = function(terminalId) {
  var terminal = getTerminal(terminalId);
  try {
    terminal.close();
  } catch (error) {
  }
  removeTerminalFromArray(terminalId);
  $('.nav-tabs li a span').each(function(i, obj) {
    obj.innerText = 'Terminal ' + (i+1);
  });


};


async function resizeLater(milisec) {
    await wait(milisec);
    forceResize();
}



window.onresize = function(event) {
    var height = $(window).height();
    $('.split').css('height', height);
    resizeLater(1000);
};



$('#upload-link').click(function() {
    upload();
});

async function uploadFile(uploadFile) {
    let startNotif = notif.success({ message: 'Please wait, uploading file...', dismissible: true, duration: 0 });

    let formData = new FormData();           
    formData.append("file", uploadFile);
    await fetch('/utils/upload', {
        method: "POST", 
        body: formData
    });
    notif.dismiss(startNotif);
    notif.success("File uploaded to $HOME/files");

//    alert('File uploaded');
};




function upload() {
//    console.log($("#uploadFile"));
//    $("#uploadFile").trigger('click');
    let input = document.createElement('input');
    input.type = 'file';
    input.onchange = _this => {
        let files =   Array.from(input.files);
	uploadFile(files[0]);              
    };
    input.click();
}




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



