var coll = document.getElementsByClassName("collapsible");
var i;

/* animated collapsible */
for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.maxHeight) {
            content.style.maxHeight = null;
        } else {
            content.style.maxHeight = content.scrollHeight + "px"
        }
    });
}

/* for website loading animation (using jQuery) */
// $(window).on("load", function() {
//     $(".loader-wrapper").fadeOut("slow");
// });
/* it no worky. Will try directly writing the script on the html file */
