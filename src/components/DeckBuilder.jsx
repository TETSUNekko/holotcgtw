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
        onExportImage={() => {}}
        onExportCode={() => {}}
        onImportCode={() => {}}
      />

      <div className="flex flex-1">
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

        <div className="w-1/2 border-l px-4 py-4 bg-white" ref={deckRef}>
          <h3 className="text-lg font-bold mb-2">🗂 我的牌組</h3>

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
    </div>
  );
}

export default DeckBuilder;
