// Preview never imports the live controller or its personal-data storage.
if(new URLSearchParams(location.search).get('preview')==='1')await import('./preview.mjs?v=lazy-20261112');
else await import('./app.mjs?v=lazy-20261112');
