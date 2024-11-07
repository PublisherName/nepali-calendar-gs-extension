#!/bin/bash

glib-compile-schemas ./nepali-calendar-gs-extension@subashghimire.info.np/schemas

if (( $EUID == 0 )); then
	INSTALL_DIR="/usr/share/gnome-shell/extensions"
else
	INSTALL_DIR="$HOME/.local/share/gnome-shell/extensions"
fi
mkdir -p $INSTALL_DIR

echo "Installing extension files in $INSTALL_DIR/nepali-calendar-gs-extension@subashghimire.info.np"
cp -r nepali-calendar-gs-extension@subashghimire.info.np $INSTALL_DIR

echo "Done."
exit 0
