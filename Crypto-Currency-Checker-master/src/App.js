import React, { useState } from "react";
import "./App.css";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend);

const API_KEY = "CG-7rKoq5DragSinV2tEC75cZT9";

function App() {
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("");
  const [historyData, setHistoryData] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [selectedCoin, setSelectedCoin] = useState("");

  const fetchPrice = async (coinId) => {
    setStatus("loading");
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&x_cg_demo_api_key=${API_KEY}`
      );
      const data = await res.json();
      if (data[coinId]) {
        setPrice(`✅ 1 ${coinId.toUpperCase()} = $${data[coinId].usd}`);
        setStatus("success");
      } else {
        setPrice("⚠ Price not available.");
        setStatus("error");
      }
    } catch {
      setPrice("⚠ Error fetching data.");
      setStatus("error");
    }
  };

  const fetchHistoricalData = async (coinId) => {
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=30&x_cg_demo_api_key=${API_KEY}`
      );
      const data = await res.json();
      const prices = data.prices.map((p) => p[1]);
      const labels = data.prices.map((p) =>
        new Date(p[0]).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      );

      // Chart data for 30-day history
      setHistoryData({
        labels,
        datasets: [
          {
            label: `${coinId.toUpperCase()} Price (Past 30 Days)`,
            data: prices,
            borderColor: "#1e3c72",
            backgroundColor: "rgba(30,60,114,0.2)",
            fill: true,
            tension: 0.3,
          },
        ],
      });

      // Simple prediction (next 5 days)
      const lastPrices = prices.slice(-5);
      const avgGrowth =
        lastPrices.reduce((acc, val, i, arr) => {
          if (i === 0) return acc;
          acc += (val - arr[i - 1]) / arr[i - 1];
          return acc;
        }, 0) / (lastPrices.length - 1);

      let futurePrices = [];
      let lastPrice = prices[prices.length - 1];
      for (let i = 1; i <= 5; i++) {
        lastPrice = lastPrice * (1 + avgGrowth);
        futurePrices.push(lastPrice);
      }

      setPredictionData({
        labels: ["Day +1", "Day +2", "Day +3", "Day +4", "Day +5"],
        datasets: [
          {
            label: `${coinId.toUpperCase()} Predicted (Next 5 Days)`,
            data: futurePrices,
            borderColor: "#2a5298",
            backgroundColor: "rgba(42,82,152,0.2)",
            fill: true,
            tension: 0.3,
            borderDash: [5, 5],
          },
        ],
      });
    } catch (err) {
      console.error("Error fetching historical data:", err);
    }
  };

  const handleCoinSelect = (coinId) => {
    setSelectedCoin(coinId);
    fetchPrice(coinId);
    fetchHistoricalData(coinId);
  };

  const topCryptos = [
    { id: "bitcoin", symbol: "BTC", img: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png" },
    { id: "ethereum", symbol: "ETH", img: "https://assets.coingecko.com/coins/images/279/large/ethereum.png" },
    { id: "dogecoin", symbol: "DOGE", img: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png" },
    { id: "cardano", symbol: "ADA", img: "https://assets.coingecko.com/coins/images/975/large/cardano.png" },
  ];

  return (
    <div className="App">
      <div className="container">
        <h2>💰 Crypto Price Checker</h2>
        <p>Choose a cryptocurrency or enter a symbol manually.</p>

        <label>Select Cryptocurrency:</label>
        <select onChange={(e) => handleCoinSelect(e.target.value)}>
          <option value="">-- Select --</option>
          <option value="bitcoin">Bitcoin (BTC)</option>
          <option value="ethereum">Ethereum (ETH)</option>
          <option value="dogecoin">Dogecoin (DOGE)</option>
          <option value="cardano">Cardano (ADA)</option>
          <option value="polkadot">Polkadot (DOT)</option>
          <option value="solana">Solana (SOL)</option>
          <option value="ripple">XRP</option>
          <option value="litecoin">Litecoin (LTC)</option>
          <option value="binancecoin">Binance Coin (BNB)</option>
          <option value="polygon">Polygon (MATIC)</option>
        </select>

        <div className={`output-box ${status}`}>{price}</div>

        <h3>🔥 Top Cryptocurrencies</h3>
        <div className="top-cryptos">
          {topCryptos.map((coin) => (
            <div key={coin.id} className="crypto-card" onClick={() => handleCoinSelect(coin.id)}>
              <img src={coin.img} alt={coin.symbol} />
              <p>{coin.symbol}</p>
            </div>
          ))}
        </div>
      </div>

      {historyData && predictionData && (
        <div className="details">
          <div className="left">
            <h3>📉 Historical Data (30 Days)</h3>
            <Line data={historyData} />
          </div>
          <div className="right">
            <h3>📈 Future Prediction (Next 5 Days)</h3>
            <Line data={predictionData} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
