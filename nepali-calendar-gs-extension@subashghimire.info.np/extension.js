import GObject from 'gi://GObject';
import GLib from 'gi://GLib';
import St from 'gi://St';
import Clutter from 'gi://Clutter';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import {
  Extension,
  gettext as _, // eslint-disable-line no-unused-vars
} from 'resource:///org/gnome/shell/extensions/extension.js';

import {
  formatNepaliDateData,
  getCurrentNepaliDate,
} from './utils/NepaliDateConverter.js';

const Indicator = GObject.registerClass(
  class Indicator extends PanelMenu.Button {
    _init(extensionPath) {
      super._init(0.0, 'Nepali Date Extension');
      this._updateTimeout = null;
      this._extensionPath = extensionPath;
      this._box = new St.BoxLayout({
        style_class: 'panel-status-menu-box',
      });
      this._nepaliDateLabel = new St.Label({
        text: '',
        y_align: Clutter.ActorAlign.CENTER,
        style_class: 'top-bar-date-label',
      });
      this._box.add_child(this._nepaliDateLabel);
      this.add_child(this._box);
      this._createPopupMenu();
      this._updateLabel();
    }

    _createPopupMenu() {
      const popupContainer = new St.BoxLayout({
        vertical: true,
        style_class: 'custom-popup-container',
      });
      this._yearMonthLabel = new St.Label({
        text: '',
        style_class: 'year-month-label',
      });
      const dayDateContainer = new St.BoxLayout({
        style_class: 'day-date-circle',
        vertical: true,
        x_align: Clutter.ActorAlign.CENTER,
      });
      this._dayLabel = new St.Label({
        text: '',
        style_class: 'day-label',
      });
      this._dateLabel = new St.Label({
        text: '',
        style_class: 'date-label',
      });
      dayDateContainer.add_child(this._dayLabel);
      dayDateContainer.add_child(this._dateLabel);
      this._englishDateLabel = new St.Label({
        text: '',
        style_class: 'english-date-label',
      });
      this._tithiLabel = new St.Label({
        text: '',
        style_class: 'tithi-label',
      });
      this._eventLabel = new St.Label({
        text: '',
        style_class: 'event-label',
      });

      popupContainer.add_child(this._yearMonthLabel);
      popupContainer.add_child(dayDateContainer);
      popupContainer.add_child(this._englishDateLabel);
      popupContainer.add_child(this._tithiLabel);
      popupContainer.add_child(this._eventLabel);

      const customItem = new PopupMenu.PopupBaseMenuItem({
        reactive: false,
      });
      customItem.add_style_class_name('custom-popup-item');
      customItem.actor.add_child(popupContainer);
      this.menu.addMenuItem(customItem);
    }

    _updateLabel() {
      const nepaliDateInfo = formatNepaliDateData(
        getCurrentNepaliDate(),
        this._extensionPath
      );
      this._nepaliDateLabel.set_text(
        `${nepaliDateInfo.nepaliDay} ${nepaliDateInfo.nepaliMonth} (${nepaliDateInfo.nepaliDayOfWeek})`
      );

      this._yearMonthLabel.set_text(
        `${nepaliDateInfo.nepaliYear} ${nepaliDateInfo.nepaliMonth}`
      );
      this._dayLabel.set_text(nepaliDateInfo.nepaliDayOfWeek);
      this._dateLabel.set_text(nepaliDateInfo.nepaliDay);
      this._englishDateLabel.set_text(nepaliDateInfo.englishDate);
      this._tithiLabel.set_text(nepaliDateInfo.nepaliTithi);
      this._eventLabel.set_text(
        nepaliDateInfo.nepaliEvent.split('/').join('\n')
      );

      this._scheduleMidnightUpdate();
    }

    _scheduleMidnightUpdate() {
      const SECONDS_PER_DAY = 86400;
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const timeUntilMidnight = (midnight - now) / 1000;

      if (this._updateTimeout) {
        GLib.source_remove(this._updateTimeout);
      }
      try {
        this._updateTimeout = GLib.timeout_add_seconds(
          GLib.PRIORITY_DEFAULT,
          timeUntilMidnight,
          () => {
            this._updateLabel();
            this._dailyUpdateTimeout = GLib.timeout_add_seconds(
              GLib.PRIORITY_DEFAULT,
              SECONDS_PER_DAY,
              () => {
                this._updateLabel();
                return GLib.SOURCE_CONTINUE;
              }
            );
            return GLib.SOURCE_REMOVE;
          }
        );
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to setup update timer:', error);
      }
    }

    destroy() {
      if (this._updateTimeout) {
        GLib.source_remove(this._updateTimeout);
        this._updateTimeout = null;
      }

      if (this._dailyUpdateTimeout) {
        GLib.source_remove(this._dailyUpdateTimeout);
        this._dailyUpdateTimeout = null;
      }

      super.destroy();
    }
  }
);

export default class NepaliCalendar extends Extension {
  constructor(metadata) {
    super(metadata);
    this._extension = null;
    this._positionChangedId = null;
  }

  enable() {
    this._settings = this.getSettings();
    const position = this._settings.get_string('menu-position');

    this._extension = new Indicator(this.path, position);
    this._addToPanel(position);

    this._positionChangedId = this._settings.connect(
      'changed::menu-position',
      () => {
        const newPosition = this._settings.get_string('menu-position');
        this._moveIndicator(newPosition);
      }
    );
  }

  disable() {
    if (this._positionChangedId) {
      this._settings.disconnect(this._positionChangedId);
      this._positionChangedId = null;
    }

    if (this._settings) {
      this._settings.run_dispose();
      this._settings = null;
    }

    if (this._extension) {
      this._removeFromPanel();
      this._extension.destroy();
      this._extension = null;
    }
  }

  _moveIndicator(newPosition) {
    this._removeFromPanel();
    this._addToPanel(newPosition);
  }

  _removeFromPanel() {
    const { container, menu } = this._extension;
    container?.get_parent()?.remove_child(container);
    Main.panel.menuManager.removeMenu(menu);
  }

  _addToPanel(position) {
    const positionMap = {
      left: Main.panel._leftBox,
      center: Main.panel._centerBox,
      right: Main.panel._rightBox,
    };

    const panelPosition = positionMap[position];
    panelPosition.insert_child_at_index(this._extension.container, -1);
    Main.panel.menuManager.addMenu(this._extension.menu);
  }
}
