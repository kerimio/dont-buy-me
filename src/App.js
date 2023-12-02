import React, { useState, useEffect } from 'react';
import './App.css';
import BarcodeScanner from './Components/BarcodeScanner.js';

function App() {
    const [lastDetectedBarcode, setLastDetectedBarcode] = useState(null);
    const [matchResult, setMatchResult] = useState(null);
    const brandList = [
      "Coca-Cola",
      "Freeway",
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
      const interval = setInterval(() => {
          if (lastDetectedBarcode) {
              setMatchResult(null); // Löschen des vorherigen Ergebnisses vor dem neuen Request
              fetchAndLogProductInfo(lastDetectedBarcode);
              setLastDetectedBarcode(null);
          }
      }, 10000); // 10000 Millisekunden = 10 Sekunden
  
      return () => clearInterval(interval); // Bereinigen des Intervalls beim Unmount
  }, [lastDetectedBarcode]);

    const handleDetected = (result) => {
        if (result && result.codeResult) {
            setLastDetectedBarcode(result.codeResult.code);
        }
    };

    const checkBrandMatch = (vendorName) => {
        const isMatch = brandList.some(brand => 
            vendorName.toLowerCase().includes(brand.toLowerCase().split(" ")[0])
        );
        setMatchResult(isMatch ? "yes" : "no");
    };

    const fetchAndLogProductInfo = async (barcode) => {
        const productInfo = await fetchProductInfo(barcode);
        if (productInfo && productInfo.error === '0') {
            console.log(`Produkt: ${productInfo.name}, Hersteller: ${productInfo.vendor}`);
            checkBrandMatch(productInfo.vendor);
        } else {
            console.log("Produktinformationen nicht gefunden oder Fehler: ", productInfo.error);
        }
    };

    const fetchProductInfo = async (barcode) => {
        const userId = '400000000';
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
          <BarcodeScanner onDetected={handleDetected} />
          {matchResult && (
              <div className={`match-result ${matchResult}`}>
                  {matchResult.toUpperCase()}
              </div>
          )}
      </div>
  );
  
}

export default App;
