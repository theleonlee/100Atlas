// 設定地標顏色
const COLORS = {
    taiwan100peaks: "#2E7D32",       // 綠
    taiwan100smallpeaks: "#F9A825",  // 黃
    japan100mountains: "#558B2F",    // 綠
    korea100mountains: "#00696C",    // 綠
    japan100castles: "#1565C0",      // 藍
    japan100continuedcastles: "#42A5F5",  // 藍
};



const ATLAS_LIST = [
    {
        id:"taiwan100peaks",
        name:"百岳",
        file:"data/taiwan100peaks.json"
    },
    {
        id:"taiwan100smallpeaks",
        name:"小百岳",
        file:"data/taiwan100smallpeaks.json"
    },
    {
        id:"korea100mountains",
        name:"韓國百名山",
        file:"data/korea100mountains.json"
    },
    {
        id:"japan100mountains",
        name:"日本百名山",
        file:"data/japan100mountains.json"
    },
    {
        id:"japan100castles",
        name:"日本百名城",
        file:"data/japan100castles.json"
    },
    {
        id:"japan100continuedcastles",
        name:"續日本百名城",
        file:"data/japan100continuedcastles.json"
    }
];



function updateProgress() {

    let promises = ATLAS_LIST.map(item => {

        return fetch(item.file)
        .then(res => res.json())
        .then(data => {

            let complete = 0;


            data.forEach(place => {

                if (
                    localStorage.getItem(place.id)
                    === "complete"
                ) {
                    complete++;
                }

            });


            let percent = Math.round(
                (complete / data.length) * 100
            );


            return `
            <div class="progress-item">

                <div class="progress-title">
                    <span>${item.name}</span>
                    <b>${percent}%</b>
                </div>


                <div class="progress-bar">

                    <div 
                    class="progress-fill"
                    style="width:${percent}%">
                    </div>

                </div>
                

            </div>
            `;

        });

    });


    Promise.all(promises)
    .then(result => {

        document
        .getElementById("progress-content")
        .innerHTML = result.join("");

    });

}



// 建立地圖
var map = L.map('map');


map.fitBounds(
    [[21, 120],[45, 144]]);



// CARTO Voyager 底圖
L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    {
        attribution:
        '&copy; OpenStreetMap &copy; CARTO'
    }
).addTo(map);



// 建立圖層
var taiwan100PeaksLayer = L.layerGroup();
var taiwan100SmallPeaksLayer = L.layerGroup();
var japan100MountainsLayer = L.layerGroup();
var korea100MountainsLayer = L.layerGroup();
var japan100CastlesLayer = L.layerGroup();
var japan100ContinuedCastlesLayer = L.layerGroup();



// 設定地標樣式
function getMarkerStyle(status, color) {

    let style = {
        radius: 8,
        fillColor: color,
        color: "#FFFFFF",
        weight: 2,
        opacity: 0.9,
        fillOpacity: 1
    };

    if (status === "incomplete") {
        style.opacity = 0.3;
        style.fillOpacity = 0.35;
    }

    if (status === "interested") {
        style.fillColor = "#ee4266";
    }

    return style;
}


