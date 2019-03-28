// YR-parser
(() => { render() })()

async function render() {
    let latLong = getLatLong()
    let yrData = await getYrData()
    console.log(yrData)
    let weather = getWeatherForTime()
    drawWeatherTable("wtable", weather)
    // console.log(weather)
}

function getLatLong() {
    let s = document.location.search
    if (!s) return ["59.9", "10.7"]
    let lat = "";
}

async function drawWeatherTable(id, data) {
    let f = data.location
    let fDate = new Date(data.from);
    let fDateString = `${fDate.toLocaleDateString("nb-no").slice(0, -5)},${fDate.toLocaleTimeString("nb-no").slice(0, -3)}`
    let wTable = document.getElementById("weathercontainer")
    let wTds = wTable.getElementsByTagName("td")
    wTds.namedItem("time").innerText = fDateString;
    wTds.namedItem("forecast").innerHTML = `<img class="weathericon" src="https://api.met.no/weatherapi/weathericon/1.1/?symbol=${f.symbol.number}&content_type=image/svg" />`;
    wTds.namedItem("temp").innerText = `${round(f.temperature.value)}°`;
    wTds.namedItem("clouds").innerText = `${round(f.cloudiness.percent)}%`;
    wTds.namedItem("wind").innerText = `${f.windSpeed.mps}-${f.windGust.mps}m/s`;
    wTds.namedItem("pressure").innerText = `${round(f.pressure.value)}hPa`;
}

function getWeatherForTime(t = new Date()) {
    let yrData = JSON.parse(localStorage.wCache)
    let forecasts = yrData.product.time.filter(forecast => forecast ?
        new Date(forecast.to).getTime() === shittyTimeRounder(t).getTime() : false)
    console.log(`forecasts for ${shittyTimeRounder(t).toString()}`)
    console.log(forecasts)
    // stupid yr data massage.
    forecasts[0].location.precipitation = forecasts[1].location.precipitation
    forecasts[0].location.symbol = forecasts[1].location.symbol
    return forecasts[0]
}

function shittyTimeRounder(a = new Date()) {
    if (typeof (a) === "number") { let b = new Date(); b.setHours(b.getHours() + a); a = b; }
    return new Date(`${a.getFullYear()}/${a.getMonth() + 1}/${a.getDate()} ${a.getHours() + 1}:00`)
}

const round = (str) => Math.round(parseInt(str)).toString()

async function getYrData() { return cachedWeather() }

async function cachedWeather() {
    if (!localStorage.wCache || !cacheIsFresh() || localStorage.wDebug === "true") {
        console.log(`cache is stale or we're debugging`)
        let yrData = await fetch('https://api.met.no/weatherapi/locationforecastlts/1.3/.json?lat=59.91&lon=10.73', {
            // @ts-ignore
            accept: "application/json"
        })
            .then(d => d.json().then(f => f))
        localStorage.wCache = JSON.stringify(yrData);
        localStorage.wCacheTick = new Date().getTime().toString()
        return yrData
    } else {
        console.log(`cache is fresh`);
        return JSON.parse(localStorage.wCache)
    }
    function cacheIsFresh() {
        if (!localStorage.wCache) { return false; }
        return new Date().getTime() - parseInt(localStorage.wCacheTick, 10) < 3600000;
    }
}