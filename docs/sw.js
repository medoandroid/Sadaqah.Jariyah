/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-afac4cd2'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "19ca3a12506a8de67c98566a133664aa"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "83423f508744d8c356768edc9d160412"
  }, {
    "url": "pwa-512x512.png",
    "revision": "ec18b85ef4ff58422189a2ae9948343e"
  }, {
    "url": "pwa-192x192.png",
    "revision": "2d9d56faa26a9fa051fe19055ea0dab1"
  }, {
    "url": "index.html",
    "revision": "fd319f0aed1c4faac98a6460c0c113b6"
  }, {
    "url": "icon.svg",
    "revision": "284a485e7db5229b984547a4bfbf77c8"
  }, {
    "url": "favicon.ico",
    "revision": "5acae55c0e8b8b0a7430b79a9ffbad56"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "5acae55c0e8b8b0a7430b79a9ffbad56"
  }, {
    "url": "assets/shield-lE4usyUM.js",
    "revision": null
  }, {
    "url": "assets/share-2-brT3ECug.js",
    "revision": null
  }, {
    "url": "assets/rolldown-runtime-hePW80VL.js",
    "revision": null
  }, {
    "url": "assets/purify.es-Bvo9QlJ8.js",
    "revision": null
  }, {
    "url": "assets/plus-DPLSRO8Y.js",
    "revision": null
  }, {
    "url": "assets/minimize-2-DTpMu9of.js",
    "revision": null
  }, {
    "url": "assets/jspdf.es.min-BcmlD0uy.js",
    "revision": null
  }, {
    "url": "assets/index.es-nnnJ4k1l.js",
    "revision": null
  }, {
    "url": "assets/index-DLLaDX6V.js",
    "revision": null
  }, {
    "url": "assets/index-ClmZXpHo.css",
    "revision": null
  }, {
    "url": "assets/html2canvas-pro.esm-C3QBfBe-.js",
    "revision": null
  }, {
    "url": "assets/html2canvas-Dn6bw578.js",
    "revision": null
  }, {
    "url": "assets/dedicationService-ByRLXcJy.js",
    "revision": null
  }, {
    "url": "assets/circle-check-big-CNpJdbhO.js",
    "revision": null
  }, {
    "url": "assets/chevron-up-6LwgAqnx.js",
    "revision": null
  }, {
    "url": "assets/bookmark-TZiefl6S.js",
    "revision": null
  }, {
    "url": "assets/TasbeehPage-CQdDQe_J.js",
    "revision": null
  }, {
    "url": "assets/RuqyahPage-Cun2c7tG.js",
    "revision": null
  }, {
    "url": "assets/RecitationsPage-Bd-B_TBZ.js",
    "revision": null
  }, {
    "url": "assets/QuranPage-B-JC2mvU.js",
    "revision": null
  }, {
    "url": "assets/PersonsPage-TgRmii0i.js",
    "revision": null
  }, {
    "url": "assets/PersonalDuaPage-BeU9uFSe.js",
    "revision": null
  }, {
    "url": "assets/PaperMushafPage-iYkEeCrV.js",
    "revision": null
  }, {
    "url": "assets/KhatmahPage-C_MdsrHe.js",
    "revision": null
  }, {
    "url": "assets/HadithPage-DoMEbi6f.js",
    "revision": null
  }, {
    "url": "assets/DuasPage-B9urASSx.js",
    "revision": null
  }, {
    "url": "assets/DedicationsPage-BjyerBxK.js",
    "revision": null
  }, {
    "url": "assets/CustomSelect-CSdYN58L.js",
    "revision": null
  }, {
    "url": "assets/AyahShareModal-C5jehtMl.js",
    "revision": null
  }, {
    "url": "assets/AsmaAlHusnaPage-2ko2EmdM.js",
    "revision": null
  }, {
    "url": "assets/AdhkarPage-B-bF-Q0f.js",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "5acae55c0e8b8b0a7430b79a9ffbad56"
  }, {
    "url": "favicon.ico",
    "revision": "5acae55c0e8b8b0a7430b79a9ffbad56"
  }, {
    "url": "icon.svg",
    "revision": "284a485e7db5229b984547a4bfbf77c8"
  }, {
    "url": "manifest.webmanifest",
    "revision": "e8656f6bee1e9cf24417e2362bcd189e"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("/Sadaqah.Jariyah/index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/api\.alquran\.cloud\/v1\/.*/i, new workbox.CacheFirst({
    "cacheName": "quran-api-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 200,
      maxAgeSeconds: 7776000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/cdn\.jsdelivr\.net\/gh\/GovarJabbar\/Quran-PNG.*/i, new workbox.CacheFirst({
    "cacheName": "quran-pages-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 650,
      maxAgeSeconds: 7776000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/(raw\.githubusercontent\.com|android\.quran\.com)\/.*/i, new workbox.CacheFirst({
    "cacheName": "quran-images-fallback-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 200,
      maxAgeSeconds: 7776000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/(everyayah\.com|cdn\.islamic\.network|server\d+\.mp3quran\.net)\/.*/i, new workbox.CacheFirst({
    "cacheName": "quran-audio-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 80,
      maxAgeSeconds: 2592000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
