import {
  ExtensionPreferences,
  gettext as _,
} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';

export default class NepaliCalendarPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    this.settings = this.getSettings();
    const page = new Adw.PreferencesPage({
      title: _('General'),
      icon_name: 'dialog-information-symbolic',
    });
    window.add(page);

    const group = new Adw.PreferencesGroup({
      title: _('Appearance'),
      description: _('Configure the appearance of the extension'),
    });
    page.add(group);

    const positionOptions = [
      { id: 'left', label: 'Left' },
      { id: 'center', label: 'Center' },
      { id: 'right', label: 'Right' },
    ];

    const positionComboRow = new Adw.ComboRow({
      title: 'Date Position',
      subtitle: 'Select where to place the Nepali Calendar menu on the panel',
    });

    const stringList = new Gtk.StringList();
    positionOptions.forEach((option) => stringList.append(option.label));

    positionComboRow.set_model(stringList);

    // Set the initial selected item based on the current setting
    const currentPosition = this.settings.get_string('menu-position');
    const activeIndex = positionOptions.findIndex(
      (option) => option.id === currentPosition
    );
    positionComboRow.set_selected(activeIndex !== -1 ? activeIndex : 0);

    // Update the setting when the selection changes
    positionComboRow.connect('notify::selected', (combo) => {
      const selectedOption = positionOptions[combo.selected];
      this.settings.set_string('menu-position', selectedOption.id);
    });

    group.add(positionComboRow);

    window._settings = this.settings;
    window._settings.bind(
      'menu-position',
      positionComboRow,
      'active',
      Gio.SettingsBindFlags.DEFAULT
    );
  }
}
