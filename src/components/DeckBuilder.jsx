// DeckBuilder.jsx
import React, { useState, useRef } from "react";
import cardList from "../cardList_hBP01.json";
import energyCardList from "../cardList_hY.json";
import { ZoomIn } from "lucide-react";
import SearchBar from "./SearchBar";

const CardImage = ({ card, version, className, style, onZoom, onClick }) => {
  const basePath = import.meta.env.BASE_URL || "/";
  const imgSrc = `${basePath}${card.imageFolder}${card.id}${version}`;


  return (
    <div className={`relative ${className}`} onClick={onClick} style={style}>
      <img
        src={imgSrc}
        alt={card.id}
        className="w-full h-full object-contain"
        onError={(e) => (e.currentTarget.src = `${import.meta.env.BASE_URL}default.png`)}
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

    const colorMatch =
      filterColor === "全部顏色" || card.color === filterColor;

    const gradeMatch =
      filterGrade === "全部階級" || card.grade === filterGrade;

    const seriesMatch =
      filterSeries === "全部彈數" || card.series === filterSeries;

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

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  };

  const handleExportCode = async () => {
    const payload = {
      oshi: oshiCard,
      deck: deckCards,
      energy: energyCards
    };
    const code = generateRandomCode();

    try {
      await fetch("http://localhost:3001/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, payload })
      });
      await navigator.clipboard.writeText(code); // ← 複製代碼到剪貼簿
      setShareCode(code);
      alert(`✅ 已複製代碼 ${code} 到剪貼簿`);
    } catch (error) {
      alert("❌ 分享代碼儲存失敗");
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
        <img src="${c.imageFolder}${c.id}${c.version}" alt="${c.id}" />
        <div class="count">${c.count}</div>
      </div>
    `).join("")}
    </div></body></html>`;

    const w = window.open();
    w.document.write(html);
    w.document.close();
  };

  const renderZoomCard = () => {
    if (!zoomImageUrl || !zoomCard) return null;
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
        onClick={() => setZoomCard(null)}
      >
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <img
            src={zoomImageUrl}
            alt={zoomCard.id}
            className="w-[240px] h-[360px] object-contain border shadow-lg"
          />
          <button
            className="absolute top-1 right-1 bg-white text-black px-2 py-1 rounded"
            onClick={() => setZoomCard(null)}
          >
            關閉
          </button>
        </div>
      </div>
    );
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
      <div className="flex flex-1">
        {/* 左側卡片清單 */}
        <div className="overflow-y-auto px-2 pt-6 pb-2 w-1/2">
          <div className="grid grid-cols-5 gap-1">
            {filteredCards.flatMap((card) =>
              (card.versions || ["_C.png"]).map((version) => (
                <div
                  key={`${card.id}-${version}`}
                  className="relative cursor-pointer"
                  onClick={() => handleAddCard(card, version)}
                >
                  <CardImage
                    card={card}
                    version={version}
                    style={{ width: "140px", height: "210px" }}
                    onZoom={(url, cardData) => {
                      setZoomImageUrl(url);
                      setZoomCard(cardData);
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-[10px] text-center truncate">
                    {card.id} {version.replace(".png", "")}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 右側牌組區 */}
        <div className="w-1/2 border-l px-4 py-4 bg-white" ref={deckRef}>
          <h3 className="text-lg font-bold mb-2">🗂 我的牌組</h3>

          {/* 主推卡顯示區 */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold">🌟 主推卡：</h4>
            {oshiCard ? (
              <CardImage
                card={oshiCard}
                version={oshiCard.version}
                style={{ width: "63px", height: "88px" }}
                onZoom={(url, cardData) => {
                  setZoomImageUrl(url);
                  setZoomCard(cardData);
                }}
                onClick={() => setOshiCard(null)}
              />
            ) : (
              <p className="text-xs text-gray-500">尚未選擇主推卡</p>
            )}
          </div>

          {/* 卡組 50張 */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold">📦 主卡組 ({deckCards.length} / 50)：</h4>
            <div className="flex flex-wrap gap-1">
              {deckCards.map((card, index) => (
                <CardImage
                  key={`${card.id}-${card.version}-${index}`}
                  card={card}
                  version={card.version}
                  style={{ width: "63px", height: "88px" }}
                  onZoom={(url, cardData) => {
                    setZoomImageUrl(url);
                    setZoomCard(cardData);
                  }}
                  onClick={() => handleRemoveDeckCard(index)}
                />
              ))}
            </div>
          </div>

          {/* 能量卡 20張 */}
          <div>
            <h4 className="text-sm font-semibold">⚡ 能量卡 ({energyCards.length} / 20)：</h4>
            <div className="flex flex-wrap gap-1">
              {energyCards.map((card, index) => (
                <CardImage
                  key={`${card.id}-e-${index}`}
                  card={card}
                  version={card.version}
                  style={{ width: "63px", height: "88px" }}
                  onZoom={(url, cardData) => {
                    setZoomImageUrl(url);
                    setZoomCard(cardData);
                  }}
                  onClick={() => handleRemoveEnergyCard(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {renderZoomCard()}
    </div>
  );
}

export default DeckBuilder;
