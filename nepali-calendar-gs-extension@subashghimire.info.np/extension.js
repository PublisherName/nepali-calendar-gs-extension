import GObject from 'gi://GObject';
import GLib from 'gi://GLib';
import St from 'gi://St';
import Clutter from 'gi://Clutter';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";

import { formatExtractData, getNepaliDate } from "./utils/NepaliDateConverter.js"

const Indicator = GObject.registerClass(
    class Indicator extends PanelMenu.Button {
        _init() {
            super._init(0.0, 'Nepali Date Extension');
            this._timeout = null;
            this._box = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
            this._nepaliDateLabel = new St.Label({
                text: '',
                y_align: Clutter.ActorAlign.CENTER,
                style_class: 'top-bar-date-label'
            });
            this._box.add_child(this._nepaliDateLabel);
            this.add_child(this._box);
            this._createPopupMenu();
            this._updateLabel();
            Main.panel.addToStatusArea('nepali-date-extension', this);
        }

        _createPopupMenu() {
            let popupContainer = new St.BoxLayout({
                vertical: true,
                style_class: 'custom-popup-container'
            });
            this._yearMonthLabel = new St.Label({ text: '', style_class: 'year-month-label' });
            let dayDateContainer = new St.BoxLayout({
                style_class: 'day-date-circle',
                vertical: true,
                x_align: Clutter.ActorAlign.CENTER
            });
            this._dayLabel = new St.Label({ text: '', style_class: 'day-label' });
            this._dateLabel = new St.Label({ text: '', style_class: 'date-label' });
            dayDateContainer.add_child(this._dayLabel);
            dayDateContainer.add_child(this._dateLabel);
            this._englishDateLabel = new St.Label({ text: '', style_class: 'english-date-label' });
            this._tithiLabel = new St.Label({ text: '', style_class: 'tithi-label' });
            this._eventLabel = new St.Label({ text: '', style_class: 'event-label' });

            popupContainer.add_child(this._yearMonthLabel);
            popupContainer.add_child(dayDateContainer);
            popupContainer.add_child(this._englishDateLabel);
            popupContainer.add_child(this._tithiLabel);
            popupContainer.add_child(this._eventLabel);

            let customItem = new PopupMenu.PopupBaseMenuItem({ reactive: false });
            customItem.add_style_class_name('custom-popup-item');
            customItem.actor.add_child(popupContainer);
            this.menu.addMenuItem(customItem);
        }

        _updateLabel() {
            let nepaliDateInfo = formatExtractData(getNepaliDate());

            this._nepaliDateLabel.set_text(`${nepaliDateInfo.npDay} ${nepaliDateInfo.npMonth} (${nepaliDateInfo.npDayName})`);

            this._yearMonthLabel.set_text(`${nepaliDateInfo.npYear} ${nepaliDateInfo.npMonth}`);
            this._dayLabel.set_text(nepaliDateInfo.npDayName);
            this._dateLabel.set_text(nepaliDateInfo.npDay);
            this._englishDateLabel.set_text(nepaliDateInfo.enDate);
            this._tithiLabel.set_text(nepaliDateInfo.npTithi);
            this._eventLabel.set_text(nepaliDateInfo.npEvent.split('/').join('\n'));

            if (this._timeout) GLib.source_remove(this._timeout);
            this._timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 3600, () => {
                this._updateLabel();
                return GLib.SOURCE_CONTINUE;
            });
        }

        destroy() {
            if (this._timeout) {
                GLib.source_remove(this._timeout);
                this._timeout = null;
            }
            super.destroy();
        }
    });

export default class NepaliCalendar extends Extension {
    constructor(metadata) {
        super(metadata);
        this._extension = null;
    }

    enable() {
        this._extension = new Indicator();
    }

    disable() {
        if (this._extension) {
            this._extension.destroy();
            this._extension = null;
        }
    }
}
