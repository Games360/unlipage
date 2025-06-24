function loophalaman(totalEntries) {
    var output = "";
    var leftPageCount = parseInt(numshowpage / 2);
    
    // Ajustar el número de páginas a mostrar
    if (leftPageCount == numshowpage - leftPageCount) {
        numshowpage = 2 * leftPageCount + 1;
    }

    var startPage = nomerhal - leftPageCount;
    if (startPage < 1) startPage = 1;

    var maxPages = Math.ceil(totalEntries / postperpage);
    var endPage = startPage + numshowpage - 1;
    if (endPage > maxPages) endPage = maxPages;

    output += "<span class='showpageOf'>Page " + nomerhal + " of " + maxPages + "</span>";

    // Enlace a la página anterior
    if (nomerhal > 1) {
        var previousPage = nomerhal - 1;
        output += (nomerhal === 2) 
            ? (jenis === "page" ? `<span class="showpage"><a href="${home_page}">${upPageWord}</a></span>` 
                                : `<span class="showpageNum"><a href="/search/label/${lblname1}?&max-results=${postperpage}">${upPageWord}</a></span>`)
            : (jenis === "page" ? `<span class="showpageNum"><a href="#" onclick="redirectpage(${previousPage}); return false;">${upPageWord}</a></span>` 
                                : `<span class="showpageNum"><a href="#" onclick="redirectlabel(${previousPage}); return false;">${upPageWord}</a></span>`);
    }

    // Enlace a la primera página
    if (startPage > 1) {
        output += (jenis === "page") 
            ? `<span class="showpageNum"><a href="${home_page}">1</a></span>` 
            : `<span class="showpageNum"><a href="/search/label/${lblname1}?&max-results=${postperpage}">1</a></span>`;
    }

    // Generar enlaces de páginas intermedias
    for (var r = startPage; r <= endPage; r++) {
        output += (nomerhal === r) 
            ? `<span class="showpagePoint">${r}</span>` 
            : (r === 1) 
                ? (jenis === "page" ? `<span class="showpageNum"><a href="${home_page}">1</a></span>` 
                                    : `<span class="showpageNum"><a href="/search/label/${lblname1}?&max-results=${postperpage}">1</a></span>`)
                : (jenis === "page" ? `<span class="showpageNum"><a href="#" onclick="redirectpage(${r}); return false;">${r}</a></span>` 
                                    : `<span class="showpageNum"><a href="#" onclick="redirectlabel(${r}); return false;">${r}</a></span>`);
    }

    // Enlace a la última página
    if (endPage < maxPages) {
        output += (jenis === "page") 
            ? `<span class="showpageNum"><a href="#" onclick="redirectpage(${maxPages}); return false;">${maxPages}</a></span>` 
            : `<span class="showpageNum"><a href="#" onclick="redirectlabel(${maxPages}); return false;">${maxPages}</a></span>`;
    }

    // Enlace a la página siguiente
    var nextPage = parseInt(nomerhal) + 1;
    if (nomerhal < maxPages) {
        output += (jenis === "page") 
            ? `<span class="showpageNum"><a href="#" onclick="redirectpage(${nextPage}); return false;">${downPageWord}</a></span>` 
            : `<span class="showpageNum"><a href="#" onclick="redirectlabel(${nextPage}); return false;">${downPageWord}</a></span>`;
    }

    // Actualizar el contenido de la página
    var pageAreaElements = document.getElementsByName("pageArea");
    for (var i = 0; i < pageAreaElements.length; i++) {
        pageAreaElements[i].innerHTML = output;
    }

    // Actualizar el blog pager si existe
    var blogPager = document.getElementById("blog-pager");
    if (blogPager) {
        blogPager.innerHTML = output;
    }
}

function hitungtotaldata(data) {
    var feed = data.feed;
    var totalResults = parseInt(feed.openSearch$totalResults.$t, 10);
    loophalaman(totalResults);
}

function halamanblogger() {
    var activeUrl = urlactivepage;
    if (activeUrl.indexOf("/search/label/") !== -1) {
        lblname1 = activeUrl.indexOf("?updated-max") !== -1 
            ? activeUrl.substring(activeUrl.indexOf("/search/label/") + 14, activeUrl.indexOf("?updated-max")) 
            : activeUrl.substring(activeUrl.indexOf("/search/label/") + 14, activeUrl.indexOf("?&max"));
    }

    if (activeUrl.indexOf("?q=") === -1 && activeUrl.indexOf(".html") === -1) {
        if (activeUrl.indexOf("/search/label/") === -1) {
            jenis = "page";
            nomerhal = activeUrl.indexOf("#PageNo=") !== -1 
                ? activeUrl.substring(activeUrl.indexOf("#PageNo=") + 8) 
                : 1;
            loadScript(`${home_page}feeds/posts/summary?max-results=1&alt=json-in-script&callback=hitungtotaldata`);
        } else {
            jenis = "label";
            if (activeUrl.indexOf("&max-results=") === -1) {
                postperpage = 20;
            }
            nomerhal = activeUrl.indexOf("#PageNo=") !== -1 
                ? activeUrl.substring(activeUrl.indexOf("#PageNo=") + 8) 
                : 1;
            loadScript(`${home_page}feeds/posts/summary/-/${lblname1}?alt=json-in-script&callback=hitungtotaldata&max-results=1`);
        }
    }
}

function loadScript(src) {
    var head = document.getElementsByTagName("head")[0];
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = src;
    head.appendChild(script);
}

function redirectpage(pageNumber) {
    var jsonStart = (pageNumber - 1) * postperpage;
    nopage = pageNumber;
    loadScript(`${home_page}feeds/posts/summary?start-index=${jsonStart}&max-results=1&alt=json-in-script&callback=finddatepost`);
}

function redirectlabel(pageNumber) {
    var jsonStart = (pageNumber - 1) * postperpage;
    nopage = pageNumber;
    loadScript(`${home_page}feeds/posts/summary/-/${lblname1}?start-index=${jsonStart}&max-results=1&alt=json-in-script&callback=finddatepost`);
}

function finddatepost(data) {
    var post = data.feed.entry[0];
    var publishedDate = post.published.$t.substring(0, 19) + post.published.$t.substring(23, 29);
    var encodedDate = encodeURIComponent(publishedDate);
    var redirectUrl = (jenis === "page") 
        ? `/search?updated-max=${encodedDate}&max-results=${postperpage}#PageNo=${nopage}` 
        : `/search/label/${lblname1}?updated-max=${encodedDate}&max-results=${postperpage}#PageNo=${nopage}`;
    
    location.href = redirectUrl;
}

// Inicializar la paginación
var nopage, jenis, nomerhal, lblname1;
halamanblogger();
