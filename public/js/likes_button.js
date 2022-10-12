$(document).ready(function() {
    var is_liked = document.getElementById('is_liked').value;
    var unlike_btn = document.getElementById("unlike");
    var like_btn = document.getElementById("like");
    console.log("is_liked == false: ", is_liked == "false");
    console.log(document.getElementById('imgId').value);

    // show like or unlike button
    if (is_liked == "true")
        like_btn.style.display = "block";
    else
        unlike_btn.style.display = "block";

    $("#unlike, #like").click(function() {
        var $this = $(this);
        // ref: https://api.jquery.com/data/
        // var c = $this.data("count"); // internal variable
        // var id = this.id;
        // console.log(this.id);
        // $this.data("count", c);  // update internal variable
        var is_liked = document.getElementById('is_liked').value;
        var c = document.getElementById('count').value;
        console.log("original count:", c);

        // flip is_liked
        is_liked = (is_liked == "true") ? "false" : "true";

        // // toggle like & unlike button
        // if (is_liked == "false") {
        //     c--;
        //     unlike_btn.style.display = "block"; // like -> unlike
        //     like_btn.style.display = "none";
        // } else {
        //     c++;
        //     unlike_btn.style.display = "none"; // unlike -> like
        //     like_btn.style.display = "block";
        // }
        // $('#like_count').html(c); // update display
        // document.getElementById('count').value = c; // update value
        // document.getElementById('is_liked').value = is_liked; // update like state

        // POST like state
        // ref: https://www.w3schools.com/jquery/jquery_ajax_get_post.asp
        $.post("/image/data/likes", {
            id: document.getElementById('imgId').value,
            like_action: is_liked
        }, function(data, status) {
            console.log("login:", data);
            if (data == "false")
                alert("Please login first.");
            else {
                // toggle like & unlike button
                if (is_liked == "false") {
                    c--;
                    unlike_btn.style.display = "block"; // like -> unlike
                    like_btn.style.display = "none";
                } else {
                    c++;
                    unlike_btn.style.display = "none"; // unlike -> like
                    like_btn.style.display = "block";
                }

                $('#like_count').html(c); // update display
                document.getElementById('count').value = c; // update value
                document.getElementById('is_liked').value = is_liked; // update like state
            }
        });

    });
    $(document).delegate('*[data-toggle="lightbox"]', "click", function(event) {
        event.preventDefault();
        $(this).ekkoLightbox();
    });
});