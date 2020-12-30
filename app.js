const express = require('express')
const bodyParser = require('body-parser')
const ejs = require('ejs')
const https = require('https')
const d2d = require('degrees-to-direction');

const app = express()
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));
app.set("view engine","ejs");

app.get("/", function(req,res){
    res.render("home")    
})

app.post("/",function(req,res){
    var query = req.body.inputCity;
    var unit = req.body.unit
    var tempUnit = (unit=="Celsius (°C)") ? "metric" : (unit=="Kelvin (K)") ? "standard" : "imperial"
    unit = (unit=="Celsius (°C)") ? "°C" : (unit=="Kelvin (K)") ? "K" : "°F"
    var api = "e5d5a9ea382468b8becca045e7c37d4d";
    var url = "https://api.openweathermap.org/data/2.5/weather?q="+query+"&appid="+api+"&units="+tempUnit;
    https.get(url,function(response){
      response.on("data",function(data){
        const weatherData=JSON.parse(data);
        var icon = ""
        var city = ""
        var country =""
        var sunrise = ""
        var sunset = ""
        var temperature = ""
        var temperatureFeelsLike = ""
        var weather = ""
        var windSpeed = ""
        var windDirection = ""
        var pressure = ""
        var humidity = "" 
        var visibility = ""
        try {
            icon = weatherData.weather[0].icon
            var imageUrl="https://openweathermap.org/img/wn/"+icon+"@2x.png";
            city = weatherData.name
            country = weatherData.sys["country"]
            sunrise = calculateTime(weatherData.sys["sunrise"])
            sunset = calculateTime(weatherData.sys["sunset"])
            temperature = Math.round(weatherData.main["temp"])
            temperatureFeelsLike = Math.round(weatherData.main["feels_like"])
            weather = weatherData.weather[0].main
            windSpeed = weatherData.wind["speed"]
            windDirection = d2d(weatherData.wind["deg"])
            pressure = weatherData.main["pressure"]
            humidity = weatherData.main["humidity"]
            visibility = weatherData.visibility/1000
            res.render("city",{
                cityName : city, 
                countryName : country,
                time : {sunrise : sunrise, sunset : sunset},
                temperature : {temperature : temperature, temperatureFeelsLike : temperatureFeelsLike, unit : unit},
                weather : weather,
                imageUrl : imageUrl,
                wind : {windSpeed : windSpeed, windDirection : windDirection},
                pressure : pressure,
                humidity : humidity,
                visibility : visibility
            })
        }
        catch(err) {
            console.log("Invalid city name");
            res.render("home")
        }
    });
  });
});

app.listen(process.env.PORT || 3000, function(){
    console.log("Server started");
})

function calculateTime(time){
    let unix_timestamp = time
    var date = new Date(unix_timestamp * 1000);
    date.setHours(date.getHours()+5)
    date.setMinutes(date.getMinutes()+30)
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    var seconds = "0" + date.getSeconds();
    var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    time = formattedTime.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [formattedTime];
    if (time.length > 1) { 
      time = time.slice (1);
      time[0] = +time[0] % 12 || 12;
    }
    return time.join ('').slice(0,-3);  
}
