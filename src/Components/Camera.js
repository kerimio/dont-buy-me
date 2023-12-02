import React, { useRef, useEffect } from 'react';

const Camera = () => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const constraints = {
                video: true
            };

            navigator.mediaDevices.getUserMedia(constraints)
                .then((stream) => {
                    let video = videoRef.current;
                    video.srcObject = stream;
                    video.play();
                })
                .catch((err) => {
                    console.error("Fehler beim Zugriff auf die Kamera: ", err);
                });
        }
    }, []);

    return <video ref={videoRef} />;
};

export default Camera;
