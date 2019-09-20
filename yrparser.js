// YR-parser
(() => { render() })()

async function render() {
    // let latLong = getLatLong()
    // console.log(weatherData)

    // await getYrData()
    let weather = await getWeatherForTime()
    let precipitation = await getNowCast()
    drawTable("wtable", weather, precipitation)
}

// TODO: get location soft
// function getLatLong() {
//     let s = document.location.search
//     if (!s) return ["59.9", "10.7"]
//     let lat = "";
// }

async function drawTable(tableId, forecast, precipitation) {
    let f = forecast.location
    let fDate = new Date(forecast.from);
    let fDateString = `${fDate.toLocaleTimeString("nb-no").slice(0, -6)}`
    let wTable = document.getElementById(tableId)
    let wTds = wTable.getElementsByTagName("td")
    wTds.namedItem("time").innerText = fDateString;
    wTds.namedItem("forecast").innerHTML = `<img class="weathericon" src="https://api.met.no/weatherapi/weathericon/1.1/?symbol=${f.symbol.number}&content_type=image/svg" />`;
    wTds.namedItem("temp").innerText = `${round(f.temperature.value)}°`;
    wTds.namedItem("clouds").innerText = `${round(f.cloudiness.percent)}%`;
    wTds.namedItem("wind").innerText = `${f.windSpeed.mps}-${f.windGust.mps}`;
    wTds.namedItem("pressure").innerText = `${round(f.pressure.value)}`;
    // wTds.namedItem("precipitation").innerText = `${round(f.pressure.value)}`;
}

const drawRow = (table, forecast) => {
    // time, forecast, temp, clouds, wind, pressure
    let row = document.createElement("tr")
    row.id = forecast.time
    Object.keys(forecast).forEach(prop => {

    })
}

const drawCell = (row, html) => {

}

async function getNowCast() {
    let nowcast = await getYrData()[1]
}

async function getWeatherForTime(t = new Date()) {
    let yrData = await getYrData()
    let forecasts = yrData[0].product.time.filter(forecast => forecast ?
        new Date(forecast.to).getTime() === shittyTimeRounder(t).getTime() : false)
    console.log(`forecasts for ${shittyTimeRounder(t).toString()}`)
    console.log(forecasts)
    // yr data massage.
    forecasts[0].location.symbol = forecasts[1].location.symbol
    return forecasts[0]
}

function shittyTimeRounder(a = new Date()) {
    if (typeof (a) === "number") { let b = new Date(); b.setHours(b.getHours() + a); a = b; }
    return new Date(`${a.getFullYear()}/${a.getMonth() + 1}/${a.getDate()} ${a.getHours() + 1}:00`)
}

function round(str) { return Math.round(parseInt(str)).toString() }

async function getYrData() {
    if (!localStorage.wCache || !cacheIsFresh() || localStorage.wDebug === "true") {
        console.log(`cache is stale or we're debugging`)
        // TODO: dynamic urls
        let weatherData = await fetch(`https://api.met.no/weatherapi/locationforecastlts/1.3/.json?lat=59.91&lon=10.73`).then(d => d.json().then(f => f))
        let precipitation = await fetch(`https://api.met.no/weatherapi/nowcast/0.9/.json?lat=59.91&lon=10.73`).then(d => d.json().then(f => f))
        localStorage.wCache = JSON.stringify([weatherData, precipitation]);
        localStorage.wCacheTick = new Date().getTime().toString()
        return [weatherData, precipitation]
    } else {
        console.log(`cache is fresh`);
        return JSON.parse(localStorage.wCache)
    }
    function cacheIsFresh() {
        return localStorage.wCache
            ? new Date().getTime() - parseInt(localStorage.wCacheTick, 10) < 3600000
            : false
    }
}

// lol draggable

// Make the DIV element draggable:
dragElement(document.getElementById("weathercontainer"));

function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById("wheaders")) {
        // if present, the header is where you move the DIV from:
        document.getElementById("wheaders").onmousedown = dragMouseDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}