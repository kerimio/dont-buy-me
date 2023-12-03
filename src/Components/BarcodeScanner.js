import React, { useRef, useEffect } from 'react';
import Quagga from 'quagga'; // Angenommen, Sie verwenden QuaggaJS

const BarcodeScanner = ({ onDetected }) => {
    const scannerRef = useRef(null);

    useEffect(() => {
        Quagga.init({
            inputStream: {
                type: "LiveStream",
                target: scannerRef.current, // Referenz auf das Videoelement
                constraints: {
                    facingMode: "environment" // Verwenden Sie die Rückkamera, falls verfügbar
                }
            },
            locator: {
                patchSize: "medium",
                halfSample: true,
            },
            numOfWorkers: 2,
            decoder: {
                readers: ["code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader", "code_39_vin_reader", "codabar_reader", "upc_reader", "upc_e_reader", "i2of5_reader"]
            },
            locate: true, // Schaltet die Lokalisierung ein, um visuelles Feedback zu ermöglichen
        }, (err) => {
            if (err) {
                console.error(err);
                return;
            }
            Quagga.start();
        });

        // Event-Listener für erkannte Barcodes
        Quagga.onDetected(onDetected);

        // Visualisiert den Scan-Bereich
        Quagga.onProcessed((result) => {
            var drawingCtx = Quagga.canvas.ctx.overlay,
                drawingCanvas = Quagga.canvas.dom.overlay;

            if (result) {
                if (result.boxes) {
                    drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
                    result.boxes.filter(function (box) {
                        return box !== result.box;
                    }).forEach(function (box) {
                        Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: "green", lineWidth: 2 });
                    });
                }

                if (result.box) {
                    Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: "blue", lineWidth: 2 });
                }

                if (result.codeResult && result.codeResult.code) {
                    Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 3 });
                }
            }
        });

        return () => {
            Quagga.offDetected(onDetected);
            Quagga.stop();
        };
    }, [onDetected]);

    return <div ref={scannerRef} />;
};

export default BarcodeScanner;
