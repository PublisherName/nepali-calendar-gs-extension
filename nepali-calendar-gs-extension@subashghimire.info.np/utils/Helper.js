import GLib from 'gi://GLib';

export const readJsonFile = (filePath, extensionPath) => {
  try {
    const fullPath = `${extensionPath}/${filePath}`;
    const fileContent = GLib.file_get_contents(fullPath)[1];
    const decoder = new TextDecoder('utf-8');
    const jsonString = decoder.decode(fileContent);
    return JSON.parse(jsonString);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error reading JSON file: ${filePath}`, error.message);
    return {};
  }
};

export const convertToNepaliNumber = (number) => {
  return number
    .toString()
    .split('')
    .map((num) => '०१२३४५६७८९'[num])
    .join('');
};
