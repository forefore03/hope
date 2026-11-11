// Preview never imports the live controller or its personal-data storage.
if(new URLSearchParams(location.search).get('preview')==='1')await import('./preview.mjs?v=preview-20261111');
else await import('./app.mjs?v=verthill-20261111');
