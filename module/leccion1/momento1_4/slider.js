export function init() {
  loadIframe({
    id: 'Slide1-4Web',
    src: 'https://iframe.mediadelivery.net/embed/450631/198d8d1c-cbcf-483f-a030-cd94e9893671?autoplay=true&loop=false&muted=false&preload=true&responsive=true',
    className: 'iframe-video-vertical-web',
    style: 'width: 20vw; height: 80vh; min-height: 300px;',
  });

  loadIframe({
    id: "Slide1-4Mobile",
    src: "https://iframe.mediadelivery.net/embed/450631/198d8d1c-cbcf-483f-a030-cd94e9893671?autoplay=true&loop=false&muted=false&preload=true&responsive=true",
    className: "iframe-video-vertical-mobil",
    style: "width: 20vw; height: 70vh; min-height: 300px;"
  });

}
