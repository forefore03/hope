// Preview never imports the live controller or its personal-data storage.
if(new URLSearchParams(location.search).get('preview')==='1')await import('./preview.mjs?v=resume-3.1');
else await import('./app.mjs?v=resume-3.1');

// Install offline shell in the background; never force a running round to reload.
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'}).catch(()=>{});
