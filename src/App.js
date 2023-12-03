import React, { useState, useEffect } from 'react';
import './App.css';
import BarcodeScanner from './Components/BarcodeScanner.js';

function App() {
    const [lastDetectedBarcode, setLastDetectedBarcode] = useState(null);
    const [matchResult, setMatchResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(true);
    const [barcodeCounts, setBarcodeCounts] = useState({});
    const [mostFrequentBarcode, setMostFrequentBarcode] = useState(null);
    const [scannedBarcodes, setScannedBarcodes] = useState([]);
    const [productName, setProductName] = useState(''); // Zustandsvariable für den Produktnamen
    const [vendorName, setVendorName] = useState(''); // Zustandsvariable für den Herstellernamen



    const scanThreshold = 4; // Mindestanzahl von Scans für einen Barcode
    const scanBufferTime = 10000; // Zeit in Millisekunden, um Scans zu speichern (10 Sekunden)

    const brandList = [
      "Coca-Cola",
      "Coffee Mate",
      "Fanta",
      "Lipton",
      "Mountain Dew",
      "Nestle Pure Life",
      "Nescafe",
      "Pepsi",
      "7up",
      "Starbucks",
      "SodaStream",
      "Schweppes",
      "Sprite",
      "Tropicana",
      "Unilever",
      "Burger King",
      "Carrefour",
      "Cheetos",
      "Calve",
      "Danone",
      "Doritos",
      "Dominos",
      "Hellman's",
      "Knorr",
      "KFC",
      "KitKat",
      "Lay's",
      "McDonald's",
      "Mondelez",
      "Nestle",
      "Nesquik",
      "Popeyes",
      "Pizza Hut",
      "Papa John's",
      "Perrier",
      "Procter & Gamble",
      "Nestle",
      "Nescafe"

    ];

    useEffect(() => {
        if (mostFrequentBarcode) {
            setMatchResult(null); // Löschen des vorherigen Ergebnisses
            fetchAndLogProductInfo(mostFrequentBarcode);
            setTimeout(() => {
                setMostFrequentBarcode(null); // Barcode zurücksetzen
                setIsScanning(true); // Scannen wieder aufnehmen
            }, 5000); // 5 Sekunden Verzögerung
        }
    }, [mostFrequentBarcode]);

    const handleDetected = (result) => {
        if (result && result.codeResult) {
            const barcode = result.codeResult.code;

            setScannedBarcodes(prevBarcodes => [...prevBarcodes, barcode]);

            if (isValidEAN(barcode)) {
                setBarcodeCounts(prevCounts => {
                    const newCounts = { ...prevCounts, [barcode]: (prevCounts[barcode] || 0) + 1 };
                    if (newCounts[barcode] === scanThreshold) {
                        setMostFrequentBarcode(barcode);
                    }
                    return newCounts;
                });
            }
        }
    };

const isValidEAN = (barcode) => {
    // EAN-13 sollte 13 Zeichen lang sein, EAN-8 sollte 8 Zeichen lang sein
    if (barcode.length !== 13 && barcode.length !== 8) {
        return false;
    }

    const calculateCheckDigit = (ean) => {
        const len = ean.length;
        let sum = 0;
        for (let i = 0; i < len - 1; i++) {
            const digit = parseInt(ean.charAt(i));
            sum += (len % 2 === i % 2) ? digit * 3 : digit;
        }
        return (10 - (sum % 10)) % 10;
    };

    // Prüfen, ob die letzte Ziffer mit der berechneten Prüfziffer übereinstimmt
    return parseInt(barcode.charAt(barcode.length - 1)) === calculateCheckDigit(barcode);
};


const checkBrandMatch = (vendorName, productName) => {
    const isMatch = brandList.some(brand => 
        vendorName.toLowerCase().includes(brand.toLowerCase().split(" ")[0])
    );
    if (isMatch) {
        setMatchResult("unterstützt");
        setProductName(productName); // Setzen des Produktnamens aus der API-Antwort
    } else {
        setMatchResult("keine daten gefunden");
        setProductName(productName); // Produktname setzen, auch wenn er nicht in der Liste ist
    }
};

const fetchAndLogProductInfo = async (barcode) => {
    if (!isValidEAN(barcode)) {
        console.log("Ungültiger EAN-Code:", barcode);
        setIsLoading(false);
        return;
    }
    
    setIsLoading(true); // Starten des Ladevorgangs vor der API-Abfrage
    const productInfo = await fetchProductInfo(barcode);
    
    // Prüfen, ob das Produkt erfolgreich abgerufen wurde
    if (productInfo && productInfo.error === '0') {
        console.log(`Produkt: ${productInfo.name}, Hersteller: ${productInfo.vendor}`);
        checkBrandMatch(productInfo.vendor, productInfo.name);
        setProductName(productInfo.name); // Setzen des Produktnamens
        setVendorName(productInfo.vendor); // Setzen des Herstellernamens
    } else {
        console.log("Produktinformationen nicht gefunden oder Fehler: ", productInfo.error);
        setProductName(''); // Löschen des Produktnamens, falls kein Produkt gefunden wurde
        setVendorName(''); // Löschen des Herstellernamens
    }
    
    setIsLoading(false); // Beenden des Ladevorgangs
};

    
    const fetchProductInfo = async (barcode) => {
        const userId = '400000000';
        //const apiUrl = `http://opengtindb.org/?ean=${barcode}&cmd=query&queryid=${userId}`;
       const apiUrl = `/api/?ean=${barcode}&cmd=query&queryid=${userId}`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Netzwerkantwort war nicht ok');
            }
            const text = await response.text();
            return parseProductInfo(text);
        } catch (error) {
            console.error("Fehler bei der Abfrage der API: ", error);
            return null;
        }
    };

    const parseProductInfo = (textData) => {
        const dataLines = textData.split('\n');
        const data = {};
        dataLines.forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                data[key.trim()] = value.trim();
            }
        });
        return data;
    };

    return (
        <div className="App">
            <h1>Kamera-Ansicht</h1>
            <BarcodeScanner onDetected={handleDetected} isScanning={isScanning} />

            {isLoading && <div className="loading">Lädt...</div>}
            {matchResult && !isLoading && (
    <div className={`match-result ${matchResult === "unterstützt" ? "supported" : "not-found"}`}>
        {matchResult.toUpperCase()} {productName && `: ${productName}`} {vendorName && `von ${vendorName}`}
    </div>
)}
    
            <div className="scanned-barcodes">
                <h2>Gescannte Barcodes:</h2>
                <ul>
                    {scannedBarcodes.map((barcode, index) => (
                        <li key={index}>{barcode}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default App;
