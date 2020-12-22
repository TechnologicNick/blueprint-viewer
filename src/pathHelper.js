const { dialog } = require("electron");
const regedit = require("regedit");
const path = require("path");
const fs = require("fs");

class PathHelper {
    static GAME_DATA;
    static SURVIVAL_DATA;
    static CHALLENGE_DATA;

    static USER_DIR;
    static INSTALLATION_DIR;

    static STEAM;

    static isValidInstallDir(dir) {
        console.log("Validating", dir);
        return fs.existsSync(path.join(dir, "Release", "ScrapMechanic.exe"));
    }

    static findSteamInstallation() {
        return new Promise((resolve, reject) => {
            regedit.list("HKLM\\SOFTWARE\\WOW6432Node\\Valve\\Steam", (err, result) => { //TODO: Test this on 32bit windows
                
                if (err !== null) {
                    console.log(err);
                    reject(err.message);
                    return;
                }

                this.STEAM = Object.values(result)[0].values.InstallPath.value;
                
                resolve(this.STEAM);
            });
        });
    }

    static getSteamLibraryFolders() {
        let libFol = [ this.STEAM ];

        let vdf = fs.readFileSync(path.join(this.STEAM, "steamapps", "libraryfolders.vdf")).toString();
        let matches = Array.from(vdf.matchAll(/^\t"\d+"\t\t"(.*?)"$/gm));

        // console.log(Array.from(matches));
        for (let m of matches) libFol.push(m[1].replace("\\\\", path.sep));

        return libFol;
    }

    static async findScrapMechanicInstallation() {
        await this.findSteamInstallation();
        console.log(this);

        for (let lf of this.getSteamLibraryFolders()) {
            let inst = path.join(lf, "steamapps", "common", "Scrap Mechanic");

            if (this.isValidInstallDir(inst)) {
                this.INSTALLATION_DIR = inst;
                break;
            }
        }
        console.log(this);

        return this.INSTALLATION_DIR;
    }

    static async findOrSelectInstallDir() {

        // Find this.INSTALLATION_DIR
        while (true) {
            try {
                // Try to find it first
                let inst = await PathHelper.findScrapMechanicInstallation().catch(async err => {
                    
                    // If an error occurs, let the user select it manually.
                    console.log("Failed to find Scrap Mechanic installation directory:", err);
                    let result = await dialog.showMessageBox(undefined, {
                        message: "Unable to find the Scrap Mechanic installation. Do you want to select the installation directory manually?",
                        buttons: ["Cancel", "Yes"],
                        defaultId: 1,
                        title: "Error",
                        type: "error"
                    })
                
                    if (result.response === 1) { // Yes
                        let selectedDirs = dialog.showOpenDialogSync(undefined, {
                            defaultPath: PathHelper.STEAM,
                            title: "Select Scrap Mechanic installation directory",
                            properties: ["openDirectory"]
                        });

                        // Returns an array or undefined
                        if (selectedDirs === undefined) return
                        else return selectedDirs[0];
                    }
                
                    return
                });

                // console.log("Found installation directory:", inst);

                // Canceled, stopping the application
                if (inst === undefined) return false;

                // Validate if the found or selected directory contains the /Release/ScrapMechanic.exe
                if (this.isValidInstallDir(inst)) {
                    this.INSTALLATION_DIR = inst;
                    break;
                } else {
                    // The directory was not valid
                    continue;
                }

            } catch(err) {
                console.log("bb", err);

                // Stopping the application
                return false;
            }
        }

        
        // Continuing the launch
        return true;
    }
}

module.exports = PathHelper;