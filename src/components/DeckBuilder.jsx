// DeckBuilder.jsx
import React, { useState, useRef } from "react";
import cardList from "../cardList_hBP01.json";
import energyCardList from "../cardList_hY.json";
import { ZoomIn } from "lucide-react";
import SearchBar from "./SearchBar";

const CardImage = ({ card, version, className, style, onZoom, onClick }) => {
  const basePath = import.meta.env.BASE_URL || "/";
  const imgSrc = `${basePath}cards/${card.imageFolder}${card.id}${version}`;
  console.log("🧩 image src =", imgSrc);

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

  const deckRef = useRef();
  const allCards = [...cardList, ...energyCardList];

  // 你可以根據需要繼續添加 filter, add/remove card 等邏輯

  return (
    <div className="flex flex-col h-screen max-h-screen bg-blue-50">
      <h1 className="text-center py-4 font-bold text-xl">Hello DeckBuilder</h1>
      <div className="flex-1 overflow-auto">
        {/* 渲染卡片測試區域 */}
        <div className="grid grid-cols-5 gap-2 p-4">
          {allCards.slice(0, 5).map((card) =>
            (card.versions || ["_C.png"]).map((version) => (
              <CardImage
                key={`${card.id}-${version}`}
                card={card}
                version={version}
                style={{ width: "140px", height: "210px" }}
                onZoom={(url, cardData) => {
                  setZoomImageUrl(url);
                  setZoomCard(cardData);
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default DeckBuilder;
