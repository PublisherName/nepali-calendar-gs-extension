#!/bin/bash

cd nepali-calendar-gs-extension@subashghimire.info.np

glib-compile-schemas ../nepali-calendar-gs-extension@subashghimire.info.np/schemas

zip -r ../nepali-calendar-gs-extension@subashghimire.info.np.zip *.js metadata.json stylesheet.css data/*.json utils/*.js schemas/*