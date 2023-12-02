import React, { useRef, useEffect } from 'react';
import Quagga from 'quagga';

const BarcodeScanner = ({ onDetected, isScanning }) => {
    const scannerRef = useRef(null);

    useEffect(() => {
        if (isScanning) {
            Quagga.init({
                inputStream: {
                    type: "LiveStream",
                    target: scannerRef.current, // Pass the ref to the video element
                    constraints: {
                        facingMode: "environment" // Use the rear camera if available
                    }
                },
                locator: {
                    halfSample: false,
                    patchSize: "medium", // Kann auf 'small' gesetzt werden für mehr Genauigkeit
                },
                decoder: {
                    readers: ["code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader", "code_39_vin_reader", "codabar_reader", "upc_reader", "upc_e_reader", "i2of5_reader"]
                }
            }, (err) => {
                if (err) {
                    console.error(err);
                    return;
                }
                Quagga.start();
            });

            Quagga.onDetected(onDetected);
        }

        // Cleanup-Funktion
        return () => {
            Quagga.offDetected(onDetected);
            Quagga.stop();
        };
    }, [onDetected, isScanning]); // Tippfehler korrigiert

    return <div ref={scannerRef} />;
};

export default BarcodeScanner;
