window.onload = function() {


    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    let url_input = document.querySelector("#url-input")
    let submit_input = document.querySelector("#submit-input")
    let found_video_block = document.querySelector(".found-video-data")
    let found_video_title = document.querySelector("#video-title")
    let found_video_thumbnail = document.querySelector("#video-thumbnail")

    if ("current-form-value" in localStorage) {
        url_input.value = JSON.parse(localStorage.getItem("current-form-value"))
    }

    url_input.addEventListener("input", function(){
        if (url_input.value != "") {
            localStorage.setItem("current-form-value", JSON.stringify(url_input.value))
            $.ajax({
                url: get_video_metadata_url,
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify({
                    "current_url" : url_input.value
                }),
                success: function(response) {
                    found_video_title.style.color = "#FFFFFF"
                    if ("fail_message" in response) {
                        found_video_block.style.display = "none"
                        sleep(50).then(() => {
                            found_video_title.innerHTML = response["fail_message"]
                            found_video_thumbnail.removeAttribute("src")
                            found_video_block.style.display = "block"
                        });
                        submit_input.disabled = true
                    }
                    else {
                        found_video_block.style.display = "none"
                        sleep(30).then(() => {
                            found_video_title.innerHTML = response["video_title"]
                            found_video_thumbnail.src = response["thumbnail_url"]
                            found_video_block.style.display = "block"
                        });
                        submit_input.removeAttribute("disabled")
                    }
                },
                error: function(error) {
                    found_video_title.style.color = "#FF0000"
                    found_video_title.innerHTML = "Ошибка. Что-то пошло не так :("
                    found_video_thumbnail.removeAttribute("src")
                    submit_input.disabled = true
                }
            });
        }
        else {
            found_video_title.innerHTML = ""
            found_video_thumbnail.removeAttribute("src")
            submit_input.disabled = true
            localStorage.setItem("current-form-value", JSON.stringify(""))
        }
    });


};