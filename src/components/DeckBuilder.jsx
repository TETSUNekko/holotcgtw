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

// 以下內容不變...

export default DeckBuilder;
