//META{"name":"PulsoidHeartRateStatus","version":"1.0.0","description":"Integrates Pulsoid with Discord to show your heart rate in your custom status.","author":"YourName","source":"https://github.com/YourGitHub/PulsoidHeartRateStatus","website":"https://github.com/YourGitHub/PulsoidHeartRateStatus"}*//

module.exports = (() => {
    const config = {
        info: {
            name: "PulsoidHeartRateStatus",
            authors: [
                {
                    name: "Aeson",
                },
            ],
            version: "1.0.0",
            description: "Integrates Pulsoid with Discord to show your heart rate in your custom status.",
            github: "https://github.com/scorchedend456/Pulscord",
            github_raw: "https://github.com/scorchedend456/Pulscord/blob/main/PulsoidHeartRateStatus.js,
        },
        defaultConfig: [],
        changelog: [
            {
                title: "Initial Release",
                type: "added",
                items: ["Initial release of PulsoidHeartRateStatus plugin."],
            },
        ],
        main: "index.js",
    };

    return !global.ZeresPluginLibrary ? class {
        constructor() {
            this._config = config;
        }
        getName() {
            return config.info.name;
        }
        getAuthor() {
            return config.info.authors.map(a => a.name).join(", ");
        }
        getDescription() {
            return config.info.description;
        }
        getVersion() {
            return config.info.version;
        }
        load() {
            BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onConfirm: () => {
                    require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (err, res, body) => {
                        if (err) return require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                    });
                }
            });
        }
        start() {}
        stop() {}
    } : (([Plugin, Library]) => {
        const { Logger } = Library;

        return class PulsoidHeartRateStatus extends Plugin {
            constructor() {
                super();
                this.interval = null;
                this.userId = "YOUR_USER_ID"; // Set your user ID here
            }

            onStart() {
                Logger.log("PulsoidHeartRateStatus plugin started.");
                this.updateHeartRate();
                this.interval = setInterval(() => this.updateHeartRate(), 3000);
            }

            onStop() {
                Logger.log("PulsoidHeartRateStatus plugin stopped.");
                clearInterval(this.interval);
                this.setStatus("");  // Clear status when stopping
            }

            async updateHeartRate() {
                try {
                    const heartRate = await this.fetchHeartRate();
                    if (heartRate) {
                        this.setStatus(`❤️ ${heartRate} BPM`);
                    } else {
                        Logger.warn("Heart rate data is unavailable.");
                    }
                } catch (error) {
                    Logger.error("Failed to update heart rate:", error);
                }
            }

            async fetchHeartRate() {
                try {
                    const response = await fetch('http://localhost:8080/https://dev.pulsoid.net/api/v1/data/heart_rate/latest', {
                        headers: {
                            'Authorization': 'Bearer YOUR_PULSOID_TOKEN'
                        }
                    });
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    const data = await response.json();
                    Logger.log("Fetched heart rate data:", data);
                    return data.data.heart_rate;
                } catch (error) {
                    Logger.error("Failed to fetch heart rate:", error);
                    return null;
                }
            }

            async setStatus(status) {
                try {
                    const authToken = 'YOUR_DISCORD_TOKEN';
                    const customStatusData = {
                        custom_status: status,
                        status: 'online'
                    };
                    await fetch(`https://discord.com/api/v9/users/${this.userId}/settings`, {
                        method: 'PATCH',
                        headers: {
                            'Authorization': authToken,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(customStatusData)
                    });
                    Logger.log("Status updated to:", status);
                } catch (error) {
                    Logger.error("Failed to set status:", error);
                }
            }
        };
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
