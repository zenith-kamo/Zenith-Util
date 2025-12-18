// ==UserScript==
// @name         Zenith Util
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Modular utilities for wplace.live.
// @author       Zenith
// @match        https://wplace.live/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=wplace.live
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==
(function () {
    'use strict';

    const CONFIG = {
        storageKey: 'zenith_util_config_v2',
        targetContainerSelector: 'div.flex.flex-col.items-center.gap-3'
    };

    const ICONS = {
        gear: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
        back: `<span>← Back</span>`
    };

    const STYLES = `
        #zenith-settings-btn {
            background-color: #2d3748; color: white; border: none; cursor: pointer;
            transition: transform 0.1s; display: inline-flex; justify-content: center; align-items: center;
        }
        #zenith-settings-btn:hover { transform: scale(1.05); }

        #zenith-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0, 0, 0, 0.75); z-index: 9999;
            display: flex; justify-content: center; align-items: center;
            font-family: 'Segoe UI', sans-serif; backdrop-filter: blur(4px);
        }

        #zenith-modal-container {
            width: 850px; height: 600px; background: #1a202c;
            border-radius: 12px; display: flex; overflow: hidden;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5); color: #e2e8f0;
        }
        .zenith-sidebar {
            width: 220px; background: #2d3748; padding: 20px 0;
            display: flex; flex-direction: column; flex-shrink: 0;
        }
        .zenith-title {
            padding: 0 24px 24px; font-size: 1.4em; font-weight: bold; color: #63b3ed;
        }
        .zenith-nav-item {
            padding: 14px 24px; cursor: pointer; font-weight: 500; transition: all 0.2s;
        }
        .zenith-nav-item:hover { background: #4a5568; }
        .zenith-nav-item.active {
            background: #2b6cb0; border-left: 4px solid #90cdf4; color: white;
        }

        .zenith-content {
            flex: 1; padding: 30px; overflow-y: auto; position: relative; display: flex; flex-direction: column;
        }
        .zenith-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .zenith-close-btn {
            background: none; border: none; font-size: 28px; color: #a0aec0; cursor: pointer;
            position: absolute; top: 15px; right: 25px; line-height: 1;
        }
        .zenith-close-btn:hover { color: white; }
        .zenith-search-bar {
            width: 100%; padding: 12px; border-radius: 6px; border: 1px solid #4a5568;
            background: #2d3748; color: white; margin-bottom: 24px; font-size: 1em;
        }
        .zenith-plugin-grid {
            display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px;
        }

        .zenith-module-card {
            background: #2d3748; border-radius: 8px; padding: 16px;
            position: relative; border: 1px solid #4a5568;
            height: 160px; overflow: hidden; display: flex; flex-direction: column;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .zenith-card-header {
            display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; z-index: 2;
        }
        .zenith-icon-btn {
            cursor: pointer; color: #a0aec0; padding: 4px; border-radius: 4px; transition: 0.2s;
        }
        .zenith-icon-btn:hover { color: #63b3ed; background: rgba(255,255,255,0.05); }

        .zenith-module-title { font-weight: bold; font-size: 1.1em; color: white; margin-bottom: 4px; z-index: 2; }
        .zenith-module-desc { font-size: 0.85em; color: #cbd5e0; flex-grow: 1; z-index: 2; }

        .zenith-settings-overlay {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background: #2d3748; z-index: 10; padding: 16px;
            transform: translateY(100%); transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex; flex-direction: column;
        }
        .zenith-settings-overlay.visible { transform: translateY(0); }

        .zenith-overlay-header {
            display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #4a5568;
            padding-bottom: 10px; margin-bottom: 10px; flex-shrink: 0;
        }
        .zenith-back-link {
            cursor: pointer; color: #63b3ed; font-size: 0.9em; font-weight: bold;
        }
        .zenith-back-link:hover { text-decoration: underline; }

        /* Scrollable Settings Area */
        .zenith-settings-scroll {
            flex: 1; overflow-y: auto; padding-right: 6px;
        }
        .zenith-settings-scroll::-webkit-scrollbar { width: 5px; }
        .zenith-settings-scroll::-webkit-scrollbar-track { background: transparent; }
        .zenith-settings-scroll::-webkit-scrollbar-thumb { background: #4a5568; border-radius: 10px; }
        .zenith-settings-scroll::-webkit-scrollbar-thumb:hover { background: #718096; }

        .zenith-setting-row {
            display: flex; justify-content: space-between; align-items: center;
            margin-bottom: 12px; font-size: 0.9em; min-height: 28px;
        }
        .zenith-label { color: #e2e8f0; }
        
        .zenith-input-text, .zenith-input-number {
            background: #1a202c; border: 1px solid #4a5568; color: white;
            padding: 4px 8px; border-radius: 4px; font-size: 0.9em; text-align: right;
        }
        .zenith-input-text { width: 100px; }
        .zenith-input-number { width: 70px; }
        .zenith-input-text:focus, .zenith-input-number:focus { border-color: #63b3ed; outline: none; }

        .zenith-switch { position: relative; display: inline-block; width: 40px; height: 22px; flex-shrink: 0; }
        .zenith-switch input { opacity: 0; width: 0; height: 0; }
        .zenith-slider {
            position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
            background-color: #4a5568; transition: .3s; border-radius: 34px;
        }
        .zenith-slider:before {
            position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px;
            background-color: white; transition: .3s; border-radius: 50%;
        }
        input:checked + .zenith-slider { background-color: #48bb78; }
        input:checked + .zenith-slider:before { transform: translateX(18px); }
        .zenith-input-color {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            width: 40px;
            height: 24px;
            background: #1a202c;
            border: 1px solid #4a5568;
            border-radius: 4px;
            cursor: pointer;
            padding: 2px;
            flex-shrink: 0;
        }
        
        .zenith-input-color::-webkit-color-swatch-wrapper {
            padding: 0;
        }
        
        .zenith-input-color::-webkit-color-swatch {
            border: none;
            border-radius: 2px;
        }
        
        .zenith-input-color::-moz-color-swatch {
            border: none;
            border-radius: 2px;
        }

        .zenith-input-color:focus {
            border-color: #63b3ed;
            outline: none;
        }
    `;

    GM_addStyle(STYLES);

    class PluginManager {
        constructor() {
            this.plugins = [];
            this.state = JSON.parse(localStorage.getItem(CONFIG.storageKey)) || {};
        }

        register(plugin) {
            this.plugins.push(plugin);
            if (!this.state[plugin.id]) {
                this.state[plugin.id] = { enabled: false, config: plugin.defaultConfig || {} };
            }
        }

        save() {
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(this.state));
            this.applyAll();
        }

        applyAll() {
            this.plugins.forEach(p => {
                const s = this.state[p.id];
                if (s.enabled && p.onEnable) {
                    p.onEnable(s.config);
                } else if (!s.enabled && p.onDisable) {
                    p.onDisable();
                }
            });
        }
    }

    const manager = new PluginManager();

    const UI = {
        row(label, element) {
            const div = document.createElement('div');
            div.className = 'zenith-setting-row';
            const span = document.createElement('span');
            span.className = 'zenith-label';
            span.textContent = label;
            div.append(span, element);
            return div;
        },
        switch(checked, onChange) {
            const label = document.createElement('label');
            label.className = 'zenith-switch';
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = checked;
            input.onchange = (e) => onChange(e.target.checked);
            const slider = document.createElement('span');
            slider.className = 'zenith-slider';
            label.append(input, slider);
            return label;
        },
        number(value, onChange) {
            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'zenith-input-number';
            input.value = value;
            input.onchange = (e) => onChange(parseFloat(e.target.value));
            return input;
        },
        text(value, onChange) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'zenith-input-text';
            input.value = value || '';
            input.onchange = (e) => onChange(e.target.value);
            return input;
        },
        color(value, onChange) {
            const input = document.createElement('input');
            input.type = 'color';
            input.className = 'zenith-input-color';
            input.value = value || '#000000';
            input.onchange = (e) => onChange(e.target.value);
            return input;
        }
    };
    manager.register({
        id: 'no_ui',
        name: 'No UI',
        description: 'Remove cluttered UI elements.',
        defaultConfig: {
            noZoomText: false,
            noToast: false,
        },
        observer: null,

        renderSettings: (config, update) => {
            const container = document.createElement('div');
            container.appendChild(UI.row(
                'No "Zoom in to see pixels"',
                UI.switch(config.noZoomText, val => update('noZoomText', val))
            ));
            container.appendChild(UI.row(
                'No Toast Notifications',
                UI.switch(config.noToast, val => update('noToast', val))
            ));

            return container;
        },

        onEnable: (config) => {
            const removeZoomText = () => {
                if (!config.noZoomText) return;
                const selector = 'button.btn.sm\\:btn-lg.duration.text-nowrap.text-xs.transition-opacity.sm\\:text-base';
                const el = document.querySelector(selector);
                if (el) el.style.display = 'none';
            };
            const removeToast = () => {
                if (!config.noToast) return;
                const section = document.querySelector('section[aria-label="Notifications alt+T"]');
                if (section) {
                    const ol = section.querySelector('ol');
                    if (ol) ol.style.display = 'none';
                }
            };

            removeZoomText();
            removeToast();

            const ThisModule = manager.plugins.find(p => p.id === 'no_ui');
            if (!ThisModule.observer) {
                ThisModule.observer = new MutationObserver(() => {
                    removeZoomText();
                    removeToast();
                });
                ThisModule.observer.observe(document.body, { childList: true, subtree: true });
            }
        },

        onDisable: () => {
            const ThisModule = manager.plugins.find(p => p.id === 'no_ui');
            if (ThisModule.observer) {
                ThisModule.observer.disconnect();
                ThisModule.observer = null;
            }

            const zoomSelector = 'button.btn.sm\\:btn-lg.duration.text-nowrap.text-xs.transition-opacity.sm\\:text-base';
            const zoomEl = document.querySelector(zoomSelector);
            if (zoomEl) zoomEl.style.display = '';

            const section = document.querySelector('section[aria-label="Notifications alt+T"]');
            if (section) {
                const ol = section.querySelector('ol');
                if (ol) ol.style.display = '';
            }
        }
    });

    manager.register({
        id: 'change_color',
        name: 'Change Color',
        description: 'Customize theme colors.',
        defaultConfig: {
            buttonColor: '#ffffff',
            buttonBackgroundColor: '#f2f7fe',
            primaryButtonColor: '#0069ff',
            primaryFontColor: '#ffffff',
            levelColor: '#463aa2',
            uiBackgroundColor: '#ffffff',
            uiSecondaryBackgroundColor: '#e3e9f4'
        },

        renderSettings: (config, update) => {
            const container = document.createElement('div');

            container.appendChild(UI.row(
                'Button Color',
                UI.color(config.buttonColor, val => update('buttonColor', val))
            ));
            container.appendChild(UI.row(
                'Button Background Color',
                UI.color(config.buttonBackgroundColor, val => update('buttonBackgroundColor', val))
            ));

            container.appendChild(UI.row(
                'Primary Button Color',
                UI.color(config.primaryButtonColor, val => update('primaryButtonColor', val))
            ));

            container.appendChild(UI.row(
                'Primary Font Color',
                UI.color(config.primaryFontColor, val => update('primaryFontColor', val))
            ));
            container.appendChild(UI.row(
                'Level Color',
                UI.color(config.levelColor, val => update('levelColor', val))
            ));
            container.appendChild(UI.row(
                'UI Background Color',
                UI.color(config.uiBackgroundColor, val => update('uiBackgroundColor', val))
            ));
            container.appendChild(UI.row(
                'UI Secondary Background Color',
                UI.color(config.uiSecondaryBackgroundColor, val => update('uiSecondaryBackgroundColor', val))
            ));


            return container;
        },

        onEnable: (config) => {
            const root = document.documentElement;
            if (config.buttonColor) {
                root.style.setProperty('--color-base-content', config.buttonColor);
            }
            if (config.buttonBackgroundColor) {
                root.style.setProperty('--color-base-200', config.buttonBackgroundColor);
            }
            if (config.primaryButtonColor) {
                root.style.setProperty('--color-primary', config.primaryButtonColor);
            }
            if (config.primaryFontColor) {
                root.style.setProperty('--color-primary-content', config.primaryFontColor);
            }
            if (config.levelColor) {
                root.style.setProperty('--color-secondary', config.levelColor);
            }
            if (config.uiBackgroundColor) {
                root.style.setProperty('--color-base-100', config.uiBackgroundColor);
            }
            if (config.uiSecondaryBackgroundColor) {
                root.style.setProperty('--color-base-300', config.uiSecondaryBackgroundColor);
            }
        },
        onDisable: () => {
            const root = document.documentElement;
            root.style.removeProperty('--color-base-content');
            root.style.removeProperty('--color-base-200');   
            root.style.removeProperty('--color-primary');
            root.style.removeProperty('--color-primary-content');
            root.style.removeProperty('--color-secondary');
            root.style.removeProperty('--color-base-100');
            root.style.removeProperty('--color-base-300');
        }
    });

    function renderPluginsPage(contentEl) {
        contentEl.innerHTML = `
            <div class="zenith-header"><h2>Plugins</h2></div>
            <input type="text" class="zenith-search-bar" placeholder="Search plugins..." id="z-search">
            <div class="zenith-plugin-grid" id="z-grid"></div>
        `;

        const grid = contentEl.querySelector('#z-grid');
        const search = contentEl.querySelector('#z-search');

        const renderGrid = (filter = '') => {
            grid.innerHTML = '';
            manager.plugins.forEach(plugin => {
                if (!plugin.name.toLowerCase().includes(filter.toLowerCase())) return;

                const state = manager.state[plugin.id];

                const card = document.createElement('div');
                card.className = 'zenith-module-card';

                card.innerHTML = `
                    <div class="zenith-card-header">
                        <div class="zenith-icon-btn gear-btn" title="Settings">${ICONS.gear}</div>
                        <div class="toggle-container"></div>
                    </div>
                    <div class="zenith-module-title">${plugin.name}</div>
                    <div class="zenith-module-desc">${plugin.description}</div>
                    
                    <div class="zenith-settings-overlay">
                        <div class="zenith-overlay-header">
                            <span class="zenith-back-link">← Back</span>
                            <span style="font-size:0.9em; color:#a0aec0;">| ${plugin.name} Settings</span>
                        </div>
                        <div class="zenith-settings-scroll"></div>
                    </div>
                `;
                const toggleSwitch = UI.switch(state.enabled, (val) => {
                    state.enabled = val;
                    manager.save();
                });
                card.querySelector('.toggle-container').appendChild(toggleSwitch);

                const overlay = card.querySelector('.zenith-settings-overlay');
                const scrollArea = card.querySelector('.zenith-settings-scroll');
                const gearBtn = card.querySelector('.gear-btn');
                const backBtn = card.querySelector('.zenith-back-link');

                gearBtn.onclick = () => overlay.classList.add('visible');
                backBtn.onclick = () => overlay.classList.remove('visible');

                if (plugin.renderSettings) {
                    const settingsContent = plugin.renderSettings(state.config, (key, value) => {
                        state.config[key] = value;
                        manager.save();
                    });
                    scrollArea.appendChild(settingsContent);
                } else {
                    scrollArea.innerHTML = '<div style="text-align:center; padding-top:20px; color:#718096;">No settings available</div>';
                }

                grid.appendChild(card);
            });
        };

        renderGrid();
        search.oninput = (e) => renderGrid(e.target.value);
    }

    function renderImportExportPage(contentEl) {
        contentEl.innerHTML = `
            <div class="zenith-header"><h2>Import / Export</h2></div>
            <p style="margin-bottom:10px; color:#cbd5e0;">Backup or restore your configuration JSON.</p>
            <textarea style="width:100%; height:200px; background:#1a202c; color:white; border:1px solid #4a5568; padding:10px; border-radius:6px; font-family:monospace;" id="z-io"></textarea>
            <div style="margin-top:15px; display:flex; gap:10px;">
                <button class="btn btn-sm" id="z-exp" style="background:#48bb78; color:white; border:none; padding:8px 16px; border-radius:4px; cursor:pointer;">Export</button>
                <button class="btn btn-sm" id="z-imp" style="background:#4299e1; color:white; border:none; padding:8px 16px; border-radius:4px; cursor:pointer;">Import</button>
            </div>
        `;

        const textarea = contentEl.querySelector('#z-io');
        contentEl.querySelector('#z-exp').onclick = () => {
            textarea.value = localStorage.getItem(CONFIG.storageKey);
        };
        contentEl.querySelector('#z-imp').onclick = () => {
            try {
                const data = JSON.parse(textarea.value);
                localStorage.setItem(CONFIG.storageKey, JSON.stringify(data));
                manager.state = data;
                manager.applyAll();
                alert('Config imported successfully!');
            } catch (e) {
                alert('Invalid JSON.');
            }
        };
    }

    function openSettings() {
        if (document.getElementById('zenith-modal-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'zenith-modal-overlay';

        const container = document.createElement('div');
        container.id = 'zenith-modal-container';

        const sidebar = document.createElement('div');
        sidebar.className = 'zenith-sidebar';
        sidebar.innerHTML = `<div class="zenith-title">Zenith Util</div>`;

        const content = document.createElement('div');
        content.className = 'zenith-content';
        const closeBtn = document.createElement('button');
        closeBtn.className = 'zenith-close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => overlay.remove();
        content.appendChild(closeBtn);

        const tabs = [
            { id: 'plugins', label: 'Plugins', render: renderPluginsPage },
            { id: 'impexp', label: 'Import/Export', render: renderImportExportPage }
        ];

        let activeTab = 'plugins';

        const renderSidebar = () => {
            const items = sidebar.querySelectorAll('.zenith-nav-item');
            items.forEach(i => i.remove());

            tabs.forEach(tab => {
                const item = document.createElement('div');
                item.className = `zenith-nav-item ${activeTab === tab.id ? 'active' : ''}`;
                item.textContent = tab.label;
                item.onclick = () => {
                    activeTab = tab.id;
                    renderSidebar();
                    while (content.childNodes.length > 1) content.removeChild(content.lastChild);
                    tab.render(content);
                };
                sidebar.appendChild(item);
            });
        };

        container.append(sidebar, content);
        overlay.appendChild(container);
        document.body.appendChild(overlay);

        renderSidebar();
        tabs[0].render(content);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });
    }


    function ensureButtonExists() {
        const target = document.querySelector(CONFIG.targetContainerSelector);
        if (target && !document.getElementById('zenith-settings-btn')) {
            const btn = document.createElement('button');
            btn.id = 'zenith-settings-btn';
            btn.className = 'btn btn-square';
            btn.title = 'Zenith Settings';
            btn.innerHTML = ICONS.gear;
            btn.onclick = openSettings;
            target.appendChild(btn);
            console.log('[Zenith Util] Button injected.');
        }
    }

    function init() {
        ensureButtonExists();
        manager.applyAll();

        const observer = new MutationObserver((mutations) => {
            ensureButtonExists();
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();