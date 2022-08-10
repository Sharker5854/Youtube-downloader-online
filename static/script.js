window.onload = function() {

    const logo = document.querySelector("#logo")
    const url_input = document.querySelector("#url-input")
    const submit_input = document.querySelector("#submit-input")
    const found_video_block = document.querySelector(".found-video-data")
    const found_video_title = document.querySelector("#video-title")
    const found_video_thumbnail = document.querySelector("#video-thumbnail")
    const spinner_block = document.querySelector(".spinner-area")
    let last_found_video_title = NaN


    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    };

    function show_hide__install_process_spinner(option) {
        if (option == "show") {
            spinner_block.style.display = "block";
            found_video_block.style.display = "none";
        }
        else {
            spinner_block.style.display = "none";
            found_video_block.style.display = "block";
        }
    };

    function get_video_metadata_by_ajax() {
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
                            last_found_video_title = response["transliterated_title"]
                        });
                        submit_input.removeAttribute("disabled")
                    }
                },
                error: function(error) {
                    found_video_block.style.display = "none"
                    found_video_thumbnail.removeAttribute("src")
                    submit_input.disabled = true
                    sleep(30).then(() => {
                        found_video_title.style.color = "#FF0000"
                        found_video_title.innerHTML = "Ошибка. Что-то пошло не так :("
                        found_video_block.style.display = "block"
                    });
                }
            });
        }
        else {
            found_video_title.innerHTML = ""
            found_video_thumbnail.removeAttribute("src")
            submit_input.disabled = true
            localStorage.setItem("current-form-value", JSON.stringify(""))
        }
    };

    function install_video_by_ajax() {
        show_hide__install_process_spinner("show");
        $.ajax({
            url: install_video_url,
            type: "POST",
            async: true,
            contentType: "application/json; charset=utf-8",
            dataType: "binary",
            xhrFields: {
                "responseType" : "blob"
            },
            data: JSON.stringify({
                "video_url" : url_input.value
            }),
            success: function(blob_obj, status, xhr) {
                show_hide__install_process_spinner("hide");
                var link = document.createElement("a")
                link.href = window.URL.createObjectURL(blob_obj)
                link.download = last_found_video_title + "_YouTubeInstaller.mp4"
                link.click()
            },
            error: function(error) {
                show_hide__install_process_spinner("hide");
                found_video_block.style.display = "none"
                found_video_thumbnail.removeAttribute("src")
                sleep(30).then(() => {
                    found_video_title.style.color = "#FF0000"
                    found_video_title.innerHTML = "На сервере произошла ошибка. Пожалуйста попробуйте позже."
                    found_video_block.style.display = "block"
                });
            }
        });
    };


    if ("current-form-value" in localStorage) {
        url_input.value = JSON.parse(localStorage.getItem("current-form-value"))
    }
    if (url_input.value != "") {
        get_video_metadata_by_ajax();
    }


    url_input.addEventListener("input", get_video_metadata_by_ajax);
    $("#submit-input").on("click", install_video_by_ajax);
    
    logo.addEventListener("click", function() {
        localStorage.setItem("current-form-value", JSON.stringify(""))
        location.reload()
    });

};