// 建立讀取資料函式
function loadAtlasData(file, layer, type, color) {

    fetch(file)
        .then(response => response.json())
        .then(data => {

            data.forEach(place => {


                // 狀態
                let status = localStorage.getItem(place.id) || "incomplete"; 


                // 建立陰影
                var shadow = L.circleMarker(
                    [place.lat, place.lng],
                    {
                        radius: 10,
                        fillColor: "#000000",
                        color: "#000000",
                        weight: 0,
                        fillOpacity: 0.05
                    }
                );


                // 建立主要點
                var marker = L.circleMarker(
                    [place.lat, place.lng],
                    getMarkerStyle(status, color)
                );

                
                // 建立Popup內容
                var popupContent = `
                <h3>${place.name}</h3>

                <p>類型：${type}</p>
                
                <p>地點：${place.city}</p>

                ${place.height ? `<p>高度：${place.height} m</p>` : ""}

                <label>狀態</label><br>

                <select id="status-${place.id}">
                    <option value="complete">已完成</option>
                    <option value="incomplete">未完成</option>
                    <option value="interested">有興趣</option>
                </select>

                <br><br>

                <label>造訪日期</label><br>

                <input
                    type="date"
                    id="date-${place.id}"
                >

                <br><br>

                <label>備註</label><br>

                <textarea
                    id="note-${place.id}"
                    rows="3"
                    style="width:100%;"
                ></textarea>

                <br><br>

                <button id="save-${place.id}">
                    儲存
                </button>
                `;


                marker.bindPopup(popupContent);


                marker.on("popupopen", function () {

                    const select = document.getElementById(`status-${place.id}`);
                    
                    const date = document.getElementById(`date-${place.id}`);
                    date.addEventListener("change", function () {
                        this.blur();
                    });
                    
                    const note = document.getElementById(`note-${place.id}`);
                    
                    const save = document.getElementById(`save-${place.id}`);

                    select.value = status;

                    date.value =
                        localStorage.getItem(`${place.id}_date`) || "";

                    note.value =
                        localStorage.getItem(`${place.id}_note`) || "";

                    select.onchange = function () {

                        status = this.value;

                        localStorage.setItem(place.id, status);

                        marker.setStyle(
                            getMarkerStyle(status, color)
                        );
                    };


                    save.onclick = function () {

                        localStorage.setItem(
                            place.id,
                            select.value
                        );

                        localStorage.setItem(
                            `${place.id}_date`,
                            date.value
                        );

                        localStorage.setItem(
                            `${place.id}_note`,
                            note.value
                        );

                        status = select.value;

                        marker.setStyle(
                            getMarkerStyle(status, color)
                        );

                        marker.closePopup();
                        updateProgress();
                    };
                });


                shadow.addTo(layer);
                marker.addTo(layer);
        });
    }); 
}



// 載入資料
loadAtlasData(
    'data/taiwan100peaks.json',
    taiwan100PeaksLayer,
    '百岳',
    COLORS.taiwan100peaks
);


loadAtlasData(
    'data/taiwan100smallpeaks.json',
    taiwan100SmallPeaksLayer,
    '小百岳',
    COLORS.taiwan100smallpeaks
);



loadAtlasData(
    'data/japan100mountains.json',
    japan100MountainsLayer,
    '日本百名山',
    COLORS.japan100mountains
);


loadAtlasData(
    'data/korea100mountains.json',
    korea100MountainsLayer,
    '韓國百名山',
    COLORS.korea100mountains
);


loadAtlasData(
   'data/japan100castles.json',
   japan100CastlesLayer,
   '日本百名城',
   COLORS.japan100castles
);


loadAtlasData(
   'data/japan100continuedcastles.json',
   japan100ContinuedCastlesLayer,
   '續日本百名城',
   COLORS.japan100continuedcastles
);


// 預設顯示
taiwan100PeaksLayer.addTo(map);
taiwan100SmallPeaksLayer.addTo(map);
japan100MountainsLayer.addTo(map);
korea100MountainsLayer.addTo(map);
japan100CastlesLayer.addTo(map);
japan100ContinuedCastlesLayer.addTo(map);


// 圖層控制
var overlays = {
    "百岳": taiwan100PeaksLayer,
    "小百岳": taiwan100SmallPeaksLayer,
    "日本百名山": japan100MountainsLayer,
    "韓國百名山": korea100MountainsLayer,
    "日本百名城": japan100CastlesLayer,
    "續日本百名城": japan100ContinuedCastlesLayer
};



L.control.layers(null, overlays)
    .addTo(map);



// 圖例
var legend = L.control({
    position: "bottomleft"
});


legend.onAdd = function () {

    var div = L.DomUtil.create(
        "div",
        "legend"
    );

    div.innerHTML = `
        <h4>圖例</h4>

        <div>
            <span class="legend-dot" style="background:#2E7D32"></span>
            百岳
        </div>

        <div>
            <span class="legend-dot" style="background:#F9A825"></span>
            小百岳
        </div>

        <div>
            <span class="legend-dot" style="background:#558B2F"></span>
            日本百名山
        </div>

        <div>
            <span class="legend-dot" style="background:#00695C"></span>
            韓國百名山
        </div>

        <hr>

        <div>
            <span class="legend-dot interested"></span>
            有興趣
        </div>

        <div>
            <span class="legend-dot incomplete"></span>
            未完成
        </div>
    `;


    return div;
};



legend.addTo(map);


// 完成度控制
var progress = L.control({
    position: "bottomright"
});


progress.onAdd = function () {

    var div = L.DomUtil.create(
        "div",
        "progress"
    );

    div.innerHTML = `
        <h4>進度</h4>
        <div id="progress-content">
            載入中...
        </div>
    `;

    return div;
};


progress.addTo(map);
updateProgress();
