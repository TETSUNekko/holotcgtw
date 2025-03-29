// DeckBuilder.jsx
import React, { useState, useRef } from "react";
import cardList from "../cardList_hBP01.json";
import energyCardList from "../cardList_hY.json";
import { ZoomIn } from "lucide-react";
import SearchBar from "./SearchBar";

const CardImage = ({ card, version, className, style, onZoom, onClick }) => {
  const basePath = import.meta.env.BASE_URL || "/";
  const imgSrc = `${basePath}cards/${card.imageFolder}${card.id}${version}`;

  return (
    <div className={`relative ${className}`} onClick={onClick} style={style}>
      <img
        src={imgSrc}
        alt={card.id}
        className="w-full h-full object-contain"
      />
      <button
        className="absolute top-0 left-0 p-0.5 text-white bg-black bg-opacity-50 hover:bg-opacity-80 text-xs"
        onClick={(e) => {
          e.stopPropagation();
          onZoom(imgSrc, card);
        }}
      >
        <ZoomIn size={10} />
      </button>
    </div>
  );
};

function DeckBuilder({ playerName }) {
  const [zoomImageUrl, setZoomImageUrl] = useState("");
  const [zoomCard, setZoomCard] = useState(null);
  const [oshiCard, setOshiCard] = useState(null);
  const [deckCards, setDeckCards] = useState([]);
  const [energyCards, setEnergyCards] = useState([]);
  const [shareCode, setShareCode] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("全部");
  const [filterColor, setFilterColor] = useState("全部顏色");
  const [filterGrade, setFilterGrade] = useState("全部階級");
  const [filterSeries, setFilterSeries] = useState("全部彈數");
  const [supportSubtype, setSupportSubtype] = useState("全部");

  const deckRef = useRef();
  const allCards = [...cardList, ...energyCardList];

  const filteredCards = allCards.filter((card) => {
    const isEnergyCard = card.imageFolder.includes("energy") || card.type === "Energy";
    const matchType =
      filterType === "全部" ||
      card.type === filterType ||
      (filterType === "Energy" && isEnergyCard);

    const matchSearch =
      card.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (card.name && card.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (card.searchKeywords &&
        card.searchKeywords.some((keyword) =>
          keyword.toLowerCase().includes(searchTerm.toLowerCase())
        ));

    const colorMatch = filterColor === "全部顏色" || card.color === filterColor;
    const gradeMatch = filterGrade === "全部階級" || card.grade === filterGrade;
    const seriesMatch = filterSeries === "全部彈數" || card.series === filterSeries;
    const subtypeMatch =
      supportSubtype === "全部" ||
      (card.searchKeywords && card.searchKeywords.includes(supportSubtype));

    return matchType && matchSearch && colorMatch && gradeMatch && seriesMatch && subtypeMatch;
  });

  const handleAddCard = (card, version) => {
    if (card.type === "Oshi") {
      setOshiCard((prev) =>
        prev && prev.id === card.id && prev.version === version ? null : { ...card, version }
      );
    } else if (card.type === "Energy") {
      setEnergyCards((prev) => [...prev, { ...card, version }]);
    } else {
      setDeckCards((prev) => [...prev, { ...card, version }]);
    }
  };

  const handleRemoveDeckCard = (index) => {
    setDeckCards((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveEnergyCard = (index) => {
    setEnergyCards((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExportCode = async () => {
    const payload = {
      oshi: oshiCard,
      deck: deckCards,
      energy: energyCards
    };
    const code = Array.from({ length: 6 }, () =>
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".charAt(Math.floor(Math.random() * 36))
    ).join("");

    try {
      await fetch("http://localhost:3001/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, payload })
      });
      setShareCode(code);
      return code;
    } catch (e) {
      alert("❌ 無法儲存代碼");
      return null;
    }
  };

  const handleImportCode = async () => {
    try {
      const res = await fetch(`http://localhost:3001/load/${shareCode}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOshiCard(data.oshi);
      setDeckCards(data.deck);
      setEnergyCards(data.energy);
      alert("✅ 成功讀取代碼");
    } catch {
      alert("❌ 無法讀取該代碼");
    }
  };

  const handleExportImage = () => {
    const grouped = {};
    [...(oshiCard ? [oshiCard] : []), ...deckCards, ...energyCards].forEach((card) => {
      const key = `${card.id}${card.version}`;
      grouped[key] = grouped[key] || { ...card, count: 0 };
      grouped[key].count += 1;
    });

    const html = `<!DOCTYPE html><html><head><title>我的牌組</title><style>
      body { font-family: sans-serif; padding: 20px; background: #f9f9f9; }
      h1 { margin-bottom: 12px; }
      .grid { display: flex; flex-wrap: wrap; gap: 10px; }
      .card { position: relative; width: 84px; height: 126px; }
      .card img { width: 100%; height: 100%; object-fit: contain; }
      .count {
        position: absolute;
        bottom: 2px;
        right: 4px;
        background: white;
        color: red;
        font-weight: bold;
        font-size: 16px;
        padding: 2px 6px;
        border-radius: 50%;
      }
    </style></head><body>
    <h1>我的牌組</h1><div class="grid">
    ${Object.values(grouped).map((c) => `
      <div class="card">
        <img src="cards/${c.imageFolder}${c.id}${c.version}" alt="${c.id}" />
        <div class="count">${c.count}</div>
      </div>
    `).join("")}
    </div></body></html>`;

    const w = window.open();
    w.document.write(html);
    w.document.close();
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-blue-50">
      <SearchBar
        playerName={playerName}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        filterColor={filterColor}
        setFilterColor={setFilterColor}
        filterGrade={filterGrade}
        setFilterGrade={setFilterGrade}
        filterSeries={filterSeries}
        setFilterSeries={setFilterSeries}
        supportSubtype={supportSubtype}
        setSupportSubtype={setSupportSubtype}
        shareCode={shareCode}
        setShareCode={setShareCode}
        onExportImage={handleExportImage}
        onExportCode={handleExportCode}
        onImportCode={handleImportCode}
      />
      <div className="flex flex-1"> ... </div>
    </div>
  );
}

export default DeckBuilder;
