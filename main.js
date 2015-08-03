(function() {
    'use strict';

    /**
     * Displays logging information on the screen and in the console.
     * @param {string} msg - Message to log.
     */
    function log(msg) {
        var logsEl = document.getElementById('logs');

        if (msg) {
            // Update logs
            console.log('[Network]: ', msg);
            logsEl.innerHTML += msg + '<br />';
        } else {
            // Clear logs
            logsEl.innerHTML = '';
        }

        logsEl.scrollTop = logsEl.scrollHeight;
    }

    /**
     * Register keys used in this application
     */
    function registerKeys() {
        var usedKeys = ['0'];

        usedKeys.forEach(
            function (keyName) {
                tizen.tvinputdevice.registerKey(keyName);
            }
        );
    }


    /**
     * Handle input from remote
     */
    function registerKeyHandler() {
        document.addEventListener('keydown', function (e) {
            switch (e.keyCode) {
                case 48:
                    log();
                    break;
                case 13:
                    // Enter key
                    Network.networkTest();
                    break;
                case 10009:
                    // Return key
                    tizen.application.getCurrentApplication().exit();
                    break;
            }
        });
    }

    /**
     * Display application version
     */
    function displayVersion() {
        var el = document.createElement('div');
        el.id = 'version';
        el.innerHTML = 'ver: ' + tizen.application.getAppInfo().version;
        document.body.appendChild(el);
    }

    /**
     * @name Network module
     * @description In order to avoid looping through network module objects every time any method is executed,
     * values are saved into arrays. Network module perform test and return values according to current network settings
     * @type {Object}
     */
    var Network = (function() {

        var el = null,
            listenerID,
            networkModule = null,
            activeConnectionType = ["DISCONNECTED", "WIFI", "CELLULAR", "ETHERNET"],
            gatewayState = ["FAIL", "PASS"],
            ipMode = ["NONE", "STATIC", "DYNAMIC", "AUTO", "FIXED"],
            state = ["", "LAN_CABLE_ATTACHED", "LAN_CABLE_DETACHED", "LAN_CABLE_STATE_UNKNOWN", "GATEWAY_CONNECTED", "GATEWAY_DISCONNECTED", "WIFI_MODULE_STATE_ATTACHED", "WIFI_MODULE_STATE_DETACHED", "WIFI_MODULE_STATE_UNKNOWN"],
            WifiSecurityMode = ["ERROR", "WEP", "WPA_PSK", "WPA2_PSK", "EAP", "NONE", "UNKNOWN"],
            WifiEncryptionType = ["", "WEP", "TKIP", "AES", "TKIP_AES_MIXED", "NONE", "UNKNOWN"],
            signalStrengthLevel = ["", "Level 1: below -88dBm", "Level 2: -88 ~ -77 dBm", "Level 3: -77 ~ -66 dBm", "Level 4: -66 ~ -55dBm", "Level 5: above -55dBm"],
            tested = false;

        /**
         * @description initalize module
         * @method Network.init()
         */
        function init() {
            networkModule = networkModule || webapis.network;

            // browser network check
            if (window.navigator.onLine) {
                document.getElementById('onlineStatus').innerText = "online";
            } else {
                document.getElementById('onlineStatus').innerText = "offline";
            }



        };

        /**
         * @description: Perform network test, adds only once network listener.
         * @method Network.networkTest()
         */
        function networkTest() {

            if(!tested) {
                addNetworkStateChangeListener();
                tested = true;
            }

            getSecondaryDNS();
            getSubnetMaskIP();
            getWiFiSignalStrengthLevel();
            getWiFiEncryptionType();
            getWiFiSecurityMode();
            getWiFiSsid();
            getDnsIP();
            getMAC();
            getGatewayIP();
            getIpMode();
            getIP();
            getCurrentConnectionType();
            getModuleVersion();
        }

        /**
         * @description This method gets the current active connection type of the tv.
         * @method Network.getCurrentConnectionType()
         */
        function getCurrentConnectionType() {
            log("Network type is: " + activeConnectionType[networkModule.getActiveConnectionType()]);
        }

        /**
         * @description This method gets the configured dns address value of the tv
         * @method Network.getDnsIP()
         */
        function getDnsIP() {
            log("DNS: " + networkModule.getDns());
        }

        /**
         * @description This method gets the configured gateway address value of the tv
         * @method Network.getGatewayIP()
         */
        function getGatewayIP() {
            log("Gateway: " + networkModule.getGateway());
        }

        /**
         * @description This method gets the configured ip address value of the tv.
         * @method Network.getIP()
         */
        function getIP() {
            log("IP: " + networkModule.getIp());
        }

        /**
         * @description This method gets the ip configuration type of the tv. It can be of type Static/Dynamic/Auto/Fixed.
         * @method Network.getIpMode()
         */
        function getIpMode() {
            log("IP Mode: " + ipMode[networkModule.getIpMode()]);
        }

        /**
         * @description This method gets the value of the mac address of the current active conncetion.
         * @method Network.getMAC()
         */
        function getMAC() {
            log("MAC: " + networkModule.getMac());
        }

        /**
         * @description This method gets the configured secondary dns address value of the tv.
         * @method Network.getSecondaryDNS()
         */
        function getSecondaryDNS() {
            log("Secondary DNS: " + networkModule.getSecondaryDns());
        }

        /**
         * @description This method gets the configured subnetmask address value of the tv.
         * @method Network.getSubnetMaskIP()
         */
        function getSubnetMaskIP() {
            log("Subnet Mask IP: " + networkModule.getSubnetMask());
        }

        /**
         * @description This method gets the value of the network module version which is used in the tv
         * @method Network.getModuleVersion()
         */
        function getModuleVersion() {
            log("Network module version: " + networkModule.getVersion());
        }

        /**
         * @description This method gets the connected wifi encryption type value, This api only works when wifi connection is active.
         * @method Network.getWiFiEncryptionType()
         */
        function getWiFiEncryptionType() {
            try {
                log("getWiFiEncryptionType: " + WifiEncryptionType[networkModule.getWiFiEncryptionType()]);
            } catch(e) {
                log("WiFi encryption type: Unknown");
                log("getWiFiEncryptionType: " + e.message);
            }
        }

        /**
         * @description This method gets the connected wifi security mode value, This api only works when wifi connection is active
         * @method Network.getWiFiSecurityMode()
         */
        function getWiFiSecurityMode() {
            try {
                log("getWiFiSecurityMode " + WifiSecurityMode[networkModule.getWiFiSecurityMode()]);
            } catch(e) {
                log("getWiFiSecurityMode: Unknown");
                log("WiFi Security Mode: " + e.message);
            }
        }

        /**
         * @description This method gets the connected wifi signal strength value, This api only works when wifi connection is active.
         * @method Network.getWiFiSignalStrengthLevel()
         */
        function getWiFiSignalStrengthLevel() {
            try {
                log("getWiFiSignalStrengthLevel: " + signalStrengthLevel[networkModule.getWiFiSignalStrengthLevel()]);
            } catch(e) {
                log("WiFi Signal Strength: Unknown");
                log("getWiFiSignalStrengthLevel: " + e.message);
            }

        }

        /**
         * @description This method gets the connected wifi SSID value, This api only works when wifi connection is active.
         * @method Network.getWiFiSsid()
         */
        function getWiFiSsid() {
            try {
                log("getWiFiSsid: " + networkModule.getWiFiSsid());
            } catch(e) {
                log("WiFi Ssid: Unknown");
                log("getWiFiSsid: " + e.message);
            }
        }

        /**
         * @description This method gets the state of the wired/wireless network whether tv is connected to the router(gateway) or not
         * @method Network.isConnectedToGateway()
         */
        function isConnectedToGateway() {
            try {
                log("Connected to gateway: " + networkModule.isConnectedToGateway());
            } catch (e) {
                log("Connected to gateway: " + e.message);
            }
        }

        /**
         * @description This method add the async event listener to the module.
         * @method Network.addNetworkStateChangeListener()
         */
        function addNetworkStateChangeListener() {

            var onChange = function(data) {
                log("[NetworkStateChangedCallback]: " + state[data]);
            }
            try {
                listenerID = networkModule.addNetworkStateChangeListener(onChange);
            } catch (e) {
                log("addNetworkStateChangeListener exception [" + e.code
                    + "] name: " + e.name + " message: " + e.message);
            }
            if (listenerID > -1) {
                log("addNetworkStateChangeListener success listener ID ["
                    + listenerID + "] ");
            }
        }

        /**
         * @description This method remove the async event listener to the module.
         * @method Network.removeNetworkStateChangeListener()
         */
        function removeNetworkStateChangeListener() {
            try {
                log("begin removeNetworkStateChangeListener listenerID: " + listenerID);
                networkModule.removeNetworkStateChangeListener(listenerID);
            } catch (e) {
                log("removeNetworkStateChangeListener exception [" + e.code
                            + "] name: " + e.name + " message: " + e.message);
                return;
            }
            log("removeNetworkStateChangeListener success");
        }

        return {
            init: init,
            networkTest: networkTest,
            getCurrentConnectionType: getCurrentConnectionType,
            getDnsIP: getDnsIP,
            getGatewayIP: getGatewayIP,
            getIP: getIP,
            getIpMode: getIpMode,
            getMAC: getMAC,
            getSecondaryDNS: getSecondaryDNS,
            getSubnetMaskIP: getSubnetMaskIP,
            getModuleVersion: getModuleVersion,
            getWiFiEncryptionType: getWiFiEncryptionType,
            getWiFiSecurityMode: getWiFiSecurityMode,
            getWiFiSignalStrengthLevel: getWiFiSignalStrengthLevel,
            getWiFiSsid: getWiFiSsid,
            isConnectedToGateway: isConnectedToGateway,
            addNetworkStateChangeListener: addNetworkStateChangeListener,
            removeNetworkStateChangeListener: removeNetworkStateChangeListener
        }
    }());

    /**
     * Start the application once loading is finished
     */
    window.onload = function () {

        if (window.tizen === undefined) {
            log('This application needs to be run on Tizen device');
            return;
        }

        displayVersion();
        registerKeys();
        registerKeyHandler();

        Network.init();

    };

})();

