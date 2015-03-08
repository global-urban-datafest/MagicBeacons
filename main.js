// Define Library
var SensorTag = require('sensortag');
var macUtil = require('getmac');
var mraa = require("mraa");
var mqtt = require('mqtt');


// Ibm Cloud settings
var broker = "quickstart.messaging.internetofthings.ibmcloud.com";
var topic = "iot-2/evt/status/fmt/json";
var organization = "quickstart";
var deviceType = "MagicBeacons-Edison";
var B = 3975;
var port = 1883;

 function pad2(n) {  // always returns a string
            return (n < 10 ? '0' : '') + n;
        }

function getTimeStamp(d){
            return d.getFullYear() +
               pad2(d.getMonth() + 1) + 
               pad2(d.getDate()) +
               pad2(d.getHours()) +
               pad2(d.getMinutes()) +
               pad2(d.getSeconds());
}
var macAddressVar ="";
// Get currect edision board mac address
macUtil.getMac(function(err, macAddress) {
    if (err) throw err;
    
    // Assign Mac Address
    macAddressVar = macAddress.replace(/:/gi, '');
    console.log('Magic Beacon Publish From MAC Address: ' + macAddressVar);


    // Setting up 
    var options = {};
    options.clientId = "d:" + organization + ":" + deviceType + ":" + macAddressVar;
    var client = mqtt.createClient(port, broker, options);
    topic = "iot-2/evt/status/fmt/json";
    var message = {};
    message.d = {};

    // End Set up push


    

    console.log('Start Application');
    SensorTag.discover(function(sensorTag) {
        console.log('discover');
        sensorTag.connect(function() {
            console.log('connect');

            var temperatureVar = "";
            var humidityVar = "";
            var objectTemperatureVar = "";
            var objectAmbientTemperatureVar = "";
            var output = "";




            console.log('Trying');
            sensorTag.discoverServicesAndCharacteristics(function() {
                console.log('readHardwareRevision');

                setInterval(function() {
                    try {
                        console.log("Discovery");




                        sensorTag.readHardwareRevision(function(hardwareRevision) {
                            console.log('\thardware revision = ' + hardwareRevision);

                        });

                        console.log('Device MAC Address: ' + macAddressVar);

                        sensorTag.enableHumidity(function() {
                            sensorTag.readHumidity(function(temperature, humidity) {
                                console.log('\ttemperature = %d C', temperature);
                                console.log('\thumidity = %d %', humidity);

                                temperatureVar = temperature.toFixed(2) + 'C';
                                humidityVar = humidity.toFixed(2) + "%";

                            });
                        });

                        sensorTag.enableIrTemperature(function() {
                            console.log('Temperature Enable');

                            sensorTag.readIrTemperature(function(objectTemperature,
                                ambientTemperature) {
                                objectTemperatureVar = parseFloat(objectTemperature.toFixed(2));
                                objectAmbientTemperatureVar = parseFloat(ambientTemperature.toFixed(2));

                                console.log("objTemp:" + objectTemperatureVar);
                                console.log("ambientTemp:" + objectAmbientTemperatureVar);

                            });


                        });

                        //TODO:
                        //enableAccelerometer
                        //enableGyroscope

                        var timestamp = new Date();
                        timestamp = getTimeStamp(timestamp);
                        output = '{"d":{"macAddress" : ' + macAddressVar + " , ";
                        output = output + '"timestamp" : ' + timestamp + " , ";
                        output = output + '"temp" : ' + temperatureVar + " , ";
                        output = output + '"humidity" : ' + humidityVar + " , ";
                        output = output + '"objectTemp" : ' + objectTemperatureVar + " , ";
                        output = output + '"ambientTemp" : ' + objectAmbientTemperatureVar + "  ";

                        output = output + '}}';

                        console.log(output);

                        message.d.temp = output;
                        client.publish(topic, JSON.stringify(message));
                        console.log("Sensor Data pushed ");


                    } catch (e) {
                        console.log("eeeee-;")
                        console.log(e);
                    }
                }, 3000);

            });

        }); // end detect
    });
});