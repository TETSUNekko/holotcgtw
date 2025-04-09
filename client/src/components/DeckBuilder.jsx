// DeckBuilder.jsx
import React, { useState, useRef } from "react";
import cardList from "../cardList_hBP01.json";
import cardListBP02 from "../cardList_hBP02.json";
import cardListBP03 from "../cardList_hBP03.json";
import cardListSD01 from "../cardList_hSD01.json";
import cardListSD02 from "../cardList_hSD02.json";
import cardListSD03 from "../cardList_hSD03.json";
import cardListSD04 from "../cardList_hSD04.json";
import cardListSD05 from "../cardList_hSD05.json";
import cardListSD06 from "../cardList_hSD06.json";
import cardListSD07 from "../cardList_hSD07.json";
import energyCardList from "../cardList_hY.json";
import cardListPR from "../cardList_PR.json";
import cardListBD24 from "../cardList_hBD24.json";
import { ZoomIn } from "lucide-react";
import SearchBar from "./SearchBar";
import { FixedSizeGrid as Grid } from "react-window";
import html2canvas from "html2canvas";

const CardImage = ({ card, version, className, style, onZoom, onClick }) => {
  const basePath = import.meta.env.BASE_URL || "/";
  const imgSrc = `${basePath}webpcards/${card.imageFolder}${card.id}${version.replace(".png", ".webp")}`;

  // ✅ 預載入翻譯圖
  //React.useEffect(() => {
  //  const match = card.id.match(/(h[A-Z]+\d*)-(\d{3})/);
  //  const series = match ? match[1] : null;
  //  const cardNumber = match ? match[2] : null;

  //  if (series && cardNumber) {
  //    const translatedUrl = `${basePath}webpcards/${series}-trans/${series}-${cardNumber}.webp`;
  //    const img = new Image();
  //    img.src = translatedUrl;
  //  }
  //}, [card.id]);
  
  return (
    <div className={`relative ${className}`} onClick={onClick} style={style}>
      <img
        src={imgSrc}
        alt={card.id}
        loading="lazy"
        className="w-full h-full object-contain"
      />
      <button
        className="absolute top-0 left-0 p-0.5 text-white bg-black bg-opacity-50 hover:bg-opacity-80 text-xs"
        onClick={(e) => {
          e.stopPropagation();
          onZoom(imgSrc, card);
        }}
      >
        <ZoomIn size={20} />
      </button>
    </div>
  );
};

