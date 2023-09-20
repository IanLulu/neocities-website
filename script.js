var coll = document.getElementsByClassName("collapsible");
var nacoll = document.getElementsByClassName("nacollapsible")
var i;

/* for simple collapsible (no animation) */
for (i = 0; i < nacoll.length; i++) {
    coll[i].addEventListener("click", function() { // anonymous function o.o its embarrassing i dunno how these work. i need to learn
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.display === "block") { // "===" is a strict equality comparison operator in JavaScript...
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
    });
}

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