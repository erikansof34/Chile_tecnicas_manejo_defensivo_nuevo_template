export function init() {
  loadIframe({
    id: 'Slide2-5Web',
    src: 'https://iframe.mediadelivery.net/embed/448139/f5071e8d-3360-4f8e-ae86-514791b14169?autoplay=false&loop=false&muted=false&preload=true&responsive=true',
    className: 'iframe-video-horizontal-web',
    style: 'width: 40vw; height: 50vh; min-height: 300px;',
  });

  loadIframe({
    id: "Slide2-5Mobile",
    src: "https://iframe.mediadelivery.net/embed/448139/f5071e8d-3360-4f8e-ae86-514791b14169?autoplay=false&loop=false&muted=false&preload=true&responsive=true",
    className: "iframe-video-vertical-mobil",
    style: "width: 20vw; height: 70vh; min-height: 300px;"
  });

}
