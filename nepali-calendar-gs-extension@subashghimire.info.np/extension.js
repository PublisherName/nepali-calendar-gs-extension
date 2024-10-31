import GObject from 'gi://GObject';
import GLib from 'gi://GLib';
import St from 'gi://St';
import Clutter from 'gi://Clutter';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";

const Indicator = GObject.registerClass(
    class Indicator extends PanelMenu.Button {
        _init() {
            super._init(0.0, 'Nepali Date Extension');

            this._timeout = null;

            // Container for top bar display (Nepali Date and Day of the Week)
            this._box = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
            this._nepaliDateLabel = new St.Label({
                text: '',
                y_align: Clutter.ActorAlign.CENTER,
                style_class: 'top-bar-date-label'
            });
            this._box.add_child(this._nepaliDateLabel);
            this.add_child(this._box);

            // Initialize the popup menu
            this._createPopupMenu();

            // Initial update for date and time
            this._updateLabel();

            // Add to GNOME Shell panel
            Main.panel.addToStatusArea('nepali-date-extension', this);
        }

        _createPopupMenu() {
            // Create custom container for popup with vertical layout
            let popupContainer = new St.BoxLayout({
                vertical: true,
                style_class: 'custom-popup-container'
            });

            // Year and Month Label
            this._yearMonthLabel = new St.Label({ text: '', style_class: 'year-month-label' });

            // Day and Date in Circle
            let dayDateContainer = new St.BoxLayout({
                style_class: 'day-date-circle',
                vertical: true,
                x_align: Clutter.ActorAlign.CENTER
            });
            this._dayLabel = new St.Label({ text: '', style_class: 'day-label' });
            this._dateLabel = new St.Label({ text: '', style_class: 'date-label' });
            dayDateContainer.add_child(this._dayLabel);
            dayDateContainer.add_child(this._dateLabel);

            // English Date Label
            this._englishDateLabel = new St.Label({ text: '', style_class: 'english-date-label' });

            // Tithi and Event Labels
            this._tithiLabel = new St.Label({ text: '', style_class: 'tithi-label' });
            this._eventLabel = new St.Label({ text: '', style_class: 'event-label' });

            // Adding elements to popup container in order
            popupContainer.add_child(this._yearMonthLabel);
            popupContainer.add_child(dayDateContainer);
            popupContainer.add_child(this._englishDateLabel);
            popupContainer.add_child(this._tithiLabel);
            popupContainer.add_child(this._eventLabel);

            // Wrap container in PopupBaseMenuItem and add to menu
            let customItem = new PopupMenu.PopupBaseMenuItem({ reactive: false });
            customItem.actor.add_child(popupContainer);
            this.menu.addMenuItem(customItem);
        }

        _updateLabel() {
            let nepaliDateInfo = this._getNepaliDate();

            // Update top bar label with Nepali Date and Day of the Week
            this._nepaliDateLabel.set_text(`${nepaliDateInfo.nepaliDate}  ${nepaliDateInfo.day} (${nepaliDateInfo.dayOfWeek})`);

            // Update popup menu content
            this._yearMonthLabel.set_text(nepaliDateInfo.nepaliDate);
            this._dayLabel.set_text(nepaliDateInfo.dayOfWeek);
            this._dateLabel.set_text(nepaliDateInfo.day);
            this._englishDateLabel.set_text(nepaliDateInfo.englishDate);
            this._tithiLabel.set_text(nepaliDateInfo.tithi);
            this._eventLabel.set_text(nepaliDateInfo.event);

            // Update label every hour
            if (this._timeout) GLib.source_remove(this._timeout);
            this._timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 3600, () => {
                this._updateLabel();
                return GLib.SOURCE_CONTINUE;
            });
        }

        _getNepaliDate() {
            // Replace with real API call
            return {
                nepaliDate: "२०८१ कार्तिक",
                dayOfWeek: "शुक्रवार",
                day: "२३",
                englishDate: "Nov 08, 2024",
                tithi: "कार्तिक शुक्ल सप्तमी",
                event: "विश्व रेडियोग्राफी दिवस (World Radiography Day)"
            };
        }

        destroy() {
            // Remove timeout if it exists
            if (this._timeout) {
                GLib.source_remove(this._timeout);
                this._timeout = null;
            }

            // Destroy the Indicator
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
