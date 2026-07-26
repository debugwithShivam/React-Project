window.addEventListener("DOMContentLoaded", () => {

    function watch() {

        const video = document.querySelector("video");

        if (!video) {
            setTimeout(watch, 1000);
            return;
        }

        video.addEventListener("play", () => {
            console.log("Playing");
        });

        video.addEventListener("pause", () => {
            console.log("Paused");
        });

    }

    watch();

});