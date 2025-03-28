// SearchBar.jsx
import React from "react";

function SearchBar({
  playerName,
  filterType,
  setFilterType,
  searchTerm,
  setSearchTerm,
  filterColor,
  setFilterColor,
  filterGrade,
  setFilterGrade,
  filterSeries,
  setFilterSeries,
  supportSubtype,
  setSupportSubtype,
  shareCode,
  setShareCode,
  onExportImage,
  onExportCode,
  onImportCode
}) {
  const handleCopyCode = async () => {
    const data = await onExportCode();
    if (data) {
      navigator.clipboard.writeText(data).then(() => {
        alert(`📋 已複製代碼 ${data} 到剪貼簿！`);
      }).catch(() => {
        alert("❌ 無法複製代碼");
      });
    }
  };

  return (
    <div className="sticky top-0 z-10 bg-amber-100 p-3 border-b border-yellow-300 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-bold">👤 玩家：{playerName}</h2>

        <select className="border rounded px-2 py-1" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="全部">全部</option>
          <option value="Oshi">主推卡</option>
          <option value="Member">成員卡</option>
          <option value="Support">支援卡</option>
          <option value="Energy">能量卡</option>
        </select>

        <input
          type="text"
          placeholder="搜尋卡片編號或名稱..."
          className="border px-2 py-1 rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select className="border rounded px-2 py-1" value={filterColor} onChange={(e) => setFilterColor(e.target.value)}>
          <option value="全部顏色">全部顏色</option>
          <option value="red">紅</option>
          <option value="white">白</option>
          <option value="blue">藍</option>
          <option value="green">綠</option>
          <option value="yellow">黃</option>
          <option value="purple">紫</option>
          <option value="colorless">無</option>
        </select>

        <select className="border rounded px-2 py-1" value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)}>
          <option value="全部階級">全部階級</option>
          <option value="debut">debut</option>
          <option value="1st">1st</option>
          <option value="2nd">2nd</option>
          <option value="buzz">buzz</option>
          <option value="spot">spot</option>
        </select>

        <select className="border rounded px-2 py-1" value={filterSeries} onChange={(e) => setFilterSeries(e.target.value)}>
          <option value="全部彈數">全部彈數</option>
          <option value="hBP01">ブースターパック「ブルーミングレディアンス」</option>
        </select>

        <select
          className="border rounded px-2 py-1"
          value={supportSubtype}
          onChange={(e) => setSupportSubtype(e.target.value)}
        >
          <option value="全部">全部支援子分類</option>
          <option value="item">Item</option>
          <option value="event">Event</option>
          <option value="tool">Tool</option>
          <option value="mascot">Mascot</option>
          <option value="fan">Fan</option>
        </select>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button 
          onClick={onExportImage}
          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
        >
          📊 輸出圖表
        </button>
        <button 
          onClick={handleCopyCode}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
        >
          🔗 分享代碼
        </button>
        <input
          type="text"
          placeholder="輸入代碼..."
          className="border px-2 py-1 rounded"
          value={shareCode}
          onChange={(e) => setShareCode(e.target.value)}
        />
        <button 
          onClick={onImportCode}
          className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded"
        >
          📥 讀取代碼
        </button>
      </div>
    </div>
  );
}

export default SearchBar;
