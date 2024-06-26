const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Argumente aus der Kommandozeile einlesen
const exportDir = process.argv[2];

// Pfad zum Quelldateiordner und zum Zielverzeichnis
const sourceDir = path.join(__dirname, 'autisten-info-bootstrap', 'assets');
const exportCssDir = path.join(exportDir, 'assets', 'css');
const destDir = path.join(exportDir, '..', 'autisten-info-nuxt', 'assets');
const nuxtConfigPath = path.join(exportDir, '..', 'autisten-info-nuxt', 'nuxt.config.ts');
const componentsDir = path.join(exportDir, '..', 'autisten-info-nuxt', 'components');

let usedAssets = [];

// Funktion zum Kopieren des Ordners
function copyFolderSync(from, to) {
    fs.mkdirSync(to, { recursive: true });
    fs.readdirSync(from).forEach(element => {
        const fromPath = path.join(from, element);
        const toPath = path.join(to, element);
        if (fs.lstatSync(fromPath).isFile()) {
            fs.copyFileSync(fromPath, toPath);
            console.log(`Copied file: ${fromPath} to ${toPath}`);
        } else if (fs.lstatSync(fromPath).isDirectory()) {
            copyFolderSync(fromPath, toPath);
            console.log(`Copied directory: ${fromPath} to ${toPath}`);
        }
    });
}

// Funktion zum Überschreiben der CSS-Konfiguration in nuxt.config.ts
function updateNuxtConfig(configPath, additionalCssFiles) {
    let configContent = fs.readFileSync(configPath, 'utf8');
    const cssSection = `css: [${additionalCssFiles.map(file => `'${file}'`).join(', ')}]`;
    configContent = configContent.replace(/css: \[.*?\]/s, cssSection);

    fs.writeFileSync(configPath, configContent, 'utf8');
    console.log(`Updated nuxt.config.ts with CSS files: ${additionalCssFiles.join(', ')}`);
}

// Funktion zum Umbenennen von DOM-Tags mit nuxt:name Attribut
function renameNuxtTags(htmlContent) {
    let $ = cheerio.load(htmlContent, { xmlMode: true, decodeEntities: false });

    let hasNuxtName = true;

    while (hasNuxtName) {
        hasNuxtName = false;

        $('[nuxt\\:name]').each((i, el) => {
            hasNuxtName = true;
            const nuxtName = $(el).attr('nuxt:name');
            if (nuxtName) {
                const tagName = el.tagName;
                $(el).removeAttr('nuxt:name');
                const attrs = $(el).attr();
                const content = $(el).html();
                let startTag = `<${nuxtName}`;
                Object.keys(attrs).forEach(attr => {
                    startTag += ` ${attr}="${attrs[attr]}"`;
                });
                startTag += '>';
                const renamedElementHtml = `${startTag}${content}</${nuxtName}>`;
                $(el).replaceWith(renamedElementHtml);
            }
        });

        // Aktualisieren der HTML-Inhalte
        const updatedHtml = $.html();
        $ = cheerio.load(updatedHtml, { xmlMode: true, decodeEntities: false });
    }

    return $.html();
}

// Funktion zum Einbetten von CSS in die Vue-Komponente
function embedCssInComponent(componentPath, cssContent, cssFilePath) {
    let componentContent = '';
    if (fs.existsSync(componentPath)) {
        componentContent = fs.readFileSync(componentPath, 'utf8');
    } else {
        fs.mkdirSync(path.dirname(componentPath), { recursive: true });
        componentContent = `<template></template>`;
    }

    const $ = cheerio.load(componentContent, { xmlMode: true, decodeEntities: false });

    const styleTag = `<style scoped>\n${cssContent}\n</style>`;
    if ($('style[scoped]').length > 0) {
        $('style[scoped]').replaceWith(styleTag);
    } else {
        $('template').after(styleTag);
    }

    fs.writeFileSync(componentPath, $.html(), 'utf8');
    console.log(`Embedded CSS into component: ${componentPath}`);
    usedAssets.push(cssFilePath);
}

