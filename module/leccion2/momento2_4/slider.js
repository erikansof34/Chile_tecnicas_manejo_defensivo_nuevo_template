export function init() {
  loadIframe({
    id: 'Slide2-4Web',
    src: 'https://iframe.mediadelivery.net/embed/450631/bae78faa-6f69-4a99-832d-afaaf94561ac?autoplay=false&loop=false&muted=false&preload=true&responsive=true',
    className: 'iframe-video-vertical-web',
    style: 'width: 20vw; height: 80vh; min-height: 300px;',
  });

  loadIframe({
    id: "Slide2-4Mobile",
    src: "https://iframe.mediadelivery.net/embed/450631/bae78faa-6f69-4a99-832d-afaaf94561ac?autoplay=false&loop=false&muted=false&preload=true&responsive=true",
    className: "iframe-video-vertical-mobil",
    style: "width: 20vw; height: 70vh; min-height: 300px;"
  });

}
