import tempfile
import io
from colorama import Back
from flask import Flask
from flask import request, render_template, url_for, jsonify, send_file
from pytube import YouTube
from pytube.exceptions import RegexMatchError, VideoUnavailable
import iuliia


app = Flask(__name__)


@app.route("/", methods=["GET"])
def index():
    return render_template(
        "index.html", 
        get_video_metadata_url=url_for("get_video_metadata"),
        install_video_url=url_for("install_video")
    )


@app.route("/validate-link/", methods=["POST"])
def get_video_metadata():
    try:
        pytube_obj = YouTube(url=request.json["current_url"])
    except RegexMatchError:
        return jsonify({"fail_message" : "Ссылка на YouTube-видео указана неверно!"})
    else:
        try:
            return jsonify({
                "video_title" : pytube_obj.title,
                "transliterated_title" : iuliia.translate(pytube_obj.title, iuliia.TELEGRAM),
                "thumbnail_url" : pytube_obj.thumbnail_url,
            })
        except VideoUnavailable: # user can pass url for another site, so pytube won't raise RegexMatchError or smth else, it just won't be able to get video's metadata
            return jsonify({"fail_message" : "Ссылка на YouTube-видео указана неверно!"})


@app.route("/install/", methods=["POST"])
def install_video():
    try:
        yt = YouTube(url=request.json["video_url"])
        stream_obj = yt.streams.get_by_itag(22) # 720p / 30fps by default

        with tempfile.NamedTemporaryFile(mode="w+b", prefix="yt_", suffix="_video", dir="video_tempfiles/") as temp:
            video_binary_buffer = io.BytesIO()
            stream_obj.stream_to_buffer(video_binary_buffer)
            video_binary_buffer.seek(0)
            temp.write(video_binary_buffer.getvalue()) # method .getvalue() returns 'bytes-like' object instead of '_ioBytes' obj
            temp.seek(0)

            return send_file(
                temp.name, as_attachment=True
            )
    except Exception as exc:
        print(Back.RED + f"Server Error: {exc}")


if __name__ == "__main__":
    app.run(port=8000)