// Funktion zum Extrahieren von Vue-Komponenten aus HTML-Dateien
// Funktion zum Extrahieren von Vue-Komponenten aus HTML-Dateien
function extractVueComponents(htmlDir, targetDir) {
    console.log(`Extracting Vue components from HTML files in ${htmlDir} to ${targetDir}`);
    fs.readdirSync(htmlDir).forEach(file => {
        if (file.endsWith('.html')) {
            const filePath = path.join(htmlDir, file);
            let fileContent = fs.readFileSync(filePath, 'utf8');

            // Umbenennen der DOM-Tags mit nuxt:name Attribut
            fileContent = renameNuxtTags(fileContent);

            const componentRegex = /<!-- Start: (.*?) -->[\s\S]*?<!-- End: \1 -->/g;
            let match;
            while ((match = componentRegex.exec(fileContent)) !== null) {
                const componentPath = match[1].trim();
                if (componentPath.endsWith('.vue')) {
                    const componentContent = match[0]
                        .replace(`<!-- Start: ${componentPath} -->`, '')
                        .replace(`<!-- End: ${componentPath} -->`, '')
                        .trim();

                    console.log(`Extracted component: ${componentPath}`);
                    const fullComponentPath = path.join(targetDir, componentPath);
                    fs.mkdirSync(path.dirname(fullComponentPath), { recursive: true });

                    // Überprüfen und Einfügen des passenden CSS
                    const cssPath = path.join(exportCssDir, componentPath.replace('.vue', '.css'));
                    const scssCompiledPath = path.join(exportCssDir, componentPath.replace('.vue', '.compiled.css'));

                    console.log(`Checking CSS files: ${cssPath}, ${scssCompiledPath}`);

                    let cssContent = '';
                    let usedCssPath = '';

                    if (fs.existsSync(cssPath)) {
                        cssContent = fs.readFileSync(cssPath, 'utf8');
                        usedCssPath = cssPath;
                    } else if (fs.existsSync(scssCompiledPath)) {
                        cssContent = fs.readFileSync(scssCompiledPath, 'utf8');
                        usedCssPath = scssCompiledPath;
                    }

                    if (fs.existsSync(fullComponentPath)) {
                        // Datei existiert, <template> und <style scoped> Inhalt überschreiben
                        let existingContent = fs.readFileSync(fullComponentPath, 'utf8');
                        const $ = cheerio.load(existingContent, { xmlMode: true, decodeEntities: false });

                        // Template ersetzen
                        if ($('template').length > 0) {
                            $('template').html(`\n${componentContent}\n`);
                        } else {
                            $('body').append(`<template>\n${componentContent}\n</template>`);
                        }

                        // Style scoped ersetzen oder hinzufügen
                        const styleTag = `<style scoped>\n${cssContent}\n</style>`;
                        if ($('style[scoped]').length > 0) {
                            $('style[scoped]').replaceWith(styleTag);
                        } else if (cssContent) {
                            $('template').after(styleTag);
                        }

                        fs.writeFileSync(fullComponentPath, $.html(), 'utf8');
                        console.log(`Updated existing component: ${fullComponentPath}`);
                    } else {
                        // Datei existiert nicht, neue Datei erstellen
                        let newContent = `<template>\n${componentContent}\n</template>`;
                        if (cssContent) {
                            newContent += `\n<style scoped>\n${cssContent}\n</style>`;
                        }
                        fs.writeFileSync(fullComponentPath, newContent, 'utf8');
                        console.log(`Created new component: ${fullComponentPath}`);
                    }

                    // CSS-Datei zur Liste der verwendeten Assets hinzufügen
                    if (usedCssPath) {
                        usedAssets.push(usedCssPath);
                    }
                }
            }
        }
    });
}


// Funktion zum Löschen der ausgeschlossenen Assets im Zielverzeichnis
function deleteExcludedAssets(dir, exclude) {
    fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.lstatSync(filePath).isFile() && exclude.includes(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Deleted excluded file: ${filePath}`);
        } else if (fs.lstatSync(filePath).isDirectory()) {
            deleteExcludedAssets(filePath, exclude);
        }
    });
}

function main() {
    // Extrahieren von Vue-Komponenten aus HTML-Dateien
    if (fs.existsSync(exportDir)) {
        extractVueComponents(exportDir, componentsDir);
    } else {
        console.log(`${exportDir} does not exist.`);
    }

    // Kopieren des assets-Ordners
    const bootstrapAssetsDir = path.join(exportDir, '..', 'autisten-info-bootstrap', 'assets');
    if (fs.existsSync(bootstrapAssetsDir)) {
        copyFolderSync(bootstrapAssetsDir, destDir);
        console.log("Copying assets completed.");

        // Konvertieren der Pfade in usedAssets in die Zielverzeichnisstruktur
        const adjustedUsedAssets = usedAssets.map(assetPath => {
            return assetPath.replace(
                path.join(exportDir, '..', 'autisten-info-bootstrap', 'assets'),
                destDir
            );
        });

        // Löschen der ausgeschlossenen Assets im Zielverzeichnis
        console.log(adjustedUsedAssets);
        deleteExcludedAssets(destDir, adjustedUsedAssets);
    } else {
        console.log(`${bootstrapAssetsDir} does not exist.`);
    }

    // Verbleibende CSS-Dateien zur Nuxt-Konfiguration hinzufügen
    const remainingCssFiles = [];
    function collectRemainingCss(dir) {
        fs.readdirSync(dir).forEach(file => {
            const filePath = path.join(dir, file);
            if (fs.lstatSync(filePath).isFile() && filePath.endsWith('.css') && !usedAssets.includes(filePath)) {
                remainingCssFiles.push(`@/assets/${path.relative(destDir, filePath).replace(/\\/g, '/')}`);
            } else if (fs.lstatSync(filePath).isDirectory()) {
                collectRemainingCss(filePath);
            }
        });
    }
    collectRemainingCss(destDir);

    if

 (fs.existsSync(nuxtConfigPath)) {
        updateNuxtConfig(nuxtConfigPath, remainingCssFiles);
    } else {
        console.log(`${nuxtConfigPath} does not exist.`);
    }
}

// Skript ausführen
main();