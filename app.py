from flask import Flask
from flask import request, render_template, url_for, jsonify
from pytube import YouTube
from pytube.exceptions import RegexMatchError, VideoUnavailable


app = Flask(__name__)


@app.route("/", methods=["GET"])
def index():
    return render_template("index.html", get_video_metadata_url=url_for("get_video_metadata"))

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
                "thumbnail_url" : pytube_obj.thumbnail_url
            })
        except VideoUnavailable: # user can pass url for another site, so pytube won't raise RegexMatchError or smth else, it just won't be able to get video's metadata
            return jsonify({"fail_message" : "Ссылка на YouTube-видео указана неверно!"})

@app.route("/install/", methods=["POST"])
def install_video():
    return "INSTALLING..."


if __name__ == "__main__":
    app.run(debug=True, port=8000)