import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

Gio._promisify(Gio.File.prototype, 'load_contents_async');

export const readJsonFileAsync = (filePath, extensionPath) => {
  return new Promise((resolve) => {
    const fullPath = GLib.build_filenamev([extensionPath, filePath]);
    const file = Gio.File.new_for_path(fullPath);

    file
      .load_contents_async(null)
      .then(([contents]) => {
        const decoder = new TextDecoder('utf-8');
        const jsonString = decoder.decode(contents);
        resolve(JSON.parse(jsonString));
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(`Error reading JSON file: ${filePath}`, error.message);
        resolve({});
      });
  });
};

export const convertToNepaliNumber = (number) => {
  return number
    .toString()
    .split('')
    .map((num) => '०१२३४५६७८९'[num])
    .join('');
};