function DeckBuilder() {
  const [zoomImageUrl, setZoomImageUrl] = useState("");
  const [zoomCard, setZoomCard] = useState(null);
  const [oshiCards, setOshiCards] = useState([]);
  const [deckCards, setDeckCards] = useState([]);
  const [energyCards, setEnergyCards] = useState([]);
  const [shareCode, setShareCode] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("全部");
  const [filterColor, setFilterColor] = useState("全部顏色");
  const [filterGrade, setFilterGrade] = useState("全部階級");
  const [filterSeries, setFilterSeries] = useState("全部彈數");
  const [supportSubtype, setSupportSubtype] = useState("全部");
  const [filterVersion, setFilterVersion] = useState("全部版本");
  const [showWelcome, setShowWelcome] = useState(true);


  const deckRef = useRef();
  const allCards = [...cardList, ...cardListBP02, ...cardListBP03, ...cardListSD01, ...cardListSD02, ...cardListSD03, ...cardListSD04, 
                    ...cardListSD05, ...cardListSD06, ...cardListSD07, ...cardListPR, ...cardListBD24, ...energyCardList];

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

    const colorMatch = filterColor === "全部顏色" || (Array.isArray(card.color) && card.color.includes(filterColor));
    const gradeMatch = filterGrade === "全部階級" || card.grade === filterGrade;
    const seriesMatch =
      filterSeries === "全部彈數" ||
      (Array.isArray(card.series) && card.series.includes(filterSeries)) ||
      (typeof card.series === "string" && card.series === filterSeries);
    const subtypeMatch = supportSubtype === "全部" || (Array.isArray(card.searchKeywords) && card.searchKeywords.includes(supportSubtype));

    return matchType && matchSearch && colorMatch && gradeMatch && seriesMatch && subtypeMatch;
  });

  const handleAddCard = (card, version) => {
    if (filterVersion !== "全部版本" && version.replace(".png", "") !== filterVersion) return;

    if (card.type === "Oshi") {
      setOshiCards((prev) => [...prev, { ...card, version }]);
    }else if (card.type === "Energy") {
      setEnergyCards((prev) => [...prev, { ...card, version }]);
    } else {
      setDeckCards((prev) => [...prev, { ...card, version }]);
    }
  };

  const handleClearDeck = () => {
    if (window.confirm("確定要清空整副牌組嗎？")) {
      setOshiCards([]);
      setDeckCards([]);
      setEnergyCards([]);
      setShareCode("");
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
      oshi: oshiCards,
      deck: deckCards,
      energy: energyCards
    };
    const code = Array.from({ length: 6 }, () =>
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".charAt(Math.floor(Math.random() * 36))
    ).join("");

    try {
      await fetch("https://deck-api-server.onrender.com/save", { 
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
      const res = await fetch(`https://deck-api-server.onrender.com/load/${shareCode}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOshiCards(data.oshi || []);
      setDeckCards(data.deck);
      setEnergyCards(data.energy);
      alert("✅ 成功讀取代碼");
    } catch {
      alert("❌ 無法讀取該代碼");
    }
  };

  const handleExportImage = () => {
    const grouped = {};
    [...oshiCards, ...deckCards, ...energyCards].forEach((card) => {
      const key = `${card.id}${card.version}`;
      grouped[key] = grouped[key] || { ...card, count: 0 };
      grouped[key].count += 1;
    });
  
    const html = `<!DOCTYPE html><html><head><title>我的牌組</title>
      <style>
        body { font-family: sans-serif; padding: 20px; background:rgb(206, 240, 239); }
        h1 { margin-bottom: 12px; }
        .grid { display: flex; flex-wrap: wrap; gap: 10px; cursor: pointer; }
        .card { position: relative; width: 140px; height: 210px; }
        .card img { width: 100%; height: 100%; object-fit: contain; }
        .count {
          position: absolute;
          bottom: 2px;
          right: 4px;
          background: #000000aa;
          color: #fff;
          font-weight: bold;
          font-size: 18px;
          padding: 4px 8px;
          border-radius: 4px;
        }
      </style>
    </head><body>
      <h1>我的牌組(點圖片可下載)</h1>
      <div class="grid" id="deckArea" title="點擊下載圖片" style="display: inline-flex; flex-wrap: wrap; gap: 10px;">
        ${Object.values(grouped).map((c) => `
          <div class="card">
            <img src="cards/${c.imageFolder}${c.id}${c.version}" alt="${c.id}" />
            <div class="count">${c.count}</div>
          </div>
        `).join("")}
      </div>
  
      <script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
      <script>
        const deckArea = document.getElementById('deckArea');
        deckArea.addEventListener('click', () => {
          html2canvas(deckArea, { scale: 2, backgroundColor: null }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'my-deck.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
          });
        });
      </script>
    </body></html>`;
  
    const w = window.open();
    w.document.write(html);
    w.document.close();
  };
  

  const renderZoomCard = () => {
    if (!zoomImageUrl || !zoomCard) return null;
    const basePath = import.meta.env.BASE_URL || "/";

    // 從卡片 ID 中擷取系列與卡號，例如 hBP01-001
    const match = zoomImageUrl.match(/(h[A-Z]+\d*)-(\d{3})/);
    const series = match ? match[1] : null;
    const cardNumber = match ? match[2] : null;
    const translatedImageUrl =
      series && cardNumber
        ? `${basePath}webpcards/${series}-trans/${series}-${cardNumber}.webp`
        : null;

  
    return (
      <div
        className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center"
        onClick={() => {
          setZoomImageUrl("");
          setZoomCard(null);
        }}
      >
        <div
          className="flex gap-4 p-4 bg-white rounded-xl max-w-6xl w-full justify-center items-center relative"
          onClick={(e) => e.stopPropagation()} // 避免點內部關閉 modal
        >
          <img
            src={zoomImageUrl}
            alt="原圖"
            className="w-[clamp(200px,38vw,380px)] aspect-[630/880] object-contain shadow-lg rounded-xl" 
          />
          {translatedImageUrl && (
          <img
            src={translatedImageUrl}
            alt="翻譯圖"
            className="w-[clamp(200px,58vw,560px)] aspect-[1120/1080] object-contain shadow-lg rounded-xl"
            onError={(e) => (e.target.style.display = "none")}
          />
          )}
          <button
            onClick={() => {
              setZoomImageUrl("");
              setZoomCard(null);
            }}
            className="absolute top-4 right-4 text-black text-3xl"
          >
            ✕
          </button>
        </div>
      </div>
    );
  };
  

  return (
    <div className="flex flex-col h-screen max-h-screen bg-blue-50">
      <SearchBar
        //playerName={playerName}
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
        filterVersion={filterVersion}
        setFilterVersion={setFilterVersion}
        onExportImage={handleExportImage}
        onExportCode={handleExportCode}
        onImportCode={handleImportCode}
        onClearDeck={handleClearDeck}
        />
        
        {/* 左側卡片清單容器 */}
        <div className="flex flex-1">

          <div className="w-1/2 h-full">
            <div className="overflow-y-auto px-2 pt-6 pb-2" style={{ maxHeight: "calc(100vh - 160px)" }}>
            <div
              className="flex flex-wrap gap-0.5"
              style={{
                alignItems: "flex-start",
              }}
            >
              {filteredCards.flatMap((card) =>
                (card.versions || ["_C.png"])
                .filter((version) => {
                  const cleanVersion = version.replace(".png", "");
            
                  // ✅ 只有當目前的篩選彈數是 "hPR" 時，才只顯示 _P、_P_2
                  const isCurrentlyFilteringPR = filterSeries === "hPR";
                  if (isCurrentlyFilteringPR && !/^_P(_\d+)?$/.test(cleanVersion)) return false;
            
                  if (filterVersion === "全部版本") return true;
                  return cleanVersion.startsWith(filterVersion);
                })
                .map((version) => (
                    <div
                      key={`${card.id}-${version}`}
                      className="relative cursor-pointer w-[clamp(100px,8vw,160px)] aspect-[2/3]"
                      onClick={() => handleAddCard(card, version)}
                    >
                      <CardImage
                        card={card}
                        version={version}
                        style={{ width: "100%", height: "100%" }}
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
          </div>
  
          <div className="w-1/2 border-l px-4 py-4 bg-zinc-100" ref={deckRef}>
            <h3 className="text-lg font-bold mb-2">🗂 我的牌組</h3>
  
            <div className="mb-4">
              <h4 className="text-sm font-semibold">🌟 主推卡（{oshiCards.length} / 1）：</h4>
                {oshiCards.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {oshiCards.map((card, index) => (
                      <CardImage
                        key={`${card.id}-oshi-${index}`}
                        card={card}
                        version={card.version}
                        style={{ width: "clamp(45px, 6vw, 63px)", height: "clamp(65px, 8.5vw, 88px)" }}
                        onZoom={(url, cardData) => {
                          setZoomImageUrl(url);
                          setZoomCard(cardData);
                        }}
                        onClick={() =>
                          setOshiCards((prev) => prev.filter((_, i) => i !== index))
                        }
                      />
                    ))}
                  </div>
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
                    style={{ width: "clamp(45px, 6vw, 63px)", height: "clamp(65px, 8.5vw, 88px)" }}
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
                    style={{ width: "clamp(45px, 6vw, 63px)", height: "clamp(65px, 8.5vw, 88px)" }}
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
        
        {/* ✅ 右上角版權 */}
          <div className="absolute top-2 right-4 text-xs text-gray-400 z-50">
          © 2016 COVER Corp.
        </div>

        {showWelcome && (
          <div
            className="fixed inset-0 z-50 bg-black bg-opacity-70 flex justify-center items-center"
            onClick={() => setShowWelcome(false)}
          >
            <div
              className="bg-gradient-to-b from-amber-50 to-white text-center px-10 py-8 rounded-xl shadow-xl max-w-2xl w-[90%] min-h-[300px] max-h-screen overflow-y-auto flex flex-col justify-center items-center space-y-6"
              onClick={(e) => e.stopPropagation()} // 避免點內部直接關掉
            >
              <h2 className="text-2xl font-bold text-gray-800">🔰 歡迎來到 HoloTCG 繁中卡表生成器</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                本工具為非營利個人專案，僅供玩家自用與測試。
                <br />
                嚴禁將本工具所生成之內容用於任何形式之商業用途。
                <br />
                ※本工具所生成之卡表，不得作為官方比賽用。參加比賽請使用官方 decklog 製作卡表。https://decklog.bushiroad.com/create?c=9
                <br />
                <br />
                4/9更新內容 : PR卡分類&以出貨生日卡補齊；增加清空搜尋按鈕
              </p>
              <p className="text-xs text-gray-400">點擊任意處以開始使用</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  export default DeckBuilder;
  